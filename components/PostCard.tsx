import Link from 'next/link'

export interface PostCardData {
  id: number
  slug: string
  title: string
  subtitle?: string | null
  excerpt?: string | null
  category?: string | null
  readTime?: number | null
  coverImage?: string | null
  createdAt: Date | string
}

export function categoryIcon(category?: string | null) {
  if (category?.includes('IA')) return '🤖'
  if (category?.includes('Tutorial')) return '🛠️'
  if (category?.includes('Carreira')) return '🚀'
  if (category?.includes('Inglês')) return '🌎'
  if (category?.includes('Ferramenta')) return '⚙️'
  if (category?.includes('Backend')) return '🧱'
  if (category?.includes('Produtividade')) return '⚡'
  if (category?.includes('Arquitetura')) return '🏛️'
  if (category?.includes('Desenvolvimento')) return '⚛️'
  return '💻'
}

export function categoryHue(category?: string | null) {
  const map: Record<string, number> = {
    IA: 260, 'IA na Prática': 260,
    Carreira: 200, Inglês: 195,
    Backend: 145, Ferramentas: 30,
    Produtividade: 50, Arquitetura: 0,
    Desenvolvimento: 180, Tutoriais: 280, Dev: 270,
  }
  for (const [key, hue] of Object.entries(map)) {
    if (category?.includes(key)) return hue
  }
  return 265
}

function formatDate(date: Date | string, full = false) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: full ? 'long' : 'short',
    year: 'numeric',
  })
}

export default function PostCard({ post }: { post: PostCardData }) {
  const hue = categoryHue(post.category)
  return (
    <Link href={`/posts/${post.slug}`} className="post-card">
      <div
        className="post-card-visual"
        aria-hidden="true"
        style={{
          background: `linear-gradient(135deg, hsl(${hue} 50% 16%) 0%, hsl(${hue + 30} 40% 10%) 100%)`,
        }}
      >
        <div className="post-card-visual-glow" style={{ background: `radial-gradient(circle at 30% 30%, hsl(${hue} 75% 55% / .35), transparent 55%)` }} />
        <span className="post-card-visual-icon">{categoryIcon(post.category)}</span>
      </div>
      <div className="post-card-body">
        <div className="post-card-meta">
          <span className="post-card-category">{post.category?.toUpperCase() || 'DEV'}</span>
          <span className="post-card-dot">·</span>
          <span className="post-card-time">{post.readTime || 5} min</span>
        </div>
        <h3 className="post-card-title">{post.title}</h3>
        <span className="post-card-cta">Ler artigo →</span>
      </div>
    </Link>
  )
}

export function PostRow({ post, isLast }: { post: PostCardData; isLast: boolean }) {
  return (
    <Link href={`/posts/${post.slug}`} className={`post-row${isLast ? ' post-row-last' : ''}`}>
      <div className="post-row-icon" aria-hidden="true">{categoryIcon(post.category)}</div>
      <div className="post-row-body">
        <div className="post-row-meta">
          <span className="post-row-category">{post.category?.toUpperCase() || 'DEV'}</span>
          <span className="post-row-dot">·</span>
          <span className="post-row-time">{post.readTime || 5} min</span>
        </div>
        <p className="post-row-title">{post.title}</p>
      </div>
      <span className="post-row-date">{formatDate(post.createdAt)}</span>
    </Link>
  )
}
