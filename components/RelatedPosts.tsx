import PostCard from './PostCard'
import type { PostCardData } from './PostCard'

export default function RelatedPosts({ posts }: { posts: PostCardData[] }) {
  if (posts.length === 0) return null

  return (
    <section className="related-posts" aria-label="Artigos relacionados">
      <div className="related-posts-header">
        <p className="related-posts-tag">// continue lendo</p>
        <h3 className="related-posts-title">Artigos relacionados</h3>
      </div>
      <div className="related-posts-grid">
        {posts.map(post => <PostCard key={post.id} post={post} />)}
      </div>
    </section>
  )
}
