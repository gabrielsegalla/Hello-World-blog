'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })
    if (res.ok) { router.push('/admin/posts') } else { const d = await res.json(); setError(d.error || 'Erro') }
    setLoading(false)
  }

  const inp: React.CSSProperties = { width:'100%', padding:'11px 14px', background:'#13102a', border:'1px solid #1e1b4b', borderRadius:6, color:'#e8f4ff', fontSize:14, outline:'none', fontFamily:'inherit' }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'0 5%', position:'relative', zIndex:1 }}>
      <div style={{ background:'#0f0a1e', border:'1px solid #2d2a6e', borderRadius:12, padding:'48px 40px', width:'100%', maxWidth:400 }}>
        <p style={{ fontSize:11, color:'#7c3aed', letterSpacing:'.12em', marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}>// admin</p>
        <h1 style={{ fontSize:24, fontWeight:700, marginBottom:32, color:'#fff' }}>Entrar no painel</h1>
        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div>
            <label style={{ fontSize:11, color:'#7a9bbf', letterSpacing:'.08em', display:'block', marginBottom:6 }}>EMAIL</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required style={inp} />
          </div>
          <div>
            <label style={{ fontSize:11, color:'#7a9bbf', letterSpacing:'.08em', display:'block', marginBottom:6 }}>SENHA</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required style={inp} />
          </div>
          {error && <p style={{ fontSize:13, color:'#f87171' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{ background:loading?'#1e1b4b':'#7c3aed', color:loading?'#4a5568':'#fff', padding:'13px', border:'none', borderRadius:6, fontSize:14, fontWeight:700, cursor:loading?'not-allowed':'pointer', marginTop:4 }}>
            {loading ? 'Entrando...' : 'ENTRAR'}
          </button>
        </form>
      </div>
    </div>
  )
}
