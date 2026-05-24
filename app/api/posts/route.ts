import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'

export async function GET() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated()) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const body = await req.json()
  if (!body.title || !body.content || !body.slug)
    return NextResponse.json({ error: 'title, content e slug são obrigatórios' }, { status: 400 })
  const post = await prisma.post.create({ data: { ...body, tags: body.tags || '', category: body.category || 'Dev', readTime: body.readTime || 5 } })
  return NextResponse.json(post, { status: 201 })
}
