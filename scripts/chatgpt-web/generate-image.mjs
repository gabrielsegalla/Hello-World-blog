#!/usr/bin/env node
/**
 * Gambiarra: gera imagem usando o ChatGPT web (Plus) via Playwright.
 * Uso: node scripts/chatgpt-web/generate-image.mjs "prompt" output.png
 */
import fs from 'fs'
import {
  findPromptBox,
  getUserDataDir,
  isChatGptConfigured,
  openChatGptSession,
} from './browser.mjs'

const prompt = process.argv[2]
const outFile = process.argv[3]
const timeoutMs = Number(process.env.CHATGPT_IMAGE_TIMEOUT_MS || 180000)

if (!prompt || !outFile) {
  console.error('Uso: node generate-image.mjs "prompt" output.png')
  process.exit(1)
}

if (!isChatGptConfigured()) {
  console.error(`Perfil não encontrado: ${getUserDataDir()}`)
  console.error('Rode: npm run chatgpt:auth')
  process.exit(1)
}

async function startNewChat(page) {
  const newChatSelectors = [
    'a[href="/"]',
    'button:has-text("New chat")',
    'button:has-text("Novo chat")',
  ]
  for (const sel of newChatSelectors) {
    const btn = page.locator(sel).first()
    if (await btn.count()) {
      await btn.click().catch(() => {})
      await page.waitForTimeout(800)
      break
    }
  }
}

async function downloadAssistantImage(page) {
  const imageData = await page.evaluate(async () => {
    const assistants = [...document.querySelectorAll('[data-message-author-role="assistant"]')]
    const last = assistants[assistants.length - 1]
    if (!last) return null

    const imgs = [...last.querySelectorAll('img')].filter(img => {
      const w = img.naturalWidth || img.width
      const h = img.naturalHeight || img.height
      const src = img.src || ''
      if (src.includes('avatar') || src.includes('profile')) return false
      return w >= 200 && h >= 200
    })

    const img = imgs[imgs.length - 1]
    if (!img?.src) return null

    if (img.src.startsWith('blob:')) {
      const res = await fetch(img.src)
      const blob = await res.blob()
      const buffer = await blob.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let binary = ''
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
      return { type: 'b64', data: btoa(binary) }
    }

    return { type: 'url', data: img.src }
  })

  if (!imageData) throw new Error('Nenhuma imagem encontrada na resposta do ChatGPT')

  if (imageData.type === 'b64') {
    fs.writeFileSync(outFile, Buffer.from(imageData.data, 'base64'))
    return
  }

  const res = await page.request.get(imageData.data)
  fs.writeFileSync(outFile, await res.body())
}

async function fillPrompt(page, box, text) {
  await page.evaluate(el => {
    el.focus()
    el.textContent = ''
  }, await box.elementHandle())
  await box.focus({ force: true }).catch(() => {})
  await page.keyboard.type(text, { delay: 5 })
}

async function main() {
  const fullPrompt =
    `Generate an image. ${prompt}. Square 1024x1024, high quality, no text, no letters, no watermark.`

  const { context, page } = await openChatGptSession()

  try {
    if (page.url().includes('auth') || page.url().includes('login')) {
      throw new Error('Sessão expirada. Rode npm run chatgpt:auth de novo.')
    }

    await startNewChat(page)
    const box = await findPromptBox(page)
    await fillPrompt(page, box, fullPrompt)
    await page.keyboard.press('Enter')

    const started = Date.now()
    while (Date.now() - started < timeoutMs) {
      try {
        await page.waitForFunction(() => {
          const assistants = [...document.querySelectorAll('[data-message-author-role="assistant"]')]
          const last = assistants[assistants.length - 1]
          if (!last) return false
          return [...last.querySelectorAll('img')].some(img => {
            const w = img.naturalWidth || img.width
            const src = img.src || ''
            if (src.includes('avatar') || src.includes('profile')) return false
            return w >= 200
          })
        }, { timeout: 5000 })
        break
      } catch {
        await page.waitForTimeout(2000)
      }
    }

    if (Date.now() - started >= timeoutMs) {
      throw new Error('Timeout esperando imagem do ChatGPT')
    }

    await page.waitForTimeout(1500)
    await downloadAssistantImage(page)

    const bytes = fs.statSync(outFile).size
    console.log(`Imagem salva: ${outFile} (${bytes} bytes) via chatgpt-web`)
  } finally {
    await context.close()
  }
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
