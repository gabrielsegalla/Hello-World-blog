import fs from 'fs'
import {
  findPromptBox,
  launchChatGptContext,
  waitForChatReady,
} from './browser.mjs'

const context = await launchChatGptContext({ headless: false })
const page = context.pages()[0] || await context.newPage()
await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded', timeout: 120000 })
await waitForChatReady(page)

const prompt = 'Create one high quality square image (1024x1024). No text. Minimal dark tech illustration with purple accent.'
const box = await findPromptBox(page)
await box.click()
await box.fill(prompt)
await page.keyboard.press('Enter')

console.log('Prompt enviado. Aguardando 120s...')
await page.waitForTimeout(120000)

const dump = await page.evaluate(() => {
  const assistants = [...document.querySelectorAll('[data-message-author-role="assistant"]')]
  const last = assistants[assistants.length - 1]
  if (!last) return { text: 'no assistant message', imgs: [] }
  return {
    text: last.innerText?.slice(0, 800),
    imgs: [...last.querySelectorAll('img')].map(img => ({
      src: img.src?.slice(0, 120),
      w: img.naturalWidth || img.width,
      h: img.naturalHeight || img.height,
    })),
    allPageImgs: [...document.querySelectorAll('img')].filter(i => (i.naturalWidth||i.width) > 200).length,
  }
})

console.log(JSON.stringify(dump, null, 2))
await page.screenshot({ path: '/tmp/chatgpt-after-prompt.png', fullPage: true })
console.log('Screenshot: /tmp/chatgpt-after-prompt.png')
await context.close()
