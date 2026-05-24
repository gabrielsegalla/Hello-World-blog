'use client'
import { useState } from 'react'

export default function NewsletterInline() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function subscribe(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const res = await fetch('/api/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    })
    const data = await res.json()
    if (res.ok) {
      localStorage.setItem('newsletter_subscribed', '1')
      setStatus('success')
    } else {
      setErrorMsg(data.error || 'Erro')
      setStatus('error')
    }
  }

  return (
    <div style={{
      background:'#0f0a1e',border:'1px solid #2d2a6e',borderRadius:12,
      padding:'40px',textAlign:'center',margin:'64px 0',
    }}>
      <p style={{fontSize:11,color:'#7c3aed',letterSpacing:'.1em',marginBottom:12,fontFamily:"'JetBrains Mono',monospace"}}>
        // newsletter
      </p>
      {status === 'success' ? (
        <div>
          <p style={{fontSize:36,marginBottom:12}}>🎉</p>
          <h3 style={{fontSize:20,fontWeight:700,color:'#fff',marginBottom:8}}>Você está dentro!</h3>
          <p style={{fontSize:14,color:'#7a9bbf'}}>Confira sua caixa de entrada — um email de boas-vindas está a caminho.</p>
        </div>
      ) : (
        <>
          <h3 style={{fontSize:24,fontWeight:700,marginBottom:8,color:'#fff'}}>
            Fique por dentro dos próximos artigos
          </h3>
          <p style={{fontSize:14,color:'#7a9bbf',marginBottom:28,lineHeight:1.7}}>
            Conteúdo real sobre IA e dev, direto no seu email. Sem spam.
          </p>
          <form onSubmit={subscribe} style={{display:'flex',gap:10,maxWidth:480,margin:'0 auto',flexWrap:'wrap',justifyContent:'center'}}>
            <input
              type="text" placeholder="Nome (opcional)"
              value={name} onChange={e=>setName(e.target.value)}
              style={{
                flex:'0 0 140px',padding:'11px 14px',background:'#13102a',
                border:'1px solid #1e1b4b',borderRadius:6,color:'#e8f4ff',
                fontSize:13,outline:'none',fontFamily:'inherit',
              }}
            />
            <input
              type="email" placeholder="Seu email *" required
              value={email} onChange={e=>setEmail(e.target.value)}
              style={{
                flex:1,minWidth:180,padding:'11px 14px',background:'#13102a',
                border:'1px solid #1e1b4b',borderRadius:6,color:'#e8f4ff',
                fontSize:13,outline:'none',fontFamily:'inherit',
              }}
            />
            <button type="submit" disabled={status==='loading'} style={{
              background:'#7c3aed',color:'#fff',padding:'11px 22px',border:'none',
              borderRadius:6,fontSize:13,fontWeight:700,whiteSpace:'nowrap',
              opacity:status==='loading'?.7:1,
            }}>
              {status==='loading' ? '...' : 'Inscrever →'}
            </button>
          </form>
          {errorMsg && <p style={{fontSize:13,color:'#f87171',marginTop:10}}>{errorMsg}</p>}
        </>
      )}
    </div>
  )
}
