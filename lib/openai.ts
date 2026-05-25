const OPENAI_BASE = 'https://api.openai.com/v1'

function getApiKey() {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY não configurada')
  return key
}

export interface CarouselSlidePlan {
  headline: string
  bodyText: string
  imagePrompt: string
}

export interface CarouselPlan {
  title: string
  caption: string
  hashtags: string
  slides: CarouselSlidePlan[]
}

export async function planCarouselFromPost(input: {
  title: string
  excerpt: string | null
  content: string
  siteUrl: string
  slug: string
}): Promise<CarouselPlan> {
  const contentPreview = input.content.replace(/[#*`[\]]/g, '').slice(0, 6000)

  const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TEXT_MODEL || 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Você cria carrosséis Instagram para devs em PT-BR. Tom direto, sem emoji, sem travessão longo.
Retorne JSON: { "title", "caption" (max 2200 chars, CTA com link), "hashtags" (8-15 separadas por espaço, com #), "slides": [{ "headline", "bodyText" (max 120 chars), "imagePrompt" (inglês, estilo dark tech roxo #7c3aed, no text in image) }] }
Entre 6 e 8 slides. Slide 1 = gancho. Último = CTA para ler no blog.`,
        },
        {
          role: 'user',
          content: `Artigo: ${input.title}\nExcerpt: ${input.excerpt || ''}\nURL: ${input.siteUrl}/posts/${input.slug}\n\nConteúdo:\n${contentPreview}`,
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI texto falhou: ${err}`)
  }

  const data = await res.json()
  const raw = data.choices?.[0]?.message?.content
  if (!raw) throw new Error('OpenAI retornou resposta vazia')

  const parsed = JSON.parse(raw) as CarouselPlan
  if (!parsed.slides?.length) throw new Error('Plano de slides inválido')
  return parsed
}

export async function generateCarouselImage(prompt: string): Promise<Buffer> {
  const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'
  const size = process.env.OPENAI_IMAGE_SIZE || '1024x1024'

  const baseBody = { model, prompt, size, n: 1 }

  let res = await fetch(`${OPENAI_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(
      model === 'dall-e-3'
        ? { ...baseBody, quality: 'hd', response_format: 'b64_json' }
        : { ...baseBody, quality: 'high' }
    ),
  })

  if (!res.ok && model !== 'dall-e-3') {
    res = await fetch(`${OPENAI_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getApiKey()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        size: '1024x1024',
        n: 1,
        quality: 'hd',
        response_format: 'b64_json',
      }),
    })
  }

  if (!res.ok) {
    throw new Error(`OpenAI imagem falhou: ${await res.text()}`)
  }

  const data = await res.json()
  const b64 = data.data?.[0]?.b64_json
  const url = data.data?.[0]?.url

  if (b64) return Buffer.from(b64, 'base64')
  if (url) {
    const img = await fetch(url)
    return Buffer.from(await img.arrayBuffer())
  }

  throw new Error('OpenAI não retornou imagem')
}
