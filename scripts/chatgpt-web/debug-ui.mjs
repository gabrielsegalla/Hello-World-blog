import fs from 'fs'
import path from 'path'
import { chromium } from 'playwright'

const storageState = process.env.CHATGPT_STORAGE_STATE || '.chatgpt/auth.json'

const browser = await chromium.launch({
  headless: false,
  channel: process.env.CHATGPT_BROWSER_CHANNEL || 'chrome',
})
const context = await browser.newContext({ storageState })
const page = await context.newPage()
await page.goto('https://chatgpt.com/', { waitUntil: 'domcontentloaded', timeout: 120000 })
await page.waitForTimeout(8000)

console.log('URL:', page.url())
console.log('Title:', await page.title())

const info = await page.evaluate(() => {
  const textareas = [...document.querySelectorAll('textarea')].map(el => ({
    id: el.id,
    placeholder: el.placeholder,
    name: el.name,
    visible: el.offsetParent !== null,
  }))
  const editables = [...document.querySelectorAll('[contenteditable="true"]')].map(el => ({
    id: el.id,
    tag: el.tagName,
    role: el.getAttribute('role'),
    visible: el.offsetParent !== null,
  }))
  return { textareas, editables, bodySnippet: document.body?.innerText?.slice(0, 500) }
})

console.log(JSON.stringify(info, null, 2))
await page.screenshot({ path: '/tmp/chatgpt-debug.png', fullPage: true })
console.log('Screenshot: /tmp/chatgpt-debug.png')

await browser.close()
