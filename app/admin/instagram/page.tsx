'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Post { id: number; title: string; slug: string; published: boolean }
interface Slide { id: number; order: number; headline: string; imageUrl: string | null }
interface Carousel {
  id: number
  title: string
  status: string
  scheduledAt: string | null
  publishedAt: string | null
  caption: string
  hashtags: string
  slides: Slide[]
  post: { id: number; title: string; slug: string } | null
}

interface AccountInfo {
  connected: boolean
  account: { username: string; pageName: string | null } | null
  metaConfigured: boolean
  openaiConfigured: boolean
}

const statusLabel: Record<string, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendado',
  publishing: 'Publicando',
  published: 'Publicado',
  failed: 'Falhou',
}

const statusColor: Record<string, string> = {
  draft: '#fbbf24',
  scheduled: '#a78bfa',
  publishing: '#60a5fa',
  published: '#34d399',
  failed: '#f87171',
}

export default function AdminInstagramPage() {
  const [carousels, setCarousels] = useState<Carousel[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [account, setAccount] = useState<AccountInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<number | null>(null)
  const [selectedPost, setSelectedPost] = useState('')
  const [alertMsg, setAlertMsg] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search)
    const err = qs.get('error')
    const ok = qs.get('connected')
    if (err) setAlertMsg(err)
    else if (ok) setAlertMsg('Instagram conectado com sucesso')
  }, [])

  useEffect(() => {
    Promise.all([
      fetch('/api/instagram/carousels').then(r => r.json()),
      fetch('/api/posts').then(r => r.json()),
      fetch('/api/instagram/account').then(r => r.json()),
    ]).then(([c, p, a]) => {
      setCarousels(Array.isArray(c) ? c : [])
      setPosts(Array.isArray(p) ? p.filter((x: Post) => x.published) : [])
      setAccount(a)
    }).finally(() => setLoading(false))
  }, [])

  async function connectInstagram() {
    const res = await fetch('/api/instagram/auth')
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  async function generateFromPost() {
    if (!selectedPost) return
    setGenerating(Number(selectedPost))
    const res = await fetch('/api/instagram/carousels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: Number(selectedPost) }),
    })
    setGenerating(null)
    if (res.ok) {
      const carousel = await res.json()
      router.push(`/admin/instagram/${carousel.id}`)
    } else {
      const data = await res.json()
      alert(data.error || 'Erro ao gerar carrossel')
    }
  }

  const alertMsgDisplay = alertMsg

  return (
    <div style={{ minHeight: '100vh', padding: '32px 5%', position: 'relative', zIndex: 1 }}>
      <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, color: '#7c3aed', letterSpacing: '.12em', marginBottom: 4, fontFamily: "'JetBrains Mono',monospace" }}>// instagram</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Carrosséis</h1>
      </div>

      {alertMsgDisplay && (
        <div style={{ marginBottom: 20, padding: '12px 16px', borderRadius: 8, border: '1px solid #3730a3', background: 'rgba(124,58,237,.1)', color: alertMsgDisplay.includes('sucesso') ? '#a78bfa' : '#f87171', fontSize: 13 }}>
          {alertMsgDisplay}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 28 }}>
        <div style={{ background: '#0f0a1e', border: '1px solid #1e1b4b', borderRadius: 8, padding: 20 }}>
          <p style={{ fontSize: 10, color: '#4a5568', letterSpacing: '.08em', marginBottom: 8 }}>CONEXÃO INSTAGRAM</p>
          {account?.connected ? (
            <>
              <p style={{ color: '#34d399', fontWeight: 700, marginBottom: 4 }}>@{account.account?.username}</p>
              <p style={{ color: '#7a9bbf', fontSize: 12 }}>{account.account?.pageName}</p>
            </>
          ) : (
            <>
              <p style={{ color: '#7a9bbf', fontSize: 13, marginBottom: 12 }}>Conecte sua conta Business/Creator via Meta.</p>
              <button onClick={connectInstagram} disabled={!account?.metaConfigured} style={{ background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: account?.metaConfigured ? 'pointer' : 'not-allowed', opacity: account?.metaConfigured ? 1 : 0.5 }}>
                Conectar Instagram
              </button>
            </>
          )}
        </div>

        <div style={{ background: '#0f0a1e', border: '1px solid #1e1b4b', borderRadius: 8, padding: 20 }}>
          <p style={{ fontSize: 10, color: '#4a5568', letterSpacing: '.08em', marginBottom: 8 }}>CHATGPT / OPENAI</p>
          <p style={{ color: account?.openaiConfigured ? '#34d399' : '#f87171', fontWeight: 700, marginBottom: 8 }}>
            {account?.openaiConfigured ? 'Configurado' : 'OPENAI_API_KEY ausente'}
          </p>
          <p style={{ color: '#7a9bbf', fontSize: 12 }}>Usado para legenda, hashtags e imagens dos slides.</p>
        </div>

        <div style={{ background: '#0f0a1e', border: '1px solid #1e1b4b', borderRadius: 8, padding: 20 }}>
          <p style={{ fontSize: 10, color: '#4a5568', letterSpacing: '.08em', marginBottom: 8 }}>GERAR DO BLOG</p>
          <select value={selectedPost} onChange={e => setSelectedPost(e.target.value)} style={{ width: '100%', marginBottom: 10, padding: '8px 10px', background: '#0a0a14', border: '1px solid #1e1b4b', borderRadius: 6, color: '#e8f4ff', fontSize: 13 }}>
            <option value="">Escolha um artigo publicado</option>
            {posts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <button onClick={generateFromPost} disabled={!selectedPost || generating !== null || !account?.openaiConfigured} style={{ background: '#3730a3', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', width: '100%' }}>
            {generating ? 'Gerando slides e imagens...' : 'Gerar carrossel com ChatGPT'}
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#7a9bbf' }}>Carregando...</p>
      ) : carousels.length === 0 ? (
        <p style={{ color: '#7a9bbf' }}>Nenhum carrossel ainda. Gere a partir de um artigo acima.</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {carousels.map(c => (
            <Link key={c.id} href={`/admin/instagram/${c.id}`} style={{ textDecoration: 'none', display: 'block', background: '#0f0a1e', border: '1px solid #1e1b4b', borderRadius: 8, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ color: '#fff', fontWeight: 600, marginBottom: 4 }}>{c.title}</p>
                  <p style={{ color: '#7a9bbf', fontSize: 12 }}>{c.post?.title || 'Sem artigo vinculado'} · {c.slides.length} slides</p>
                </div>
                <span style={{ color: statusColor[c.status] || '#7a9bbf', fontSize: 12, fontWeight: 700 }}>{statusLabel[c.status] || c.status}</span>
              </div>
              {c.scheduledAt && <p style={{ color: '#a78bfa', fontSize: 11, marginTop: 8 }}>Agendado: {new Date(c.scheduledAt).toLocaleString('pt-BR')}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
