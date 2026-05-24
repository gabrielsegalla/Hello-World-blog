import Link from 'next/link'

export default function EbookCTA({ variant = 'card' }: { variant?: 'card' | 'banner' }) {
  const kiwifyUrl = process.env.NEXT_PUBLIC_KIWIFY_URL || 'https://kiwify.com.br'

  if (variant === 'banner') {
    return (
      <div id="ebook" style={{
        background:'#0f0a1e',border:'1px solid #2d2a6e',borderRadius:12,
        padding:'32px 36px',display:'flex',alignItems:'center',
        justifyContent:'space-between',gap:24,flexWrap:'wrap',
        position:'relative',zIndex:1,margin:'40px 0',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:20}}>
          <div style={{
            width:52,height:52,borderRadius:8,background:'rgba(124,58,237,.15)',
            border:'1px solid #2d2a6e',display:'flex',alignItems:'center',
            justifyContent:'center',fontSize:24,flexShrink:0,
          }}>📖</div>
          <div>
            <p style={{fontSize:11,color:'#7c3aed',letterSpacing:'.08em',marginBottom:4}}>eBook</p>
            <h3 style={{fontSize:18,fontWeight:700,color:'#fff',marginBottom:4}}>
              HelloWorld — A Jornada Real de Quem Começa na Programação
            </h3>
            <p style={{fontSize:13,color:'#7a9bbf'}}>10 capítulos. 10+ anos de experiência. Sem teoria vazia.</p>
          </div>
        </div>
        <Link href={kiwifyUrl} target="_blank" style={{
          background:'#7c3aed',color:'#fff',padding:'12px 28px',borderRadius:6,
          fontSize:14,fontWeight:700,whiteSpace:'nowrap',flexShrink:0,
        }}>
          Comprar eBook →
        </Link>
      </div>
    )
  }

  return (
    <div id="ebook" style={{
      background:'linear-gradient(135deg,#0f0a1e 0%,#13102a 100%)',
      border:'1px solid #2d2a6e',borderRadius:12,padding:'40px',
      display:'flex',alignItems:'center',gap:40,flexWrap:'wrap',
    }}>
      {/* Book cover mockup */}
      <div style={{
        width:140,height:200,background:'linear-gradient(160deg,#1e1b4b,#0f0a1e)',
        border:'2px solid #3730a3',borderRadius:6,flexShrink:0,
        display:'flex',flexDirection:'column',alignItems:'center',
        justifyContent:'center',padding:16,gap:8,
        boxShadow:'8px 8px 24px rgba(0,0,0,.5)',
      }}>
        <p style={{fontSize:8,color:'#7c3aed',letterSpacing:'.1em',fontFamily:"'JetBrains Mono',monospace"}}>IA PARA DEVS</p>
        <p style={{fontSize:16,fontWeight:700,color:'#fff',textAlign:'center',lineHeight:1.2}}>Hello<span style={{color:'#a78bfa'}}>World</span></p>
        <p style={{fontSize:7,color:'#7a9bbf',textAlign:'center',lineHeight:1.4}}>A Jornada Real de Quem Começa na Programação</p>
        <p style={{fontSize:7,color:'#4a5568',marginTop:8}}>Gabriel Segalla</p>
      </div>

      <div style={{flex:1}}>
        <p style={{fontSize:11,color:'#7c3aed',letterSpacing:'.1em',marginBottom:12,fontFamily:"'JetBrains Mono',monospace"}}>// eBook</p>
        <h2 style={{fontSize:26,fontWeight:700,marginBottom:8,color:'#fff',lineHeight:1.2}}>
          HelloWorld
        </h2>
        <p style={{fontSize:16,color:'#a78bfa',marginBottom:16}}>A Jornada Real de Quem Começa na Programação</p>
        <p style={{fontSize:14,color:'#7a9bbf',lineHeight:1.8,marginBottom:24,maxWidth:420}}>
          Um guia prático com 10 anos de experiência real — sobre carreira, IA, inglês, primeiro emprego e como se posicionar no mercado.
        </p>
        <div style={{display:'flex',alignItems:'center',gap:20,flexWrap:'wrap'}}>
          <div>
            <p style={{fontSize:32,fontWeight:700,color:'#fff',lineHeight:1}}>
              <span style={{fontSize:16,verticalAlign:'top',marginTop:6,display:'inline-block'}}>R$</span>27
            </p>
            <p style={{fontSize:11,color:'#4a5568'}}>pagamento único</p>
          </div>
          <Link href={kiwifyUrl} target="_blank" style={{
            background:'#7c3aed',color:'#fff',padding:'14px 32px',borderRadius:6,
            fontSize:14,fontWeight:700,display:'inline-block',
          }}>
            Comprar eBook →
          </Link>
        </div>
      </div>
    </div>
  )
}
