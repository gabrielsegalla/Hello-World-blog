#!/usr/bin/env node
import fs from 'fs'
import { findPromptBox, openChatGptSession } from './browser.mjs'

const out = process.argv[2] || '/tmp/chatgpt-debug.json'
const { context, page } = await openChatGptSession()

const prompt =
  'Generate an image: minimal dark tech illustration, purple accent, square 1024x1024, no text, no watermark.'

const box = await findPromptBox(page)
await box.focus({ force: true }).catch(() => {})
await page.keyboard.type(prompt, { delay: 5 })
await page.keyboard.press('Enter')

console.log('Aguardando resposta (120s)...')
for (let i = 0; i < 24; i++) {
  await page.waitForTimeout(5000)
  const snap = await page.evaluate(() => {
    const assistants = [...document.querySelectorAll('[data-message-author-role="assistant"]')]
    const last = assistants[assistants.length - 1]
    const imgs = [...document.querySelectorAll('img')].map(img => ({
      src: (img.src || '').slice(0, 160),
      alt: img.alt?.slice(0, 80),
      w: img.naturalWidth || img.width,
      h: img.naturalHeight || img.height,
    }))
    return {
      url: location.href,
      title: document.title,
      assistantCount: assistants.length,
      lastText: last?.innerText?.slice(0, 1500) || null,
      imgs: imgs.filter(i => i.w > 50).slice(0, 20),
      buttons: [...document.querySelectorAll('button')]
        .map(b => b.textContent?.trim())
        .filter(t => t && /image|imagem|gerar|create|download|baixar/i.test(t))
        .slice(0, 10),
    }
  })
  console.log(`[${(i + 1) * 5}s] assistants=${snap.assistantCount} imgs=${snap.imgs.length}`)
  if (snap.lastText) console.log('text:', snap.lastText.slice(0, 200).replace(/\n/g, ' '))
  if (snap.imgs.some(i => i.w >= 200 && i.h >= 200)) break
}

const final = await page.evaluate(() => {
  const assistants = [...document.querySelectorAll('[data-message-author-role="assistant"]')]
  const last = assistants[assistants.length - 1]
  return {
    url: location.href,
    modelPicker: document.querySelector('[data-testid="model-switcher"], button[id*="model"]')?.textContent?.trim(),
    lastText: last?.innerText || null,
    imgs: [...document.querySelectorAll('img')].map(img => ({
      src: img.src,
      w: img.naturalWidth || img.width,
      h: img.naturalHeight || img.height,
    })),
  }
})

fs.writeFileSync(out, JSON.stringify(final, null, 2))
console.log('Debug salvo:', out)
await page.screenshot({ path: '/tmp/chatgpt-debug.png', fullPage: true })
console.log('Screenshot: /tmp/chatgpt-debug.png')
await context.close()
