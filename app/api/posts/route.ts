import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
import { sanitizePostInput, validatePostInput } from '@/lib/posts'

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const data = sanitizePostInput(body)
  const validationError = validatePostInput(data)
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 })
  }

  try {
    const post = await prisma.post.create({ data })
    return NextResponse.json(post, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Slug já existe ou dados inválidos' }, { status: 409 })
  }
}
