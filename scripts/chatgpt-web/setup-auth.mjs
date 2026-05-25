#!/usr/bin/env node
/**
 * Login ChatGPT via Google + salva perfil persistente.
 * Uso: npm run chatgpt:auth
 */
import fs from 'fs'
import { getUserDataDir, launchChatGptContext, markSessionReady, waitForChatReady } from './browser.mjs'

async function main() {
  const userDataDir = getUserDataDir()
  fs.mkdirSync(userDataDir, { recursive: true })

  console.log('Perfil:', userDataDir)
  console.log('Headless:', process.env.CHATGPT_HEADLESS !== 'false')

  const headless = process.env.CHATGPT_HEADLESS !== 'false'
  let context = await launchChatGptContext({ headless })
  let page = context.pages()[0] || (await context.newPage())

  await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded', timeout: 120000 })

  try {
    await waitForChatReady(page)
  } catch (err) {
    if (headless && allowHeadedFallback()) {
      console.log('Headless falhou. CHATGPT_HEADED_FALLBACK=true — abrindo browser visível...')
      await context.close().catch(() => {})
      context = await launchChatGptContext({ headless: false })
      page = context.pages()[0] || (await context.newPage())
      await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded', timeout: 120000 })
      console.log('Resolva captcha/login no browser se aparecer.')
      await waitForChatReady(page, 600000)
    } else {
      throw err
    }
  }

  markSessionReady()
  await context.close()
  console.log('Sessão pronta (login verificado). Próximas execuções rodam em background.')
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
