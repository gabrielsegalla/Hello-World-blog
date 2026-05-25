import Link from 'next/link'
import type { PostCardData } from './PostCard'

interface PostNavigationProps {
  previous: PostCardData | null
  next: PostCardData | null
}

export default function PostNavigation({ previous, next }: PostNavigationProps) {
  if (!previous && !next) return null

  return (
    <nav className="post-nav" aria-label="Navegação entre artigos">
      {previous ? (
        <Link href={`/posts/${previous.slug}`} className="post-nav-item post-nav-prev">
          <span className="post-nav-direction">← Anterior</span>
          <span className="post-nav-title">{previous.title}</span>
        </Link>
      ) : <span aria-hidden="true" />}

      {next ? (
        <Link href={`/posts/${next.slug}`} className="post-nav-item post-nav-next">
          <span className="post-nav-direction">Próximo →</span>
          <span className="post-nav-title">{next.title}</span>
        </Link>
      ) : <span aria-hidden="true" />}
    </nav>
  )
}
