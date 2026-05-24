import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Navbar from '@/components/Navbar'
import EbookCTA from '@/components/EbookCTA'
import NewsletterInline from '@/components/NewsletterInline'
import { marked } from 'marked'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } })
  if (!post) return {}
  return { title: `${post.title} — segalla.dev`, description: post.excerpt || post.subtitle || '' }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug, published: true } })
  if (!post) notFound()

  const html = marked(post.content)
  const tags = post.tags?.split(',').filter(Boolean) || []
  const date = new Date(post.createdAt).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })

  return (
    <>
      <Navbar />
      <main style={{ maxWidth:720, margin:'0 auto', padding:'100px 5% 60px', position:'relative', zIndex:1 }}>

        <Link href="/" style={{ fontSize:13, color:'#7c3aed', display:'inline-block', marginBottom:36 }}>
          ← Voltar
        </Link>

        {/* Category + time */}
        <div style={{ display:'flex', gap:12, marginBottom:16 }}>
          <span style={{ fontSize:11, color:'#7c3aed', letterSpacing:'.1em', fontWeight:600 }}>
            {post.category?.toUpperCase()}
          </span>
          <span style={{ fontSize:11, color:'#4a5568' }}>{post.readTime} min de leitura</span>
        </div>

        {/* Title */}
        <h1 style={{ fontSize:'clamp(1.8rem,4vw,2.6rem)', fontWeight:700, lineHeight:1.2, marginBottom:12, color:'#fff' }}>
          {post.title}
        </h1>
        {post.subtitle && (
          <p style={{ fontSize:18, color:'#7a9bbf', marginBottom:28, lineHeight:1.5 }}>{post.subtitle}</p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display:'flex', gap:8, marginBottom:32, flexWrap:'wrap' }}>
            {tags.map(t => (
              <span key={t} style={{
                fontSize:11, padding:'3px 10px', background:'rgba(124,58,237,.1)',
                border:'1px solid #3730a3', color:'#a78bfa', borderRadius:4, letterSpacing:'.05em',
              }}>{t}</span>
            ))}
          </div>
        )}

        {/* Author */}
        <div style={{
          display:'flex', alignItems:'center', gap:12,
          paddingBottom:28, borderBottom:'1px solid #1e1b4b', marginBottom:40,
        }}>
          <div style={{
            width:42, height:42, borderRadius:'50%',
            background:'linear-gradient(135deg,#3730a3,#1e1b4b)',
            border:'2px solid #7c3aed',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:16, fontWeight:700, color:'#a78bfa',
          }}>G</div>
          <div>
            <p style={{ fontSize:14, fontWeight:600, color:'#fff' }}>Gabriel Segalla</p>
            <p style={{ fontSize:12, color:'#4a5568' }}>{date}</p>
          </div>
        </div>

        {/* Content */}
        <article className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        {/* Newsletter */}
        <NewsletterInline />

        {/* Ebook */}
        <EbookCTA variant="banner" />

        <Link href="/" style={{ fontSize:13, color:'#7c3aed', display:'inline-block', marginTop:32 }}>
          ← Mais artigos
        </Link>
      </main>

      <footer style={{
        borderTop:'1px solid #1e1b4b', padding:'28px 5%',
        display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12,
        position:'relative', zIndex:1,
      }}>
        <span style={{ fontSize:13, color:'#7c3aed', fontFamily:"'JetBrains Mono',monospace" }}>&gt;_ segalla.dev</span>
        <p style={{ fontSize:12, color:'#4a5568' }}>© 2025 Gabriel Rodrigues Segalla</p>
      </footer>
    </>
  )
}
