import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import EbookCTA from '@/components/EbookCTA'
import NewsletterInline from '@/components/NewsletterInline'
import NewsletterModal from '@/components/NewsletterModal'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    select: { id:true,slug:true,title:true,subtitle:true,excerpt:true,tags:true,category:true,readTime:true,createdAt:true },
  })

  const featured = posts.slice(0, 3)
  const rest = posts.slice(3)

  return (
    <>
      <Navbar />
      <NewsletterModal />

      {/* HERO */}
      <section style={{
        maxWidth:1200,margin:'0 auto',padding:'100px 5% 80px',
        display:'flex',alignItems:'center',gap:60,flexWrap:'wrap',
        position:'relative',zIndex:1,
      }}>
        {/* Left */}
        <div style={{flex:1,minWidth:300}}>
          <p style={{fontSize:12,color:'#7c3aed',letterSpacing:'.12em',marginBottom:20,fontFamily:"'JetBrains Mono',monospace"}}>
            ARTIGOS SOBRE
          </p>
          <h1 style={{fontSize:'clamp(2.4rem,5vw,3.6rem)',fontWeight:700,lineHeight:1.1,marginBottom:20}}>
            <span style={{color:'#a78bfa'}}>IA</span> que transforma.<br/>
            <span style={{color:'#7c3aed'}}>Código</span> que resolve.
          </h1>
          <p style={{fontSize:16,color:'#7a9bbf',lineHeight:1.8,marginBottom:36,maxWidth:440}}>
            Compartilho ideias, tutoriais e insights sobre Inteligência Artificial, desenvolvimento e o futuro da tecnologia.
          </p>
          <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
            <Link href="/#ebook" style={{
              display:'flex',alignItems:'center',gap:8,background:'#7c3aed',
              color:'#fff',padding:'12px 24px',borderRadius:6,fontSize:14,fontWeight:600,
            }}>
              📖 Comprar meu eBook
            </Link>
            <Link href="/#artigos" style={{
              display:'flex',alignItems:'center',gap:8,color:'#a78bfa',
              fontSize:14,padding:'12px 4px',
            }}>
              Ver últimos artigos →
            </Link>
          </div>
          <div style={{display:'flex',gap:24,marginTop:36}}>
            {[
              {icon:'</>',label:'Para devs'},
              {icon:'🤖',label:'IA prática'},
              {icon:'🚀',label:'Conteúdo direto ao ponto'},
            ].map(b => (
              <div key={b.label} style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:14,color:'#7c3aed'}}>{b.icon}</span>
                <span style={{fontSize:13,color:'#7a9bbf'}}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right - code block */}
        <div style={{flex:'0 0 380px',maxWidth:420}}>
          <div style={{
            background:'#0f0a1e',border:'1px solid #2d2a6e',borderRadius:10,
            overflow:'hidden',fontFamily:"'JetBrains Mono',monospace",fontSize:13,
          }}>
            {/* Window bar */}
            <div style={{
              background:'#13102a',borderBottom:'1px solid #1e1b4b',
              padding:'10px 16px',display:'flex',gap:6,alignItems:'center',
            }}>
              {['#f87171','#fbbf24','#34d399'].map(c => (
                <div key={c} style={{width:10,height:10,borderRadius:'50%',background:c}} />
              ))}
            </div>
            {/* Code */}
            <div style={{padding:'20px 24px',lineHeight:1.9}}>
              {[
                {t:'def ',c:'#c4b5fd'},{t:'construir_com_ia',c:'#a78bfa'},{t:'(dev):',c:'#e8f4ff'},
              ].map((s,i) => <span key={i} style={{color:s.c}}>{s.t}</span>)}
              <br/>
              {'    '}<span style={{color:'#7a9bbf'}}>habilidades</span><span style={{color:'#e8f4ff'}}> = [</span><br/>
              {['curiosidade','constância','lógica','propósito'].map(s => (
                <div key={s}>{'        '}<span style={{color:'#34d399'}}>"{s}"</span><span style={{color:'#e8f4ff'}}>,</span></div>
              ))}
              {'    '}<span style={{color:'#e8f4ff'}}>]</span><br/>
              {'    '}<span style={{color:'#c4b5fd'}}>while</span><span style={{color:'#e8f4ff'}}> evoluindo:</span><br/>
              {['criar()','aprender()','compartilhar()'].map(s => (
                <div key={s}>{'        '}<span style={{color:'#a78bfa'}}>{s}</span></div>
              ))}
              {'    '}<span style={{color:'#c4b5fd'}}>return</span><span style={{color:'#34d399'}}> impacto_positivo()</span>
            </div>
            {/* Footer */}
            <div style={{
              borderTop:'1px solid #1e1b4b',padding:'12px 20px',
              display:'flex',justifyContent:'space-between',alignItems:'center',
            }}>
              <p style={{fontSize:12,color:'#7a9bbf'}}>É assim que eu vejo o desenvolvimento com IA.</p>
              <span style={{color:'#7c3aed',fontWeight:700}}>&gt;_</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED POSTS */}
      <section id="artigos" style={{maxWidth:1200,margin:'0 auto',padding:'0 5% 80px',position:'relative',zIndex:1}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:32}}>
          <h2 style={{fontSize:22,fontWeight:700,color:'#fff'}}>Artigos em destaque</h2>
          <Link href="/#todos" style={{fontSize:14,color:'#7c3aed'}}>Ver todos os artigos →</Link>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20}}>
          {featured.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      </section>

      {/* REST OF POSTS */}
      {rest.length > 0 && (
        <section id="todos" style={{maxWidth:1200,margin:'0 auto',padding:'0 5% 60px',position:'relative',zIndex:1}}>
          <h2 style={{fontSize:20,fontWeight:700,color:'#fff',marginBottom:24}}>Mais artigos</h2>
          <div style={{display:'flex',flexDirection:'column',gap:1,background:'#1e1b4b',border:'1px solid #1e1b4b',borderRadius:10,overflow:'hidden'}}>
            {rest.map((post,idx) => {
              const tags = post.tags?.split(',').filter(Boolean) || []
              const date = new Date(post.createdAt).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})
              return (
                <Link key={post.id} href={`/posts/${post.slug}`} style={{
                  display:'flex',alignItems:'center',justifyContent:'space-between',
                  padding:'20px 24px',background:'#0f0a1e',gap:16,flexWrap:'wrap',
                  borderBottom:idx<rest.length-1?'1px solid #1e1b4b':'none',
                }}
                  onMouseEnter={e=>e.currentTarget.style.background='#13102a'}
                  onMouseLeave={e=>e.currentTarget.style.background='#0f0a1e'}
                >
                  <div style={{flex:1}}>
                    <div style={{display:'flex',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                      <span style={{fontSize:10,color:'#7c3aed',letterSpacing:'.08em'}}>{post.category?.toUpperCase()}</span>
                      <span style={{fontSize:10,color:'#4a5568'}}>{post.readTime} min</span>
                    </div>
                    <p style={{fontSize:16,fontWeight:600,color:'#e8f4ff'}}>{post.title}</p>
                  </div>
                  <span style={{fontSize:12,color:'#4a5568',flexShrink:0}}>{date}</span>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* EBOOK */}
      <section style={{maxWidth:1200,margin:'0 auto',padding:'0 5% 80px',position:'relative',zIndex:1}}>
        <EbookCTA variant="card" />
      </section>

      {/* NEWSLETTER */}
      <section style={{maxWidth:1200,margin:'0 auto',padding:'0 5% 80px',position:'relative',zIndex:1}}>
        <NewsletterInline />
      </section>

      {/* ABOUT */}
      <section id="sobre" style={{maxWidth:1200,margin:'0 auto',padding:'0 5% 80px',position:'relative',zIndex:1}}>
        <div style={{
          background:'#0f0a1e',border:'1px solid #1e1b4b',borderRadius:12,
          padding:'40px',display:'flex',gap:28,alignItems:'flex-start',flexWrap:'wrap',
        }}>
          <div style={{
            width:64,height:64,borderRadius:'50%',
            background:'linear-gradient(135deg,#3730a3,#1e1b4b)',
            border:'2px solid #7c3aed',display:'flex',alignItems:'center',
            justifyContent:'center',fontSize:24,fontWeight:700,color:'#a78bfa',flexShrink:0,
          }}>G</div>
          <div style={{flex:1}}>
            <p style={{fontSize:11,color:'#7c3aed',letterSpacing:'.1em',marginBottom:8,fontFamily:"'JetBrains Mono',monospace"}}>// sobre</p>
            <h3 style={{fontSize:20,fontWeight:700,marginBottom:4,color:'#fff'}}>Gabriel Segalla</h3>
            <p style={{fontSize:12,color:'#7c3aed',marginBottom:16,letterSpacing:'.06em'}}>FULLSTACK DEVELOPER · FLORIPA · 10+ ANOS</p>
            <p style={{fontSize:14,color:'#7a9bbf',lineHeight:1.8,maxWidth:600}}>
              Dev fullstack com mais de 10 anos de experiência. React + Python. Pós-graduação em IA e Automação. Já trabalhei para empresas brasileiras, americanas e israelenses. Escrevo sobre o que realmente funciona — sem hype.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop:'1px solid #1e1b4b',padding:'28px 5%',
        display:'flex',justifyContent:'space-between',alignItems:'center',
        flexWrap:'wrap',gap:12,position:'relative',zIndex:1,
        maxWidth:'100%',
      }}>
        <p style={{fontSize:12,color:'#4a5568'}}>© 2025 dev.segalla. Todos os direitos reservados.</p>
        <div style={{display:'flex',gap:20}}>
          {[
            {label:'GitHub',href:'https://github.com/gabriel-segalla'},
            {label:'LinkedIn',href:'https://linkedin.com/in/gabriel-segalla'},
            {label:'Email',href:'mailto:gabriel@segalla.dev'},
          ].map(l => (
            <Link key={l.label} href={l.href} target="_blank"
              style={{fontSize:12,color:'#4a5568',transition:'color .15s'}}
              onMouseEnter={e=>e.currentTarget.style.color='#7c3aed'}
              onMouseLeave={e=>e.currentTarget.style.color='#4a5568'}
            >{l.label}</Link>
          ))}
        </div>
        <p style={{fontSize:12,color:'#4a5568'}}>Feito com ☕ e código.</p>
      </footer>
    </>
  )
}

function PostCard({ post }: { post: any }) {
  const tags = post.tags?.split(',').filter(Boolean) || []
  const date = new Date(post.createdAt).toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'})

  return (
    <a href={`/posts/${post.slug}`} style={{
      display:'block',background:'#0f0a1e',border:'1px solid #1e1b4b',
      borderRadius:10,overflow:'hidden',textDecoration:'none',
      transition:'border-color .2s, transform .2s',cursor:'pointer',
    }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='#7c3aed';e.currentTarget.style.transform='translateY(-2px)'}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='#1e1b4b';e.currentTarget.style.transform='translateY(0)'}}
    >
      {/* Image placeholder */}
      <div style={{
        height:140,background:'linear-gradient(135deg,#13102a,#1e1b4b)',
        display:'flex',alignItems:'center',justifyContent:'center',fontSize:40,
      }}>
        {post.category?.includes('IA') ? '🤖' : post.category?.includes('Tutorial') ? '🛠️' : '💻'}
      </div>

      <div style={{padding:'20px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <span style={{fontSize:10,color:'#7c3aed',letterSpacing:'.08em',fontWeight:600}}>
            {post.category?.toUpperCase() || 'DEV'}
          </span>
          <span style={{fontSize:11,color:'#4a5568'}}>{post.readTime} min</span>
        </div>
        <h3 style={{fontSize:17,fontWeight:700,color:'#fff',marginBottom:8,lineHeight:1.3}}>{post.title}</h3>
        {post.excerpt && (
          <p style={{fontSize:13,color:'#7a9bbf',lineHeight:1.7,marginBottom:14,
            display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden',
          }}>{post.excerpt}</p>
        )}
        <p style={{fontSize:12,color:'#4a5568'}}>{date}</p>
      </div>
    </a>
  )
}
