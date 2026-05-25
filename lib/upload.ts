const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 5 * 1024 * 1024

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Formato inválido. Use JPG, PNG, WebP ou GIF.'
  }
  if (file.size > MAX_BYTES) {
    return 'Imagem muito grande. Máximo 5 MB.'
  }
  return null
}

export async function uploadCoverImage(file: File): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'covers'

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Upload não configurado. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.')
  }

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const bytes = await file.arrayBuffer()

  const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': file.type,
      'x-upsert': 'true',
    },
    body: bytes,
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(detail || 'Falha ao enviar imagem para o storage.')
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}
