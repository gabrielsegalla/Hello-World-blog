import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import EbookCTA from '@/components/EbookCTA'
import NewsletterInline from '@/components/NewsletterInline'
import ReadingProgress from '@/components/ReadingProgress'
import ShareButtons from '@/components/ShareButtons'
import PostNavigation from '@/components/PostNavigation'
import RelatedPosts from '@/components/RelatedPosts'
import { parseMarkdown } from '@/lib/markdown'
import { SITE_NAME, SITE_URL } from '@/lib/site'
import Link from 'next/link'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

const POST_SELECT = {
  id: true, slug: true, title: true, subtitle: true, excerpt: true,
  category: true, readTime: true, tags: true,
  createdAt: true,
} as const

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await prisma.post.findUnique({ where: { slug: params.slug, published: true } })
  if (!post) return { title: 'Artigo não encontrado' }

  const description = post.excerpt || post.subtitle || ''
  const url = `${SITE_URL}/posts/${post.slug}`

  return {
    title: post.title,
    description,
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: ['Gabriel Segalla'],
    },
    twitter: { card: 'summary_large_image', title: post.title, description },
    alternates: { canonical: url },
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug, published: true } })
  if (!post) notFound()

  const [previous, next] = await Promise.all([
    prisma.post.findFirst({
      where: { published: true, createdAt: { lt: post.createdAt } },
      orderBy: { createdAt: 'desc' },
      select: POST_SELECT,
    }),
    prisma.post.findFirst({
      where: { published: true, createdAt: { gt: post.createdAt } },
      orderBy: { createdAt: 'asc' },
      select: POST_SELECT,
    }),
  ])

  let related = post.category
    ? await prisma.post.findMany({
        where: { published: true, id: { not: post.id }, category: post.category },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: POST_SELECT,
      })
    : []

  if (related.length < 3) {
    const fillIds = related.map(r => r.id).concat(post.id)
    const fillers = await prisma.post.findMany({
      where: { published: true, id: { notIn: fillIds } },
      orderBy: { createdAt: 'desc' },
      take: 3 - related.length,
      select: POST_SELECT,
    })
    related = related.concat(fillers)
  }

  const html = parseMarkdown(post.content)
  const tags = post.tags?.split(',').map(t => t.trim()).filter(Boolean) || []
  const date = new Date(post.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const url = `${SITE_URL}/posts/${post.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.subtitle || '',
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { '@type': 'Person', name: 'Gabriel Segalla' },
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: url,
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <ReadingProgress />

      <main className="post-page">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Navegação por hierarquia">
          <Link href="/">Início</Link>
          <span aria-hidden="true">/</span>
          <Link href="/#artigos">Artigos</Link>
          {post.category && (
            <>
              <span aria-hidden="true">/</span>
              <span className="breadcrumb-current">{post.category}</span>
            </>
          )}
        </nav>

        <article className="post-article">
          {/* Header */}
          <header className="post-header">
            <div className="post-meta-line">
              {post.category && <span className="post-category">{post.category.toUpperCase()}</span>}
              <span className="post-meta-dot">·</span>
              <span className="post-meta-time">{post.readTime} min de leitura</span>
              <span className="post-meta-dot">·</span>
              <span className="post-meta-date">{date}</span>
            </div>

            <h1 className="post-title">{post.title}</h1>
            {post.subtitle && <p className="post-subtitle">{post.subtitle}</p>}

            {tags.length > 0 && (
              <div className="post-tags">
                {tags.map(t => <span key={t} className="post-tag">#{t}</span>)}
              </div>
            )}

            <div className="post-author">
              <div className="post-author-avatar" aria-hidden="true">G</div>
              <div>
                <p className="post-author-name">Gabriel Segalla</p>
                <p className="post-author-role">Dev fullstack · {date}</p>
              </div>
              <div className="post-header-share">
                <ShareButtons url={url} title={post.title} />
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="prose post-content" dangerouslySetInnerHTML={{ __html: html }} />

          {/* Inline share */}
          <div className="post-share-bottom">
            <ShareButtons url={url} title={post.title} />
          </div>

          {/* Prev/Next */}
          <PostNavigation previous={previous} next={next} />

          {/* Newsletter */}
          <NewsletterInline />

          {/* Related */}
          <RelatedPosts posts={related} />

          {/* Ebook */}
          <EbookCTA variant="banner" />

          {/* Back link */}
          <div className="post-back">
            <Link href="/" className="post-back-link">← Voltar para todos os artigos</Link>
          </div>
        </article>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span className="footer-brand">&gt;_ segalla.dev</span>
          <p className="footer-copy">© 2026 Gabriel Rodrigues Segalla</p>
        </div>
      </footer>
    </>
  )
}
