import Link from 'next/link'
import type { PostCardData } from './PostCard'
import { categoryIcon, categoryHue } from './PostCard'

export default function FeaturedPost({ post }: { post: PostCardData }) {
  const date = new Date(post.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
  const hue = categoryHue(post.category)

  return (
    <Link href={`/posts/${post.slug}`} className="featured-post">
      <div
        className="featured-post-visual"
        aria-hidden="true"
        style={{
          background: `linear-gradient(135deg, hsl(${hue} 55% 14%) 0%, hsl(${hue + 30} 45% 8%) 100%)`,
        }}
      >
        <div
          className="featured-post-glow"
          style={{ background: `radial-gradient(circle at 30% 30%, hsl(${hue} 80% 60% / .45), transparent 55%), radial-gradient(circle at 70% 70%, hsl(${hue + 40} 80% 55% / .25), transparent 50%)` }}
        />
        <div className="featured-post-grid-bg" aria-hidden="true" />
        <span className="featured-post-icon">{categoryIcon(post.category)}</span>
      </div>

      <div className="featured-post-content">
        <div className="featured-post-meta">
          <span className="featured-post-category">{post.category?.toUpperCase() || 'DEV'}</span>
          <span className="featured-post-dot">·</span>
          <span className="featured-post-time">{post.readTime || 5} min de leitura</span>
          <span className="featured-post-dot">·</span>
          <span className="featured-post-date">{date}</span>
        </div>

        <h2 className="featured-post-title">{post.title}</h2>

        {post.subtitle && <p className="featured-post-subtitle">{post.subtitle}</p>}

        {post.excerpt && <p className="featured-post-excerpt">{post.excerpt}</p>}

        <span className="featured-post-cta">
          Ler artigo
          <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  )
}
