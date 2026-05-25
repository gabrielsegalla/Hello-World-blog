#!/usr/bin/env node
/**
 * Debug: envia prompt e salva screenshots em public/uploads/debug/
 */
import fs from 'fs'
import path from 'path'
import { findPromptBox, getAuthState, openChatGptSession } from './browser.mjs'

const prompt =
  process.argv[2] ||
  'Generate an image: minimal dark tech illustration, purple accent, square, no text.'
const debugDir = path.join(process.cwd(), 'public', 'uploads', 'debug')
fs.mkdirSync(debugDir, { recursive: true })

async function shot(page, name) {
  const file = path.join(debugDir, `${name}.png`)
  await page.screenshot({ path: file, fullPage: true })
  console.log('Screenshot:', file)
  return file
}

const headless = process.env.CHATGPT_HEADLESS !== 'false'
console.log('Headless:', headless)
console.log('Prompt:', prompt)

const { context, page } = await openChatGptSession({ headless })

try {
  await shot(page, '01-home')
  console.log('URL:', page.url())
  console.log('Auth state:', await getAuthState(page))

  const box = await findPromptBox(page)
  await box.focus({ force: true }).catch(() => {})
  await page.keyboard.type(prompt, { delay: 8 })

  const typed = await page.evaluate(() => {
    const el = document.querySelector('#prompt-textarea')
    return el?.textContent || el?.innerText || ''
  })
  console.log('Texto no campo:', typed.slice(0, 200))

  await shot(page, '02-prompt-preenchido')

  await page.keyboard.press('Enter')
  await page.waitForTimeout(3000)
  await shot(page, '03-apos-enter-3s')

  console.log('Aguardando 45s pela resposta...')
  await page.waitForTimeout(45000)
  await shot(page, '04-resposta-45s')

  const dump = await page.evaluate(() => {
    const assistants = [...document.querySelectorAll('[data-message-author-role="assistant"]')]
    const userMsgs = [...document.querySelectorAll('[data-message-author-role="user"]')]
    const lastUser = userMsgs[userMsgs.length - 1]
    const lastAssistant = assistants[assistants.length - 1]
    return {
      userCount: userMsgs.length,
      assistantCount: assistants.length,
      lastUserText: lastUser?.innerText?.slice(0, 500) || null,
      lastAssistantText: lastAssistant?.innerText?.slice(0, 800) || null,
      imgs: [...document.querySelectorAll('img')]
        .filter(i => (i.naturalWidth || i.width) > 100)
        .map(i => ({ src: i.src?.slice(0, 120), w: i.naturalWidth || i.width, h: i.naturalHeight || i.height })),
    }
  })

  console.log(JSON.stringify(dump, null, 2))
  fs.writeFileSync(path.join(debugDir, 'dump.json'), JSON.stringify(dump, null, 2))
} finally {
  await context.close()
}

console.log('Debug concluído. Veja public/uploads/debug/')
