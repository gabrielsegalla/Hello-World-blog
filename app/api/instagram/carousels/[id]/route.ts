import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
import { publishInstagramCarousel } from '@/lib/instagram-carousel'

type Params = { params: { id: string } }

export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const carousel = await prisma.instagramCarousel.findUnique({
    where: { id: Number(params.id) },
    include: {
      slides: { orderBy: { order: 'asc' } },
      post: { select: { id: true, title: true, slug: true, excerpt: true } },
    },
  })

  if (!carousel) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(carousel)
}

export async function PUT(req: NextRequest, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const id = Number(params.id)

  const carousel = await prisma.instagramCarousel.update({
    where: { id },
    data: {
      title: body.title,
      caption: body.caption,
      hashtags: body.hashtags,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : body.scheduledAt === null ? null : undefined,
      status: body.status,
    },
    include: { slides: { orderBy: { order: 'asc' } }, post: true },
  })

  return NextResponse.json(carousel)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  await prisma.instagramCarousel.delete({ where: { id: Number(params.id) } })
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest, { params }: Params) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const id = Number(params.id)
  const body = await req.json()
  const action = body.action as string

  if (action === 'schedule') {
    if (!body.scheduledAt) {
      return NextResponse.json({ error: 'scheduledAt obrigatório' }, { status: 400 })
    }
    const carousel = await prisma.instagramCarousel.update({
      where: { id },
      data: {
        scheduledAt: new Date(body.scheduledAt),
        status: 'scheduled',
        errorMessage: null,
      },
      include: { slides: { orderBy: { order: 'asc' } } },
    })
    return NextResponse.json(carousel)
  }

  if (action === 'publish') {
    try {
      const carousel = await publishInstagramCarousel(id)
      return NextResponse.json(carousel)
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Erro ao publicar' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
}
