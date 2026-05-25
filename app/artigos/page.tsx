import type { Metadata } from 'next'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import HomeSearch from '@/components/HomeSearch'
import PostCard from '@/components/PostCard'
import ArticleListItem from '@/components/ArticleListItem'
import { SITE_NAME, SITE_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Todos os artigos',
  description: 'Artigos sobre dev, IA e carreira. Busque por tema ou filtre por categoria.',
  alternates: { canonical: `${SITE_URL}/artigos` },
}

interface ArtigosProps {
  searchParams: { q?: string; cat?: string }
}

function buildWhere(q: string, cat: string): Prisma.PostWhereInput {
  const where: Prisma.PostWhereInput = { published: true }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { subtitle: { contains: q } },
      { excerpt: { contains: q } },
      { tags: { contains: q } },
      { content: { contains: q } },
    ]
  }
  if (cat && cat !== 'Todos') {
    where.category = cat
  }
  return where
}

export default async function ArtigosPage({ searchParams }: ArtigosProps) {
  const q = searchParams.q?.trim() || ''
  const cat = searchParams.cat?.trim() || 'Todos'
  const isFiltering = q !== '' || cat !== 'Todos'

  const [posts, allPosts] = await Promise.all([
    prisma.post.findMany({
      where: buildWhere(q, cat),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, slug: true, title: true, subtitle: true, excerpt: true,
        tags: true, category: true, readTime: true, coverImage: true, createdAt: true,
      },
    }),
    prisma.post.findMany({
      where: { published: true },
      select: { category: true },
    }),
  ])

  const categoryCounts = allPosts.reduce<Record<string, number>>((acc, p) => {
    if (p.category) acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {})
  const categoriesSorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])
  const filterPills = ['Todos', ...categoriesSorted.map(([c]) => c)]

  return (
    <>
      <Navbar />

      <main className="artigos-page">
        <section className="artigos-page-header">
          <div className="artigos-page-header-inner">
            <div>
              <p className="home-toolbar-tag">// artigos</p>
              <h1 className="artigos-page-title">Todos os artigos</h1>
              <p className="artigos-page-desc">
                Busque por palavra-chave ou filtre por categoria para encontrar o que precisa.
              </p>
            </div>
            <p className="artigos-page-count">
              {posts.length} {posts.length === 1 ? 'artigo' : 'artigos'}
              {isFiltering ? ' encontrado(s)' : ' publicados'}
            </p>
          </div>
        </section>

        <section className="home-toolbar artigos-page-toolbar" aria-label="Buscar e filtrar artigos">
          <div className="home-toolbar-inner">
            <HomeSearch
              basePath="/artigos"
              initialQuery={q}
              initialCategory={cat}
              categories={filterPills}
            />
          </div>
        </section>

        {isFiltering && (
          <section className="artigos-page-active-filters">
            <div className="artigos-page-active-filters-inner">
              <span className="artigos-page-filter-label">Filtros ativos:</span>
              {q && (
                <span className="artigos-page-filter-chip">
                  Busca: &quot;{q}&quot;
                </span>
              )}
              {cat !== 'Todos' && (
                <span className="artigos-page-filter-chip">{cat}</span>
              )}
              <Link href="/artigos" className="artigos-page-clear-filters">
                Limpar filtros
              </Link>
            </div>
          </section>
        )}

        <section className="artigos-page-content">
          <div className="artigos-page-content-inner">
            {posts.length === 0 ? (
              <div className="empty-state empty-state-minimal">
                <p className="empty-state-tag">// nenhum resultado</p>
                <p className="empty-state-title">Nenhum artigo encontrado</p>
                <p className="empty-state-text">
                  Tente outro termo de busca ou escolha outra categoria.
                </p>
                <Link href="/artigos" className="see-all-link">Ver todos os artigos</Link>
              </div>
            ) : (
              <>
                <div className="recent-grid artigos-page-grid">
                  {posts.map(post => <PostCard key={post.id} post={post} />)}
                </div>

                <div className="artigos-page-list">
                  <div className="artigos-page-list-head">
                    <h2 className="home-section-title">
                      <span className="home-section-bar" aria-hidden="true" />
                      Lista completa
                    </h2>
                    <p className="artigos-page-list-desc">
                      Todos os artigos em ordem cronológica, com categoria e tempo de leitura.
                    </p>
                  </div>
                  <div className="article-list">
                    {posts.map((post, i) => (
                      <ArticleListItem key={post.id} post={post} isLast={i === posts.length - 1} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p className="footer-copy">© 2026 {SITE_NAME} — Feito com ☕ e código.</p>
          <div className="footer-links">
            <Link href="/" className="footer-link">Início</Link>
            <Link href="/ebook" className="footer-link">eBook</Link>
            <Link href="https://github.com/gabriel-segalla" target="_blank" className="footer-link">GitHub</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
