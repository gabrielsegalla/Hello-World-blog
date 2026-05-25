import { spawn } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { generateCarouselImage as generateViaOpenAiApi } from '@/lib/openai'

export type ImageProvider = 'openai-api' | 'chatgpt-web'

export function getImageProvider(): ImageProvider {
  const value = process.env.IMAGE_PROVIDER || 'openai-api'
  if (value === 'chatgpt-web') return 'chatgpt-web'
  return 'openai-api'
}

function chatGptProfileReady(): boolean {
  const dir = process.env.CHATGPT_USER_DATA_DIR || path.join(process.cwd(), '.chatgpt/browser-profile')
  const marker = path.join(dir, '.session-ready')
  return fs.existsSync(dir) && fs.existsSync(marker)
}

function runChatGptWebScript(prompt: string, outFile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = path.join(process.cwd(), 'scripts/chatgpt-web/generate-image.mjs')
    const child = spawn(process.execPath, [script, prompt, outFile], {
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stderr = ''
    child.stderr.on('data', chunk => { stderr += chunk.toString() })
    child.on('close', code => {
      if (code === 0 && fs.existsSync(outFile)) resolve()
      else reject(new Error(stderr || `chatgpt-web exit ${code}`))
    })
  })
}

export async function generateImageBuffer(prompt: string): Promise<Buffer> {
  const provider = getImageProvider()

  if (provider === 'chatgpt-web') {
    if (process.env.VERCEL === '1') {
      throw new Error(
        'IMAGE_PROVIDER=chatgpt-web só funciona localmente (Playwright). Na Vercel use openai-api ou gere imagens via skill no seu Mac.'
      )
    }
    if (!chatGptProfileReady()) {
      throw new Error('Rode npm run chatgpt:auth para criar o perfil em .chatgpt/browser-profile')
    }

    const tmp = path.join(os.tmpdir(), `segalla-chatgpt-${Date.now()}.png`)
    try {
      await runChatGptWebScript(prompt, tmp)
      return fs.readFileSync(tmp)
    } finally {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp)
    }
  }

  return generateViaOpenAiApi(prompt)
}
