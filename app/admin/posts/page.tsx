'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Post { id: number; slug: string; title: string; published: boolean; createdAt: string; tags: string; category: string }

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [subs, setSubs] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    Promise.all([
      fetch('/api/posts').then(r => r.json()),
      fetch('/api/subscribers').then(r => r.json()),
    ]).then(([p, s]) => { setPosts(p); setSubs(s.length || 0) }).finally(() => setLoading(false))
  }, [])

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  async function deletePost(id: number) {
    if (!confirm('Deletar este post?')) return
    await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    setPosts(posts.filter(p => p.id !== id))
  }

  return (
    <div style={{ minHeight: '100vh', padding: '32px 5%', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, color: '#7c3aed', letterSpacing: '.12em', marginBottom: 4, fontFamily: "'JetBrains Mono',monospace" }}>
            // admin
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Painel</h1>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/" target="_blank" style={{ fontSize: 12, color: '#7a9bbf', padding: '8px 14px', border: '1px solid #1e1b4b', borderRadius: 6 }}>
            Ver site →
          </Link>
          <Link href="/admin/newsletter" style={{ fontSize: 12, color: '#a78bfa', padding: '8px 14px', border: '1px solid #3730a3', borderRadius: 6, background: 'rgba(124,58,237,.1)' }}>
            📨 Newsletter
          </Link>
          <Link href="/admin/posts/new" style={{ background: '#7c3aed', color: '#fff', padding: '8px 18px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
            + Novo artigo
          </Link>
          <button onClick={logout} style={{ background: 'transparent', border: '1px solid #1e1b4b', color: '#7a9bbf', padding: '8px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            Sair
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'TOTAL', value: posts.length, color: '#a78bfa' },
          { label: 'PUBLICADOS', value: posts.filter(p => p.published).length, color: '#34d399' },
          { label: 'RASCUNHOS', value: posts.filter(p => !p.published).length, color: '#fbbf24' },
          { label: 'INSCRITOS', value: subs, color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} style={{ background: '#0f0a1e', border: '1px solid #1e1b4b', borderRadius: 8, padding: '16px 20px' }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 10, color: '#4a5568', letterSpacing: '.08em', marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Posts */}
      {loading ? (
        <p style={{ color: '#7a9bbf', fontSize: 13 }}>Carregando...</p>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ color: '#7a9bbf', marginBottom: 16 }}>Nenhum artigo ainda.</p>
          <Link href="/admin/posts/new" style={{ background: '#7c3aed', color: '#fff', padding: '10px 24px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
            Criar primeiro artigo
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1, background: '#1e1b4b', border: '1px solid #1e1b4b', borderRadius: 10, overflow: 'hidden' }}>
          {posts.map((post, idx) => (
            <div key={post.id} style={{
              background: '#0f0a1e', padding: '18px 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: 16, borderBottom: idx < posts.length - 1 ? '1px solid #1e1b4b' : 'none', flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 3,
                    background: post.published ? 'rgba(52,211,153,.1)' : 'rgba(251,191,36,.1)',
                    color: post.published ? '#34d399' : '#fbbf24',
                    border: `1px solid ${post.published ? '#065f46' : '#78350f'}`,
                  }}>
                    {post.published ? 'PUBLICADO' : 'RASCUNHO'}
                  </span>
                  <span style={{ fontSize: 10, color: '#7c3aed' }}>{post.category}</span>
                  <span style={{ fontSize: 11, color: '#4a5568' }}>{new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#e8f4ff' }}>{post.title}</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {post.published && (
                  <Link href={`/posts/${post.slug}`} target="_blank" style={{ fontSize: 12, color: '#7a9bbf', padding: '6px 10px', border: '1px solid #1e1b4b', borderRadius: 4 }}>
                    Ver
                  </Link>
                )}
                <Link href={`/admin/posts/${post.id}`} style={{ fontSize: 12, color: '#a78bfa', padding: '6px 10px', border: '1px solid #3730a3', borderRadius: 4 }}>
                  Editar
                </Link>
                <button onClick={() => deletePost(post.id)} style={{ fontSize: 12, color: '#f87171', padding: '6px 10px', border: '1px solid #7f1d1d', borderRadius: 4, background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
