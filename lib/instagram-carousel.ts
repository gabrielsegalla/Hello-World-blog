import { prisma } from '@/lib/prisma'
import { planCarouselFromPost } from '@/lib/openai'
import { generateImageBuffer } from '@/lib/images'
import { uploadBufferImage } from '@/lib/upload'
import { publishCarousel, refreshPageTokenIfNeeded } from '@/lib/instagram'
import { SITE_URL } from '@/lib/site'

const BASE_PROMPT =
  'Minimal tech Instagram carousel slide, dark background #0a0a14, purple accent #7c3aed, flat design, no text, no letters, no watermark, professional'

export async function generateCarouselFromPost(postId: number) {
  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) throw new Error('Post não encontrado')

  const plan = await planCarouselFromPost({
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    siteUrl: SITE_URL,
    slug: post.slug,
  })

  const carousel = await prisma.instagramCarousel.create({
    data: {
      postId: post.id,
      title: plan.title,
      caption: plan.caption,
      hashtags: plan.hashtags,
      status: 'draft',
      slides: {
        create: plan.slides.map((slide, index) => ({
          order: index + 1,
          headline: slide.headline,
          bodyText: slide.bodyText,
        })),
      },
    },
    include: { slides: { orderBy: { order: 'asc' } } },
  })

  for (const slide of carousel.slides) {
    const planSlide = plan.slides[slide.order - 1]
    const prompt = `${BASE_PROMPT}. ${planSlide.imagePrompt}`
    const buffer = await generateImageBuffer(prompt)
    const imageUrl = await uploadBufferImage(buffer, `instagram/${carousel.id}/${slide.order}.png`, 'image/png')

    await prisma.instagramSlide.update({
      where: { id: slide.id },
      data: { imageUrl },
    })
  }

  return prisma.instagramCarousel.findUnique({
    where: { id: carousel.id },
    include: { slides: { orderBy: { order: 'asc' } }, post: true },
  })
}

export async function publishInstagramCarousel(carouselId: number) {
  const carousel = await prisma.instagramCarousel.findUnique({
    where: { id: carouselId },
    include: { slides: { orderBy: { order: 'asc' } } },
  })

  if (!carousel) throw new Error('Carrossel não encontrado')

  const account = await prisma.instagramAccount.findFirst()
  if (!account) throw new Error('Instagram não conectado. Conecte em /admin/instagram')

  const missing = carousel.slides.filter(s => !s.imageUrl)
  if (missing.length) throw new Error('Carrossel incompleto: gere as imagens antes de publicar')

  await prisma.instagramCarousel.update({
    where: { id: carouselId },
    data: { status: 'publishing', errorMessage: null },
  })

  try {
    const token = await refreshPageTokenIfNeeded(account)
    const fullCaption = [carousel.caption.trim(), carousel.hashtags.trim()].filter(Boolean).join('\n\n')

    const mediaId = await publishCarousel({
      igUserId: account.igUserId,
      accessToken: token,
      imageUrls: carousel.slides.map(s => s.imageUrl!),
      caption: fullCaption,
    })

    return prisma.instagramCarousel.update({
      where: { id: carouselId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        igMediaId: mediaId,
        errorMessage: null,
      },
      include: { slides: { orderBy: { order: 'asc' } }, post: true },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro ao publicar'
    await prisma.instagramCarousel.update({
      where: { id: carouselId },
      data: { status: 'failed', errorMessage: message },
    })
    throw err
  }
}

export async function publishDueCarousels() {
  const due = await prisma.instagramCarousel.findMany({
    where: {
      status: 'scheduled',
      scheduledAt: { lte: new Date() },
    },
    orderBy: { scheduledAt: 'asc' },
  })

  const results = []
  for (const item of due) {
    try {
      const published = await publishInstagramCarousel(item.id)
      results.push({ id: item.id, ok: true, igMediaId: published.igMediaId })
    } catch (err) {
      results.push({
        id: item.id,
        ok: false,
        error: err instanceof Error ? err.message : 'Erro',
      })
    }
  }
  return results
}
