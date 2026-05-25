import fs from 'fs'
import path from 'path'
import { chromium } from 'playwright'

export function getUserDataDir() {
  return process.env.CHATGPT_USER_DATA_DIR || path.join(process.cwd(), '.chatgpt/browser-profile')
}

export function getSessionMarkerPath() {
  return path.join(getUserDataDir(), '.session-ready')
}

export function isChatGptConfigured() {
  return fs.existsSync(getUserDataDir()) && fs.existsSync(getSessionMarkerPath())
}

export function markSessionReady() {
  fs.mkdirSync(getUserDataDir(), { recursive: true })
  fs.writeFileSync(getSessionMarkerPath(), new Date().toISOString())
}

export function clearSessionMarker() {
  const marker = getSessionMarkerPath()
  if (fs.existsSync(marker)) fs.unlinkSync(marker)
}

function getHeadlessPreference(options = {}) {
  if (typeof options.headless === 'boolean') return options.headless
  return process.env.CHATGPT_HEADLESS !== 'false'
}

function allowHeadedFallback() {
  return process.env.CHATGPT_HEADED_FALLBACK === 'true'
}

export async function launchChatGptContext(options = {}) {
  const userDataDir = getUserDataDir()
  fs.mkdirSync(userDataDir, { recursive: true })

  const headless = getHeadlessPreference(options)

  return chromium.launchPersistentContext(userDataDir, {
    headless,
    channel: process.env.CHATGPT_BROWSER_CHANNEL || 'chrome',
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-first-run',
      '--no-default-browser-check',
    ],
    ignoreDefaultArgs: ['--enable-automation'],
    viewport: { width: 1400, height: 900 },
    locale: 'pt-BR',
    userAgent:
      process.env.CHATGPT_USER_AGENT ||
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  })
}

export async function isCloudflareChallenge(page) {
  const title = await page.title().catch(() => '')
  if (/just a moment|cloudflare|attention required/i.test(title)) return true

  const text = await page.locator('body').innerText().catch(() => '')
  return /verify you are human|confirm you are human|confirme que você é humano|não é um robô|not a robot/i.test(
    text
  )
}

export async function tryClickCloudflareCheckbox(page) {
  const frames = page.frames()
  for (const frame of frames) {
    const url = frame.url()
    if (!url.includes('cloudflare') && !url.includes('challenges')) continue

    const checkbox = frame.locator('input[type="checkbox"], .ctp-checkbox-label, label').first()
    if (await checkbox.count()) {
      await checkbox.click({ timeout: 5000 }).catch(() => {})
      await page.waitForTimeout(4000)
      return true
    }
  }

  const turnstile = page.locator('iframe[src*="challenges.cloudflare.com"]').first()
  if (await turnstile.count()) {
    const frame = page.frameLocator('iframe[src*="challenges.cloudflare.com"]').first()
    await frame.locator('body').click({ timeout: 5000 }).catch(() => {})
    await page.waitForTimeout(4000)
    return true
  }

  return false
}

export async function resolveCloudflareIfPresent(page) {
  if (!(await isCloudflareChallenge(page))) return false
  await tryClickCloudflareCheckbox(page)
  console.log('Aguardando verificação Cloudflare/captcha...')
  await page.waitForTimeout(3000)
  return true
}

export async function waitForCloudflare(page, timeoutMs = 300000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    if (!(await isCloudflareChallenge(page))) return
    await resolveCloudflareIfPresent(page)
  }

  throw new Error(
    'Cloudflare/captcha não resolvido. Rode uma vez: CHATGPT_HEADLESS=false npm run chatgpt:auth'
  )
}

export async function findPromptBox(page) {
  await page.waitForTimeout(1500)
  const selectors = [
    '#prompt-textarea',
    'div.ProseMirror[contenteditable="true"]',
    'textarea[data-id="root"]',
    'div#prompt-textarea',
    '[contenteditable="true"][id="prompt-textarea"]',
    'textarea[placeholder*="Message"]',
    'textarea[placeholder*="Mensagem"]',
    'textarea[placeholder*="Pergunte"]',
    'div[contenteditable="true"][data-placeholder]',
    '[placeholder="Pergunte alguma coisa"]',
  ]
  for (const sel of selectors) {
    const loc = page.locator(sel).first()
    if (await loc.count()) {
      try {
        if (await loc.isVisible({ timeout: 500 })) return loc
      } catch {
        /* try next */
      }
    }
  }
  throw new Error('Campo de prompt não encontrado.')
}

export async function hasAuthBlocker(page) {
  const modal = page.locator('#modal-no-auth-new-chat, [data-testid="modal-no-auth-new-chat"]')
  return modal.isVisible().catch(() => false)
}

export async function getAuthState(page) {
  if (await isCloudflareChallenge(page)) return 'cloudflare'
  if (await hasAuthBlocker(page)) return 'guest'

  const guestHeader = page.locator(
    'button:has-text("Entrar"), button:has-text("Cadastre-se"), button:has-text("Sign up"), button:has-text("Log in"), a:has-text("Log in")'
  )
  if (await guestHeader.first().isVisible().catch(() => false)) return 'guest'

  const url = page.url()
  if (/auth\.openai\.com|auth\/login|log-in|signin/i.test(url)) return 'guest'

  const chatHistory = page.locator('[data-testid="history-item"], a[href^="/c/"]')
  if (await chatHistory.first().isVisible().catch(() => false)) return 'logged_in'

  const headerProfile = page.locator('[data-testid="profile-button"]')
  if (await headerProfile.first().isVisible().catch(() => false)) return 'logged_in'

  // Logado: sem botões de visitante e com campo de prompt
  if (url.includes('chatgpt.com') && !url.includes('auth')) {
    try {
      await findPromptBox(page)
      return 'logged_in'
    } catch {
      /* ainda carregando */
    }
  }

  return 'unknown'
}

export async function isChatLoggedIn(page) {
  return (await getAuthState(page)) === 'logged_in'
}

export async function needsLogin(page) {
  const state = await getAuthState(page)
  return state === 'guest' || state === 'cloudflare' || state === 'unknown'
}

async function pickGoogleAccount(page, email) {
  const account = page.locator(`div[data-email="${email}"], [data-identifier="${email}"]`).first()
  if (await account.isVisible().catch(() => false)) {
    await account.click({ force: true })
    return true
  }
  return false
}

function get2faCodePath() {
  return path.join(process.cwd(), '.chatgpt', '2fa-code.txt')
}

function get2faPendingPath() {
  return path.join(process.cwd(), '.chatgpt', 'pending-2fa.json')
}

async function getGoogleChallengeType(page) {
  const url = page.url()
  if (/challenge\/totp|challenge\/ipp|challenge\/iap|challenge\/sk/i.test(url)) return 'code'
  if (/challenge\/dp|challenge\/dpt|challenge\/wa/i.test(url)) return 'device'

  const text = await page.locator('body').innerText().catch(() => '')
  if (/enter the code|digite o código|verification code|código de verificação|Google Authenticator/i.test(text)) {
    return 'code'
  }
  if (/check your|confira seu|notification on|notificação no|gmail app/i.test(text)) return 'device'

  return url.includes('/challenge/') ? 'device' : null
}

async function waitFor2FACodeFile(timeoutMs = 600000) {
  const envCode = process.env.CHATGPT_2FA_CODE?.trim().replace(/\s/g, '')
  if (envCode) return envCode

  const codePath = get2faCodePath()
  fs.mkdirSync(path.dirname(codePath), { recursive: true })
  if (fs.existsSync(codePath)) fs.unlinkSync(codePath)

  fs.writeFileSync(
    get2faPendingPath(),
    JSON.stringify({ waiting: true, at: new Date().toISOString() }, null, 2)
  )

  console.log('')
  console.log('=== AGUARDANDO_2FA ===')
  console.log('Google pediu código de verificação.')
  console.log('Informe o código aqui no chat do Cursor.')
  console.log('O assistente usa: npm run chatgpt:2fa -- SEU_CODIGO')
  console.log('======================')
  console.log('')

  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    if (fs.existsSync(codePath)) {
      const code = fs.readFileSync(codePath, 'utf8').trim().replace(/\s/g, '')
      fs.unlinkSync(codePath)
      if (fs.existsSync(get2faPendingPath())) fs.unlinkSync(get2faPendingPath())
      if (code) return code
    }
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  throw new Error('Timeout aguardando código 2FA.')
}

async function submitGoogle2FACode(page, code) {
  const input = page.locator(
    'input[type="tel"], input[name="totpPin"], input[id="totpPin"], input[autocomplete="one-time-code"], input[aria-label*="code"], input[aria-label*="código"]'
  ).first()
  await input.waitFor({ state: 'visible', timeout: 30000 })
  await input.fill('')
  await input.fill(code)
  await page
    .locator('#totpNext button, button:has-text("Next"), button:has-text("Avançar"), button:has-text("Próxima")')
    .first()
    .click({ force: true })
  await page.waitForTimeout(4000)
}

async function waitForGoogleChallengeComplete(page, timeoutMs = 300000) {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const type = await getGoogleChallengeType(page)
    if (!type) return
    if (type === 'device') {
      console.log('Aguardando aprovação no celular/app Google...')
    }
    await page.waitForTimeout(3000)
  }
}

async function handleGoogle2FAChallenge(page) {
  const type = await getGoogleChallengeType(page)
  if (!type) return

  if (type === 'code') {
    const code = await waitFor2FACodeFile()
    console.log('Código 2FA recebido, enviando ao Google...')
    await submitGoogle2FACode(page, code)
    await waitForGoogleChallengeComplete(page)
    return
  }

  console.log('')
  console.log('=== AGUARDANDO_2FA ===')
  console.log('Aprove o login no celular ou app Google.')
  console.log('======================')
  console.log('')
  await waitForGoogleChallengeComplete(page, 600000)
}

async function resolveGoogleAuthFlow(page, email) {
  const deadline = Date.now() + 600000

  while (Date.now() < deadline) {
    if (page.url().includes('chatgpt.com') && !page.url().includes('auth')) return

    const challenge = await getGoogleChallengeType(page)
    if (challenge) {
      await handleGoogle2FAChallenge(page)
      continue
    }

    if (page.url().includes('accounts.google.com') && (await pickGoogleAccount(page, email))) {
      await page.waitForTimeout(2000)
      continue
    }

    const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Continuar")').first()
    if (await continueBtn.isVisible().catch(() => false)) {
      await continueBtn.click({ force: true })
      await page.waitForTimeout(2000)
      continue
    }

    if (!page.url().includes('accounts.google.com') && !page.url().includes('auth.openai.com')) {
      await page.waitForTimeout(2000)
      continue
    }

    await page.waitForTimeout(2000)
  }

  throw new Error('Timeout no fluxo Google OAuth / 2FA.')
}

function getPasswordCandidates(fallback) {
  const raw =
    process.env.CHATGPT_PASSWORDS ||
    process.env.CHATGPT_PASSWORD ||
    process.env.CHATGPT_GOOGLE_PASSWORD ||
    fallback

  if (!raw) return []

  const fromEnv = raw.includes(',')
    ? raw.split(',').map(value => value.trim()).filter(Boolean)
    : [raw.trim()]

  const base = fromEnv[0].replace(/^[\.*]+/, '')
  const extras = [base, `.${base}`, `*${base}`].filter(value => !fromEnv.includes(value))

  return [...new Set([...fromEnv, ...extras])]
}

async function isGooglePasswordWrong(page) {
  const text = await page.locator('body').innerText().catch(() => '')
  return /wrong password|senha incorreta|incorrect password|senha errada|couldn.t sign you in/i.test(text)
}

async function submitGooglePassword(page, password) {
  const passwordInput = page.locator('input[type="password"], input[name="Passwd"]').first()
  await passwordInput.waitFor({ state: 'visible', timeout: 45000 })
  await passwordInput.fill('')
  await passwordInput.fill(password)
  await page
    .locator('#passwordNext button, button:has-text("Next"), button:has-text("Avançar"), button:has-text("Próxima")')
    .first()
    .click({ force: true })
  await page.waitForTimeout(3500)
}

async function completeGoogleLogin(page, email) {
  await page.waitForURL(/accounts\.google\.com/, { timeout: 90000 })

  if (await pickGoogleAccount(page, email)) {
    await page.waitForTimeout(3000)
    return
  }

  const emailInput = page.locator('input[type="email"], input[name="identifier"]').first()
  if (await emailInput.isVisible().catch(() => false)) {
    await emailInput.fill(email)
    await page
      .locator('#identifierNext button, button:has-text("Next"), button:has-text("Avançar"), button:has-text("Próxima")')
      .first()
      .click({ force: true })
    await page.waitForTimeout(2000)
  }

  const passwords = getPasswordCandidates()
  if (!passwords.length) {
    throw new Error('Defina CHATGPT_PASSWORD ou CHATGPT_PASSWORDS no .env')
  }

  let loggedIn = false
  for (let i = 0; i < passwords.length; i++) {
    if (!(await page.locator('input[type="password"], input[name="Passwd"]').first().isVisible().catch(() => false))) {
      loggedIn = true
      break
    }

    console.log(`Tentando senha Google (${i + 1}/${passwords.length})...`)
    await submitGooglePassword(page, passwords[i])

    const challenge = await getGoogleChallengeType(page)
    if (challenge) {
      await handleGoogle2FAChallenge(page)
      loggedIn = true
      break
    }

    if (await isGooglePasswordWrong(page)) {
      if (i === passwords.length - 1) {
        throw new Error('Nenhuma senha Google funcionou. Confira CHATGPT_PASSWORDS no .env.')
      }
      continue
    }

    loggedIn = true
    break
  }

  if (await pickGoogleAccount(page, email)) {
    await page.waitForTimeout(2000)
  }

  if (!loggedIn && (await page.locator('input[type="password"]').first().isVisible().catch(() => false))) {
    throw new Error('Nenhuma senha Google funcionou. Confira CHATGPT_PASSWORDS no .env.')
  }
}

async function goToAuthLogin(page) {
  await page.goto('https://chatgpt.com/auth/login?next=%2F', {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  })
  await resolveCloudflareIfPresent(page)
}

export async function loginWithGoogle(page) {
  const email = process.env.CHATGPT_EMAIL || process.env.CHATGPT_GOOGLE_EMAIL
  const passwords = getPasswordCandidates()

  if (!email || !passwords.length) {
    throw new Error('Defina CHATGPT_EMAIL e CHATGPT_PASSWORD(S) no .env')
  }

  if (await isChatLoggedIn(page)) return

  const state = await getAuthState(page)
  if (state === 'logged_in') return

  console.log('Fazendo login Google no ChatGPT...')
  console.log('Estado atual:', state)

  await goToAuthLogin(page)

  const googleBtn = page.locator(
    'button:has-text("Continue with Google"), button:has-text("Continuar com Google"), button[data-provider="google"], button:has-text("Google")'
  ).first()

  await googleBtn.waitFor({ state: 'visible', timeout: 60000 })
  await googleBtn.click({ force: true })

  await completeGoogleLogin(page, email)
  await resolveGoogleAuthFlow(page, email)

  const continueBtn = page.locator('button:has-text("Continue"), button:has-text("Continuar")').first()
  if (await continueBtn.isVisible().catch(() => false)) {
    await continueBtn.click({ force: true })
  }

  if (!page.url().includes('chatgpt.com')) {
    await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded', timeout: 120000 })
  }

  const started = Date.now()
  while (Date.now() - started < 120000) {
    const state = await getAuthState(page)
    if (state === 'logged_in') break

    if (state === 'guest' && (await hasAuthBlocker(page))) {
      const modalLogin = page
        .locator(
          '#modal-no-auth-new-chat button:has-text("Log in"), #modal-no-auth-new-chat button:has-text("Entrar")'
        )
        .first()
      if (await modalLogin.isVisible().catch(() => false)) {
        await modalLogin.click({ force: true })
        await page.waitForTimeout(2000)
      }
    }

    if (/auth\.openai\.com|auth\/login|log-in|signin/i.test(page.url())) {
      const btn = page
        .locator(
          'button:has-text("Continue with Google"), button:has-text("Continuar com Google"), button[data-provider="google"]'
        )
        .first()
      if (await btn.isVisible().catch(() => false)) {
        await btn.click({ force: true })
        await completeGoogleLogin(page, email).catch(() => {})
      }
    }

    await page.waitForTimeout(2000)
  }

  if (!(await isChatLoggedIn(page))) {
    throw new Error(
      'ChatGPT não autenticou (ainda aparece Entrar/Cadastre-se). Rode: CHATGPT_HEADLESS=false npm run chatgpt:auth'
    )
  }

  console.log('Login Google concluído — perfil detectado.')
}

export async function waitForChatReady(page, timeoutMs = 300000) {
  const started = Date.now()

  while (Date.now() - started < timeoutMs) {
    if (await isCloudflareChallenge(page)) {
      await resolveCloudflareIfPresent(page)
      continue
    }
    if (await needsLogin(page)) {
      await loginWithGoogle(page)
      await page.waitForTimeout(3000)
      continue
    }

    if (await isChatLoggedIn(page)) {
      markSessionReady()
      return
    }

    const state = await getAuthState(page)
    if (state === 'unknown') {
      console.log('Estado de auth incerto, tentando login...')
      await loginWithGoogle(page)
      continue
    }

    await page.waitForTimeout(2000)
  }

  throw new Error('Timeout: chat não carregou após login/captcha.')
}

export async function openChatGptSession(options = {}) {
  const headless = getHeadlessPreference(options)
  let context = await launchChatGptContext({ headless })
  let page = context.pages()[0] || (await context.newPage())

  await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded', timeout: 120000 })

  try {
    await waitForChatReady(page)
    return { context, page }
  } catch (err) {
    if (!headless || !allowHeadedFallback()) throw err

    console.log('Headless falhou. CHATGPT_HEADED_FALLBACK=true — abrindo browser visível uma vez...')
    await context.close().catch(() => {})
    context = await launchChatGptContext({ headless: false })
    page = context.pages()[0] || (await context.newPage())
    await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded', timeout: 120000 })
    await waitForChatReady(page, 600000)
    await context.close().catch(() => {})

    context = await launchChatGptContext({ headless: true })
    page = context.pages()[0] || (await context.newPage())
    await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded', timeout: 120000 })
    await waitForChatReady(page)
    return { context, page }
  }
}
