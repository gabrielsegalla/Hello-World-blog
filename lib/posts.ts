export interface PostInput {
  title: string
  subtitle: string | null
  slug: string
  excerpt: string | null
  content: string
  tags: string
  category: string
  readTime: number
  published: boolean
}

export function sanitizePostInput(body: Record<string, unknown>): PostInput {
  return {
    title: String(body.title || '').trim(),
    subtitle: body.subtitle ? String(body.subtitle).trim() : null,
    slug: String(body.slug || '').trim().toLowerCase(),
    excerpt: body.excerpt ? String(body.excerpt).trim() : null,
    content: String(body.content || ''),
    tags: String(body.tags || '').trim(),
    category: String(body.category || 'Dev').trim(),
    readTime: Math.min(60, Math.max(1, Number(body.readTime) || 5)),
    published: Boolean(body.published),
  }
}

export function validatePostInput(data: PostInput): string | null {
  if (!data.title) return 'title é obrigatório'
  if (!data.slug) return 'slug é obrigatório'
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) return 'slug inválido — use apenas letras minúsculas, números e hífens'
  if (!data.content) return 'content é obrigatório'
  return null
}
