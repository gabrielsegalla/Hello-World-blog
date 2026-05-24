'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PostData { id?: number; title: string; subtitle: string; slug: string; excerpt: string; content: string; tags: string; category: string; readTime: number; published: boolean }

export default function PostEditor({ initial }: { initial?: PostData }) {
  const isEdit = !!initial?.id
  const router = useRouter()
  const [form, setForm] = useState<PostData>(initial || { title:'', subtitle:'', slug:'', excerpt:'', content:'', tags:'', category:'Dev', readTime:5, published:false })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(false)

  function set(field: keyof PostData, value: any) {
    setForm(f => ({ ...f, [field]: value }))
    if (field === 'title' && !isEdit) {
      setForm(f => ({ ...f, title: value, slug: value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').slice(0,80) }))
    }
  }

  async function save(pub: boolean) {
    setSaving(true); setError('')
    const url = isEdit ? `/api/posts/${initial!.id}` : '/api/posts'
    const res = await fetch(url, { method: isEdit?'PUT':'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...form,published:pub}) })
    if (res.ok) { router.push('/admin/posts') } else { const d = await res.json(); setError(d.error||'Erro') }
    setSaving(false)
  }

  const inp: React.CSSProperties = { width:'100%', padding:'10px 14px', background:'#13102a', border:'1px solid #1e1b4b', borderRadius:6, color:'#e8f4ff', fontSize:13, outline:'none', fontFamily:'inherit' }
  const lbl: React.CSSProperties = { fontSize:11, color:'#7a9bbf', letterSpacing:'.08em', display:'block', marginBottom:6 }

  return (
    <div style={{ minHeight:'100vh', padding:'32px 5%', position:'relative', zIndex:1 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:32, flexWrap:'wrap', gap:12 }}>
        <div>
          <p style={{ fontSize:11, color:'#7c3aed', letterSpacing:'.12em', marginBottom:4, fontFamily:"'JetBrains Mono',monospace" }}>// admin / {isEdit?'editar':'novo'}</p>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#fff' }}>{isEdit?'Editar artigo':'Novo artigo'}</h1>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <button onClick={()=>setPreview(!preview)} style={{ background:'transparent', border:'1px solid #1e1b4b', color:'#7a9bbf', padding:'8px 16px', borderRadius:6, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
            {preview?'Editar':'Preview'}
          </button>
          <button onClick={()=>save(false)} disabled={saving} style={{ background:'transparent', border:'1px solid #1e1b4b', color:'#7a9bbf', padding:'8px 16px', borderRadius:6, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
            Salvar rascunho
          </button>
          <button onClick={()=>save(true)} disabled={saving} style={{ background:'#7c3aed', color:'#fff', padding:'8px 20px', border:'none', borderRadius:6, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            {saving?'Salvando...':'Publicar'}
          </button>
        </div>
      </div>

      {error && <div style={{ background:'rgba(248,113,113,.1)', border:'1px solid #7f1d1d', borderRadius:6, padding:'12px 16px', marginBottom:20, fontSize:13, color:'#f87171' }}>{error}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 260px', gap:20, alignItems:'start' }}>
        {/* Editor */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div><label style={lbl}>TÍTULO *</label><input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Como uso IA no trabalho real..." style={inp}/></div>
          <div><label style={lbl}>SUBTÍTULO</label><input value={form.subtitle} onChange={e=>set('subtitle',e.target.value)} placeholder="Não é sobre substituição — é sobre amplificação" style={inp}/></div>
          <div><label style={lbl}>RESUMO</label><textarea value={form.excerpt} onChange={e=>set('excerpt',e.target.value)} rows={2} placeholder="Aparece na listagem de artigos..." style={{...inp,resize:'vertical'}}/></div>
          <div>
            <label style={lbl}>CONTEÚDO * (Markdown)</label>
            {preview
              ? <div className="prose" dangerouslySetInnerHTML={{__html:form.content}} style={{minHeight:400,background:'#13102a',border:'1px solid #1e1b4b',borderRadius:6,padding:16}}/>
              : <textarea value={form.content} onChange={e=>set('content',e.target.value)} rows={24} placeholder={`## Título\n\nConteúdo em **markdown**...\n\n> citação\n\n- item`} style={{...inp,resize:'vertical',lineHeight:1.7}}/>
            }
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ background:'#0f0a1e', border:'1px solid #1e1b4b', borderRadius:8, padding:20 }}>
            <p style={{ fontSize:11, color:'#7c3aed', letterSpacing:'.1em', marginBottom:16, fontFamily:"'JetBrains Mono',monospace" }}>// configurações</p>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label style={lbl}>SLUG *</label>
                <input value={form.slug} onChange={e=>set('slug',e.target.value)} placeholder="meu-artigo" style={{...inp,fontSize:12}}/>
                <p style={{fontSize:10,color:'#4a5568',marginTop:4}}>/posts/{form.slug||'slug'}</p>
              </div>
              <div>
                <label style={lbl}>CATEGORIA</label>
                <select value={form.category} onChange={e=>set('category',e.target.value)} style={{...inp,cursor:'pointer'}}>
                  {['IA na Prática','Carreira','Dev','Tutoriais','Ferramentas','Inglês'].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>TEMPO DE LEITURA (min)</label>
                <input type="number" value={form.readTime} onChange={e=>set('readTime',Number(e.target.value))} min={1} max={60} style={inp}/>
              </div>
              <div>
                <label style={lbl}>TAGS (vírgula)</label>
                <input value={form.tags} onChange={e=>set('tags',e.target.value)} placeholder="IA,Carreira,Python" style={inp}/>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <input type="checkbox" id="pub" checked={form.published} onChange={e=>set('published',e.target.checked)} style={{width:16,height:16,accentColor:'#7c3aed'}}/>
                <label htmlFor="pub" style={{fontSize:13,color:'#e8f4ff',cursor:'pointer'}}>Publicar imediatamente</label>
              </div>
            </div>
          </div>

          <div style={{ background:'#0f0a1e', border:'1px solid #1e1b4b', borderRadius:8, padding:20 }}>
            <p style={{ fontSize:11, color:'#7c3aed', letterSpacing:'.1em', marginBottom:12, fontFamily:"'JetBrains Mono',monospace" }}>// markdown</p>
            {[['## Título','h2'],['**negrito**','bold'],['*itálico*','italic'],['- item','lista'],['> texto','citação'],['`código`','inline code']].map(([s,l])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                <code style={{fontSize:11,color:'#a78bfa'}}>{s}</code>
                <span style={{fontSize:11,color:'#4a5568'}}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
