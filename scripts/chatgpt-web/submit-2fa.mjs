#!/usr/bin/env node
/** Grava código 2FA enquanto npm run chatgpt:auth aguarda */
import fs from 'fs'
import path from 'path'

const code = process.argv[2]
if (!code) {
  console.error('Uso: npm run chatgpt:2fa -- 123456')
  process.exit(1)
}

const dir = path.join(process.cwd(), '.chatgpt')
fs.mkdirSync(dir, { recursive: true })
fs.writeFileSync(path.join(dir, '2fa-code.txt'), code.trim().replace(/\s/g, ''))
console.log('Código 2FA gravado. O login deve continuar automaticamente.')
