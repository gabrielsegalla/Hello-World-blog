import fs from 'fs/promises'
import path from 'path'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_BYTES = 5 * 1024 * 1024

export type UploadStorage = 'local' | 'supabase'

export function getUploadStorage(): UploadStorage {
  const mode = process.env.UPLOAD_STORAGE?.toLowerCase()
  if (mode === 'local') return 'local'
  if (mode === 'supabase') return 'supabase'

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return 'supabase'
  }

  return 'local'
}

function getLocalUploadRoot(): string {
  const configured = process.env.UPLOAD_LOCAL_DIR
  if (configured) {
    return path.isAbsolute(configured) ? configured : path.join(process.cwd(), configured)
  }
  return path.join(process.cwd(), 'public', 'uploads')
}

function sanitizePathSegment(value: string): string {
  return value.replace(/[^a-zA-Z0-9._/-]/g, '-')
}

function toPublicUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, '').replace(/\\/g, '/')
  return `/uploads/${clean}`
}

async function uploadLocalFile(buffer: Buffer, relativePath: string): Promise<string> {
  const safePath = sanitizePathSegment(relativePath)
  const fullPath = path.join(getLocalUploadRoot(), safePath)
  await fs.mkdir(path.dirname(fullPath), { recursive: true })
  await fs.writeFile(fullPath, buffer)
  return toPublicUrl(safePath)
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return 'Formato inválido. Use JPG, PNG, WebP ou GIF.'
  }
  if (file.size > MAX_BYTES) {
    return 'Imagem muito grande. Máximo 5 MB.'
  }
  return null
}

async function uploadCoverToSupabase(file: File): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'covers'

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase não configurado.')
  }

  const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const objectPath = `posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const bytes = await file.arrayBuffer()

  const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`, {
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

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`
}

async function uploadBufferToSupabase(
  buffer: Buffer,
  objectPath: string,
  contentType: string
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'covers'

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase não configurado.')
  }

  const res = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${objectPath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: new Uint8Array(buffer),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(detail || 'Falha ao enviar imagem para o storage.')
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`
}

export async function uploadCoverImage(file: File): Promise<string> {
  if (getUploadStorage() === 'local') {
    const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const relativePath = `posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const bytes = Buffer.from(await file.arrayBuffer())
    return uploadLocalFile(bytes, relativePath)
  }

  try {
    return await uploadCoverToSupabase(file)
  } catch (error) {
    if (process.env.UPLOAD_STORAGE === 'supabase') throw error
    const ext = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
    const relativePath = `posts/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const bytes = Buffer.from(await file.arrayBuffer())
    return uploadLocalFile(bytes, relativePath)
  }
}

export async function uploadBufferImage(
  buffer: Buffer,
  objectPath: string,
  contentType: string
): Promise<string> {
  if (getUploadStorage() === 'local') {
    return uploadLocalFile(buffer, sanitizePathSegment(objectPath))
  }

  try {
    return await uploadBufferToSupabase(buffer, objectPath, contentType)
  } catch (error) {
    if (process.env.UPLOAD_STORAGE === 'supabase') throw error
    return uploadLocalFile(buffer, sanitizePathSegment(objectPath))
  }
}
