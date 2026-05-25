import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAuthenticated } from '@/lib/auth'
import { generateCarouselFromPost } from '@/lib/instagram-carousel'

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const carousels = await prisma.instagramCarousel.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      slides: { orderBy: { order: 'asc' } },
      post: { select: { id: true, title: true, slug: true } },
    },
  })

  return NextResponse.json(carousels)
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()

  if (body.postId) {
    try {
      const carousel = await generateCarouselFromPost(Number(body.postId))
      return NextResponse.json(carousel, { status: 201 })
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Erro ao gerar carrossel' },
        { status: 500 }
      )
    }
  }

  const carousel = await prisma.instagramCarousel.create({
    data: {
      title: body.title || 'Novo carrossel',
      caption: body.caption || '',
      hashtags: body.hashtags || '',
      status: 'draft',
    },
    include: { slides: true },
  })

  return NextResponse.json(carousel, { status: 201 })
}
