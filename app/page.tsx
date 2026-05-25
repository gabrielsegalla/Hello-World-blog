import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import Navbar from '@/components/Navbar'
import HomeSearch from '@/components/HomeSearch'
import FeaturedPost from '@/components/FeaturedPost'
import PostCard from '@/components/PostCard'
import NewsletterInline from '@/components/NewsletterInline'
import NewsletterModal from '@/components/NewsletterModal'
import EbookHero from '@/components/EbookHero'

export const dynamic = 'force-dynamic'

interface HomeProps {
  searchParams: { q?: string; cat?: string }
}

export default async function Home({ searchParams }: HomeProps) {
  const q = searchParams.q?.trim() || ''
  const cat = searchParams.cat?.trim() || 'Todos'

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

  const [posts, allPosts] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, slug: true, title: true, subtitle: true, excerpt: true,
        tags: true, category: true, readTime: true, createdAt: true,
      },
    }),
    prisma.post.findMany({
      where: { published: true },
      select: { id: true, slug: true, title: true, category: true, createdAt: true, readTime: true },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const latest = posts[0] || null
  const grid = posts.slice(1, 7)
  const isFiltering = q !== '' || cat !== 'Todos'

  // Category counts (from all published posts)
  const categoryCounts = allPosts.reduce<Record<string, number>>((acc, p) => {
    if (p.category) acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {})
  const categoriesSorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])
  const filterPills = ['Todos', ...categoriesSorted.map(([c]) => c)]

  // "Mais lidos" — sem tracking, usamos os 3 mais recentes globais como destaque
  const mostRead = allPosts.slice(0, 3)

  return (
    <>
      <Navbar />
      <NewsletterModal />

      <main className="home">
        {/* HERO — eBook */}
        <EbookHero />

        {/* Toolbar: busca + filtros */}
        <section className="home-toolbar" id="artigos" aria-label="Buscar e filtrar artigos">
          <div className="home-toolbar-inner">
            <div className="home-toolbar-intro">
              <p className="home-toolbar-tag">// artigos</p>
              <h2 className="home-toolbar-title">Dev, IA e carreira — sem hype</h2>
            </div>
            <HomeSearch
              initialQuery={q}
              initialCategory={cat}
              categories={filterPills}
            />
          </div>
        </section>

        {/* LAYOUT */}
        <section className="home-layout" id="destaque">
          <div className="home-main">
            {latest ? (
              <>
                <h2 className="home-section-title">
                  <span className="home-section-bar" aria-hidden="true" />
                  {isFiltering ? 'Resultado' : 'Destaque'}
                </h2>
                <FeaturedPost post={latest} />
              </>
            ) : (
              <div className="empty-state">
                <p className="empty-state-emoji">🔎</p>
                <p className="empty-state-title">Nenhum artigo encontrado</p>
                <p className="empty-state-text">
                  Tente outro termo de busca ou filtro de categoria.
                </p>
              </div>
            )}

            {grid.length > 0 && (
              <>
                <h2 className="home-section-title home-section-title-mt">
                  <span className="home-section-bar" aria-hidden="true" />
                  {isFiltering ? 'Outros resultados' : 'Artigos recentes'}
                </h2>
                <div className="recent-grid">
                  {grid.map(post => <PostCard key={post.id} post={post} />)}
                </div>
                <div className="recent-grid-footer">
                  <Link href="/#destaque" className="see-all-link">Ver todos os artigos →</Link>
                </div>
              </>
            )}
          </div>

          <aside className="home-sidebar">
            <h2 className="home-section-title">
              <span className="home-section-bar" aria-hidden="true" />
              Sobre o autor
            </h2>

            {/* About */}
            <div className="sidebar-card" id="sobre">
              <div className="sidebar-about-head">
                <div className="about-avatar" aria-hidden="true">G</div>
                <div>
                  <p className="sidebar-about-name">Gabriel Segalla</p>
                  <p className="sidebar-about-role">Fullstack · Floripa</p>
                </div>
              </div>
              <p className="sidebar-about-bio">
                Dev fullstack com 10+ anos. React + Python. Pós em IA e Automação.
                Escrevo sobre o que realmente funciona — sem hype.
              </p>
              <div className="sidebar-about-links">
                <Link href="https://github.com/gabriel-segalla" target="_blank" className="sidebar-link">
                  <span aria-hidden="true">⌬</span> GitHub
                </Link>
                <Link href="https://linkedin.com/in/gabriel-segalla" target="_blank" className="sidebar-link">
                  <span aria-hidden="true">in</span> LinkedIn
                </Link>
                <Link href="mailto:gabriel@segalla.dev" className="sidebar-link">
                  <span aria-hidden="true">✉</span> Email
                </Link>
              </div>
            </div>

            {/* Newsletter */}
            <div className="sidebar-card">
              <div className="sidebar-card-head">
                <span className="sidebar-card-icon" aria-hidden="true">📨</span>
                <h3 className="sidebar-card-title">Newsletter</h3>
              </div>
              <NewsletterInline variant="compact" />
            </div>

            {/* Categories */}
            {categoriesSorted.length > 0 && (
              <div className="sidebar-card" id="categorias">
                <div className="sidebar-card-head">
                  <span className="sidebar-card-icon" aria-hidden="true">#</span>
                  <h3 className="sidebar-card-title">Categorias</h3>
                </div>
                <ul className="category-list">
                  <li className="category-item">
                    <Link href="/" className={`category-link${cat === 'Todos' ? ' category-link-active' : ''}`}>
                      Todos
                    </Link>
                    <span className="category-count">{allPosts.length}</span>
                  </li>
                  {categoriesSorted.map(([name, count]) => (
                    <li key={name} className="category-item">
                      <Link
                        href={`/?cat=${encodeURIComponent(name)}#destaque`}
                        className={`category-link${cat === name ? ' category-link-active' : ''}`}
                      >
                        {name}
                      </Link>
                      <span className="category-count">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Most read */}
            {mostRead.length > 0 && (
              <div className="sidebar-card">
                <div className="sidebar-card-head">
                  <span className="sidebar-card-icon" aria-hidden="true">🔥</span>
                  <h3 className="sidebar-card-title">Mais lidos</h3>
                </div>
                <ol className="most-read-list">
                  {mostRead.map((p, i) => (
                    <li key={p.id} className="most-read-item">
                      <span className="most-read-num">{i + 1}</span>
                      <Link href={`/posts/${p.slug}`} className="most-read-title">{p.title}</Link>
                    </li>
                  ))}
                </ol>
              </div>
            )}

          </aside>
        </section>
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <p className="footer-copy">© 2026 dev.segalla — Feito com ☕ e código.</p>
          <div className="footer-links">
            <Link href="https://github.com/gabriel-segalla" target="_blank" className="footer-link">GitHub</Link>
            <Link href="https://linkedin.com/in/gabriel-segalla" target="_blank" className="footer-link">LinkedIn</Link>
            <Link href="mailto:gabriel@segalla.dev" className="footer-link">Email</Link>
          </div>
        </div>
      </footer>
    </>
  )
}
