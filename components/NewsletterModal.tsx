'use client'
import { useEffect, useState } from 'react'

export default function NewsletterModal() {
  const [show, setShow] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    // Only show if user hasn't subscribed or dismissed
    const dismissed = localStorage.getItem('newsletter_dismissed')
    const subscribed = localStorage.getItem('newsletter_subscribed')
    if (!dismissed && !subscribed) {
      const timer = setTimeout(() => setShow(true), 4000)
      return () => clearTimeout(timer)
    }
  }, [])

  function dismiss() {
    localStorage.setItem('newsletter_dismissed', '1')
    setShow(false)
  }

  async function subscribe(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('newsletter_subscribed', '1')
        setStatus('success')
        setTimeout(() => setShow(false), 3000)
      } else {
        setErrorMsg(data.error || 'Erro ao inscrever')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Erro de conexão')
      setStatus('error')
    }
  }

  if (!show) return null

  return (
    <div style={{
      position:'fixed',inset:0,zIndex:999,
      background:'rgba(10,10,20,0.85)',backdropFilter:'blur(8px)',
      display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',
    }} onClick={e => { if (e.target === e.currentTarget) dismiss() }}>
      <div style={{
        background:'#0f0a1e',border:'1px solid #2d2a6e',
        borderRadius:12,padding:'40px 36px',width:'100%',maxWidth:440,
        position:'relative',
      }}>
        {/* Close */}
        <button onClick={dismiss} style={{
          position:'absolute',top:16,right:16,background:'transparent',
          border:'none',color:'#7a9bbf',fontSize:20,lineHeight:1,cursor:'pointer',
        }}>×</button>

        {status === 'success' ? (
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <p style={{fontSize:40,marginBottom:16}}>🎉</p>
            <h3 style={{fontSize:22,fontWeight:700,marginBottom:8,color:'#fff'}}>Inscrição confirmada!</h3>
            <p style={{fontSize:14,color:'#7a9bbf'}}>Você vai receber um email de boas-vindas em breve.</p>
          </div>
        ) : (
          <>
            <p style={{fontSize:11,color:'#7c3aed',letterSpacing:'.1em',marginBottom:12,fontFamily:"'JetBrains Mono',monospace"}}>
              // newsletter
            </p>
            <h2 style={{fontSize:24,fontWeight:700,marginBottom:8,color:'#fff',lineHeight:1.2}}>
              Conteúdo real sobre<br/><span style={{color:'#a78bfa'}}>dev + IA</span> direto no seu email
            </h2>
            <p style={{fontSize:14,color:'#7a9bbf',marginBottom:28,lineHeight:1.7}}>
              Sem spam. Só artigos que eu mesmo escreveria para mim — sobre o que realmente funciona no dia a dia de dev.
            </p>

            <form onSubmit={subscribe} style={{display:'flex',flexDirection:'column',gap:12}}>
              <input
                type="text" placeholder="Seu nome (opcional)"
                value={name} onChange={e=>setName(e.target.value)}
                style={{
                  padding:'11px 14px',background:'#13102a',border:'1px solid #1e1b4b',
                  borderRadius:6,color:'#e8f4ff',fontSize:14,outline:'none',
                  fontFamily:'inherit',
                }}
              />
              <input
                type="email" placeholder="Seu melhor email *"
                value={email} onChange={e=>setEmail(e.target.value)} required
                style={{
                  padding:'11px 14px',background:'#13102a',border:'1px solid #1e1b4b',
                  borderRadius:6,color:'#e8f4ff',fontSize:14,outline:'none',
                  fontFamily:'inherit',
                }}
              />
              {errorMsg && <p style={{fontSize:13,color:'#f87171'}}>{errorMsg}</p>}
              <button type="submit" disabled={status==='loading'} style={{
                background:'#7c3aed',color:'#fff',padding:'12px',
                border:'none',borderRadius:6,fontSize:14,fontWeight:700,
                opacity:status==='loading'?.7:1,marginTop:4,
                transition:'opacity .15s',
              }}>
                {status==='loading' ? 'Inscrevendo...' : 'QUERO RECEBER →'}
              </button>
            </form>

            <p style={{fontSize:11,color:'#4a5568',textAlign:'center',marginTop:14}}>
              Cancele a qualquer momento. Sem spam.
            </p>

            <button onClick={dismiss} style={{
              display:'block',width:'100%',textAlign:'center',marginTop:8,
              background:'transparent',border:'none',color:'#4a5568',fontSize:12,
              cursor:'pointer',
            }}>
              Agora não
            </button>
          </>
        )}
      </div>
    </div>
  )
}
