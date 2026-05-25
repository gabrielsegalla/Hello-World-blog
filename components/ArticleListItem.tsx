import Link from 'next/link'
import { categoryHue, type PostCardData } from './PostCard'

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default function ArticleListItem({ post, isLast }: { post: PostCardData; isLast: boolean }) {
  const hue = categoryHue(post.category)
  const summary = post.subtitle || post.excerpt
  const categoryLabel = post.category || 'Dev'

  return (
    <Link
      href={`/posts/${post.slug}`}
      className={`article-list-item${isLast ? ' article-list-item-last' : ''}`}
    >
      <div
        className="article-list-item-thumb"
        aria-hidden="true"
        style={post.coverImage ? undefined : {
          background: `linear-gradient(145deg, hsl(${hue} 48% 18%) 0%, hsl(${hue + 24} 38% 10%) 100%)`,
        }}
      >
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImage}
            alt=""
            className="article-list-item-thumb-img"
            loading="lazy"
          />
        ) : (
          <>
            <div
              className="article-list-item-thumb-glow"
              style={{ background: `radial-gradient(circle at 30% 25%, hsl(${hue} 70% 50% / .35), transparent 60%)` }}
            />
            <span className="article-list-item-thumb-label">{categoryLabel}</span>
          </>
        )}
      </div>

      <div className="article-list-item-content">
        <div className="article-list-item-meta">
          <span
            className="article-list-item-category"
            style={{
              color: `hsl(${hue} 70% 72%)`,
              background: `hsl(${hue} 45% 14% / 0.9)`,
              borderColor: `hsl(${hue} 40% 28% / 0.6)`,
            }}
          >
            {categoryLabel}
          </span>
          <span className="article-list-item-read">{post.readTime || 5} min de leitura</span>
        </div>

        <h3 className="article-list-item-title">{post.title}</h3>

        {summary && (
          <p className="article-list-item-summary">{summary}</p>
        )}

        <time className="article-list-item-date" dateTime={new Date(post.createdAt).toISOString()}>
          {formatDate(post.createdAt)}
        </time>
      </div>

      <span className="article-list-item-arrow" aria-hidden="true">→</span>
    </Link>
  )
}
