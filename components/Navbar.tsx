'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{
      position:'fixed',top:0,left:0,right:0,zIndex:100,
      background:'rgba(10,10,20,0.92)',backdropFilter:'blur(16px)',
      borderBottom:'1px solid #1e1b4b',
    }}>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'0 5%',height:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        {/* Logo */}
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,fontFamily:"'JetBrains Mono',monospace"}}>
          <span style={{color:'#7c3aed',fontSize:18,fontWeight:700}}>&gt;_</span>
          <span style={{color:'#fff',fontSize:15,fontWeight:600}}>dev.segalla</span>
        </Link>

        {/* Links */}
        <div style={{display:'flex',alignItems:'center',gap:32}}>
          {[
            {href:'/',label:'Início'},
            {href:'/#artigos',label:'Artigos'},
            {href:'/#sobre',label:'Sobre'},
          ].map(l => (
            <Link key={l.label} href={l.href} style={{fontSize:14,color:'#7a9bbf',transition:'color .15s'}}
              onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
              onMouseLeave={e=>(e.currentTarget.style.color='#7a9bbf')}
            >{l.label}</Link>
          ))}
        </div>

        {/* CTA */}
        <Link href="/#ebook" style={{
          display:'flex',alignItems:'center',gap:8,
          background:'#7c3aed',color:'#fff',padding:'8px 18px',
          borderRadius:6,fontSize:13,fontWeight:600,
          transition:'opacity .15s',
        }}
          onMouseEnter={e=>e.currentTarget.style.opacity='.85'}
          onMouseLeave={e=>e.currentTarget.style.opacity='1'}
        >
          <span>📖</span> Comprar eBook
        </Link>
      </div>
    </nav>
  )
}
