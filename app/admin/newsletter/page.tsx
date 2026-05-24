'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Post { id: number; title: string; published: boolean; slug: string }
interface Sub { id: number; email: string; name?: string; createdAt: string }

export default function AdminNewsletterPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [subs, setSubs] = useState<Sub[]>([])
  const [selectedPost, setSelectedPost] = useState('')
  const [subject, setSubject] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/posts').then(r => r.json()).then(data => setPosts(data.filter((p: Post) => p.published)))
    fetch('/api/subscribers').then(r => r.json()).then(setSubs)
  }, [])

  async function send() {
    if (!selectedPost) { setError('Selecione um post'); return }
    setSending(true)
    setError('')
    setResult(null)
    const res = await fetch('/api/send-newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: selectedPost, subject }),
    })
    const data = await res.json()
    if (res.ok) {
      setResult(data)
    } else {
      setError(data.error || 'Erro ao enviar')
    }
    setSending(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 14px', background: '#13102a',
    border: '1px solid #1e1b4b', borderRadius: 6, color: '#e8f4ff',
    fontSize: 13, outline: 'none', fontFamily: 'inherit',
  }

  return (
    <div style={{ minHeight: '100vh', padding: '32px 5%', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, color: '#7c3aed', letterSpacing: '.12em', marginBottom: 4, fontFamily: "'JetBrains Mono',monospace" }}>
            // admin / newsletter
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Enviar Newsletter</h1>
        </div>
        <Link href="/admin/posts" style={{ fontSize: 12, color: '#7a9bbf', padding: '8px 16px', border: '1px solid #1e1b4b', borderRadius: 6 }}>
          ← Voltar aos posts
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* Send form */}
        <div style={{ background: '#0f0a1e', border: '1px solid #1e1b4b', borderRadius: 10, padding: 28 }}>
          <p style={{ fontSize: 11, color: '#7c3aed', letterSpacing: '.1em', marginBottom: 20, fontFamily: "'JetBrains Mono',monospace" }}>
            // compor envio
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, color: '#7a9bbf', letterSpacing: '.08em', display: 'block', marginBottom: 6 }}>
                POST PARA DIVULGAR *
              </label>
              <select value={selectedPost} onChange={e => {
                setSelectedPost(e.target.value)
                const p = posts.find(p => p.id === Number(e.target.value))
                if (p && !subject) setSubject(`Novo artigo: ${p.title}`)
              }} style={{ ...inp, cursor: 'pointer' }}>
                <option value="">Selecione um post publicado...</option>
                {posts.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, color: '#7a9bbf', letterSpacing: '.08em', display: 'block', marginBottom: 6 }}>
                ASSUNTO DO EMAIL
              </label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Novo artigo: Como uso IA no trabalho real..."
                style={inp}
              />
              <p style={{ fontSize: 11, color: '#4a5568', marginTop: 4 }}>
                Se vazio, usa "Novo artigo: [título do post]"
              </p>
            </div>

            {/* Preview info */}
            {selectedPost && (
              <div style={{ background: '#13102a', border: '1px solid #1e1b4b', borderRadius: 6, padding: 16 }}>
                <p style={{ fontSize: 12, color: '#7c3aed', marginBottom: 8, letterSpacing: '.08em' }}>PRÉVIA DO ENVIO</p>
                <p style={{ fontSize: 13, color: '#7a9bbf' }}>
                  O email vai incluir o título, subtítulo, excerpt e um botão para ler o artigo completo, além de um banner do ebook.
                </p>
                <Link href={`/posts/${posts.find(p => p.id === Number(selectedPost))?.slug}`} target="_blank"
                  style={{ fontSize: 12, color: '#7c3aed', display: 'block', marginTop: 8 }}>
                  Ver post →
                </Link>
              </div>
            )}

            {error && (
              <div style={{ background: 'rgba(248,113,113,.1)', border: '1px solid #7f1d1d', borderRadius: 6, padding: '12px 16px', fontSize: 13, color: '#f87171' }}>
                {error}
              </div>
            )}

            {result && (
              <div style={{ background: 'rgba(124,58,237,.1)', border: '1px solid #3730a3', borderRadius: 6, padding: '16px 20px' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#a78bfa', marginBottom: 8 }}>✅ Newsletter enviada!</p>
                <p style={{ fontSize: 13, color: '#7a9bbf' }}>✓ Enviados: <strong style={{ color: '#34d399' }}>{result.sent}</strong></p>
                {result.failed > 0 && <p style={{ fontSize: 13, color: '#7a9bbf' }}>✗ Falhas: <strong style={{ color: '#f87171' }}>{result.failed}</strong></p>}
                <p style={{ fontSize: 13, color: '#7a9bbf' }}>Total: {result.total} inscritos</p>
              </div>
            )}

            <button onClick={send} disabled={sending || !selectedPost} style={{
              background: sending || !selectedPost ? '#1e1b4b' : '#7c3aed',
              color: sending || !selectedPost ? '#4a5568' : '#fff',
              padding: '13px', border: 'none', borderRadius: 6,
              fontSize: 14, fontWeight: 700, cursor: sending || !selectedPost ? 'not-allowed' : 'pointer',
              transition: 'all .15s', marginTop: 4,
            }}>
              {sending ? `⏳ Enviando para ${subs.length} inscritos...` : `📨 Enviar para ${subs.length} inscritos`}
            </button>
          </div>
        </div>

        {/* Subscribers list */}
        <div>
          <div style={{ background: '#0f0a1e', border: '1px solid #1e1b4b', borderRadius: 10, padding: 24, marginBottom: 16 }}>
            <p style={{ fontSize: 11, color: '#7c3aed', letterSpacing: '.1em', marginBottom: 16, fontFamily: "'JetBrains Mono',monospace" }}>
              // inscritos ativos
            </p>
            <p style={{ fontSize: 40, fontWeight: 700, color: '#a78bfa', lineHeight: 1 }}>{subs.length}</p>
            <p style={{ fontSize: 12, color: '#4a5568', marginTop: 4 }}>pessoas na lista</p>
          </div>

          <div style={{ background: '#0f0a1e', border: '1px solid #1e1b4b', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e1b4b' }}>
              <p style={{ fontSize: 12, color: '#7a9bbf' }}>Lista de inscritos</p>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              {subs.length === 0 ? (
                <p style={{ fontSize: 13, color: '#4a5568', padding: 20 }}>Nenhum inscrito ainda.</p>
              ) : subs.map((s, idx) => (
                <div key={s.id} style={{
                  padding: '12px 20px', borderBottom: idx < subs.length - 1 ? '1px solid #1e1b4b' : 'none',
                }}>
                  <p style={{ fontSize: 13, color: '#e8f4ff', fontWeight: 500 }}>{s.name || '—'}</p>
                  <p style={{ fontSize: 12, color: '#7a9bbf' }}>{s.email}</p>
                  <p style={{ fontSize: 11, color: '#4a5568', marginTop: 2 }}>
                    {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
