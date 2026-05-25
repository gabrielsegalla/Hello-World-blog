import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main style={{
        minHeight: '70vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '120px 5% 60px',
        textAlign: 'center', position: 'relative', zIndex: 1,
      }}>
        <p style={{ fontSize: 11, color: '#7c3aed', letterSpacing: '.12em', marginBottom: 16, fontFamily: "'JetBrains Mono',monospace" }}>
          // 404
        </p>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: '#fff', marginBottom: 12 }}>
          Página não encontrada
        </h1>
        <p style={{ fontSize: 16, color: '#7a9bbf', marginBottom: 32, maxWidth: 420, lineHeight: 1.7 }}>
          O artigo ou página que você procura não existe ou foi removido.
        </p>
        <Link href="/" style={{
          background: '#7c3aed', color: '#fff', padding: '12px 24px',
          borderRadius: 6, fontSize: 14, fontWeight: 600,
        }}>
          ← Voltar ao início
        </Link>
      </main>
    </>
  )
}
