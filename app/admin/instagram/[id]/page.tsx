'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Slide {
  id: number
  order: number
  headline: string
  bodyText: string
  imageUrl: string | null
}

interface Carousel {
  id: number
  title: string
  caption: string
  hashtags: string
  status: string
  scheduledAt: string | null
  publishedAt: string | null
  igMediaId: string | null
  errorMessage: string | null
  slides: Slide[]
  post: { title: string; slug: string } | null
}

export default function AdminInstagramDetailPage({ params }: { params: { id: string } }) {
  const [carousel, setCarousel] = useState<Carousel | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [scheduleAt, setScheduleAt] = useState('')
  const router = useRouter()

  function load() {
    fetch(`/api/instagram/carousels/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setCarousel(data)
        if (data.scheduledAt) {
          const d = new Date(data.scheduledAt)
          setScheduleAt(d.toISOString().slice(0, 16))
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [params.id])

  async function save() {
    if (!carousel) return
    setSaving(true)
    const res = await fetch(`/api/instagram/carousels/${carousel.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: carousel.title,
        caption: carousel.caption,
        hashtags: carousel.hashtags,
      }),
    })
    setSaving(false)
    if (res.ok) setCarousel(await res.json())
  }

  async function schedule() {
    if (!carousel || !scheduleAt) return
    setSaving(true)
    const res = await fetch(`/api/instagram/carousels/${carousel.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'schedule', scheduledAt: new Date(scheduleAt).toISOString() }),
    })
    setSaving(false)
    if (res.ok) setCarousel(await res.json())
    else alert((await res.json()).error)
  }

  async function publishNow() {
    if (!carousel || !confirm('Publicar agora no Instagram?')) return
    setSaving(true)
    const res = await fetch(`/api/instagram/carousels/${carousel.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'publish' }),
    })
    setSaving(false)
    if (res.ok) setCarousel(await res.json())
    else alert((await res.json()).error)
  }

  async function remove() {
    if (!confirm('Excluir este carrossel?')) return
    await fetch(`/api/instagram/carousels/${params.id}`, { method: 'DELETE' })
    router.push('/admin/instagram')
  }

  if (loading) return <p style={{ color: '#7a9bbf', padding: 40 }}>Carregando...</p>
  if (!carousel) return <p style={{ color: '#f87171', padding: 40 }}>Carrossel não encontrado</p>

  return (
    <div style={{ minHeight: '100vh', padding: '32px 5%', position: 'relative', zIndex: 1 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{carousel.title}</h1>
        <p style={{ color: '#7a9bbf', fontSize: 12, marginTop: 4 }}>Status: {carousel.status}{carousel.post ? ` · ${carousel.post.title}` : ''}</p>
        {carousel.errorMessage && <p style={{ color: '#f87171', fontSize: 12, marginTop: 8 }}>{carousel.errorMessage}</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        <div>
          <p style={{ fontSize: 11, color: '#7c3aed', marginBottom: 12, letterSpacing: '.1em' }}>PREVIEW DOS SLIDES</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 12 }}>
            {carousel.slides.map(slide => (
              <div key={slide.id} style={{ background: '#0f0a1e', border: '1px solid #1e1b4b', borderRadius: 8, overflow: 'hidden' }}>
                {slide.imageUrl ? (
                  <img src={slide.imageUrl} alt={slide.headline} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                ) : (
                  <div style={{ aspectRatio: '1', background: '#13102a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4a5568', fontSize: 12 }}>Sem imagem</div>
                )}
                <div style={{ padding: 10 }}>
                  <p style={{ fontSize: 10, color: '#7c3aed' }}>Slide {slide.order}</p>
                  <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{slide.headline}</p>
                  <p style={{ color: '#7a9bbf', fontSize: 11, marginTop: 4 }}>{slide.bodyText}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ background: '#0f0a1e', border: '1px solid #1e1b4b', borderRadius: 8, padding: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#7c3aed', marginBottom: 6 }}>TÍTULO INTERNO</label>
            <input value={carousel.title} onChange={e => setCarousel({ ...carousel, title: e.target.value })} style={{ width: '100%', padding: 10, background: '#0a0a14', border: '1px solid #1e1b4b', borderRadius: 6, color: '#fff', marginBottom: 12 }} />

            <label style={{ display: 'block', fontSize: 11, color: '#7c3aed', marginBottom: 6 }}>LEGENDA</label>
            <textarea value={carousel.caption} onChange={e => setCarousel({ ...carousel, caption: e.target.value })} rows={8} style={{ width: '100%', padding: 10, background: '#0a0a14', border: '1px solid #1e1b4b', borderRadius: 6, color: '#fff', marginBottom: 12, resize: 'vertical' }} />

            <label style={{ display: 'block', fontSize: 11, color: '#7c3aed', marginBottom: 6 }}>HASHTAGS</label>
            <textarea value={carousel.hashtags} onChange={e => setCarousel({ ...carousel, hashtags: e.target.value })} rows={3} style={{ width: '100%', padding: 10, background: '#0a0a14', border: '1px solid #1e1b4b', borderRadius: 6, color: '#fff', marginBottom: 12, resize: 'vertical' }} />

            <button onClick={save} disabled={saving} style={{ width: '100%', background: '#3730a3', color: '#fff', border: 'none', padding: 10, borderRadius: 6, cursor: 'pointer', marginBottom: 8 }}>
              Salvar texto
            </button>
          </div>

          <div style={{ background: '#0f0a1e', border: '1px solid #1e1b4b', borderRadius: 8, padding: 16 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#7c3aed', marginBottom: 6 }}>AGENDAR PUBLICAÇÃO</label>
            <input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} style={{ width: '100%', padding: 10, background: '#0a0a14', border: '1px solid #1e1b4b', borderRadius: 6, color: '#fff', marginBottom: 10 }} />
            <button onClick={schedule} disabled={saving || !scheduleAt} style={{ width: '100%', background: '#7c3aed', color: '#fff', border: 'none', padding: 10, borderRadius: 6, cursor: 'pointer', marginBottom: 8 }}>
              Agendar
            </button>
            <button onClick={publishNow} disabled={saving || carousel.status === 'published'} style={{ width: '100%', background: '#059669', color: '#fff', border: 'none', padding: 10, borderRadius: 6, cursor: 'pointer', marginBottom: 8 }}>
              Publicar agora
            </button>
            <button onClick={remove} style={{ width: '100%', background: 'transparent', color: '#f87171', border: '1px solid #7f1d1d', padding: 10, borderRadius: 6, cursor: 'pointer' }}>
              Excluir carrossel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
