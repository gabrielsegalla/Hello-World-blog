import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
import { sanitizePostInput, validatePostInput } from '@/lib/posts'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const post = await prisma.post.findUnique({ where: { id: Number(params.id) } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(post)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
    const post = await prisma.post.update({ where: { id: Number(params.id) }, data })
    return NextResponse.json(post)
  } catch {
    return NextResponse.json({ error: 'Post não encontrado ou slug em conflito' }, { status: 404 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  await prisma.post.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}
