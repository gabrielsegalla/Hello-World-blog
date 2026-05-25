import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { normalizeEmail } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export default async function UnsubscribePage({ searchParams }: { searchParams: { email?: string } }) {
  const email = searchParams.email ? normalizeEmail(decodeURIComponent(searchParams.email)) : ''

  if (!email) {
    return <UnsubscribeResult error="Link inválido — email não informado." />
  }

  const subscriber = await prisma.subscriber.findUnique({ where: { email } })

  if (!subscriber) {
    return <UnsubscribeResult error="Email não encontrado na lista de inscritos." />
  }

  if (subscriber.active) {
    await prisma.subscriber.update({ where: { email }, data: { active: false } })
  }

  return <UnsubscribeResult success />
}

function UnsubscribeResult({ success, error }: { success?: boolean; error?: string }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 5%', position: 'relative', zIndex: 1,
    }}>
      <div style={{
        background: '#0f0a1e', border: '1px solid #2d2a6e', borderRadius: 12,
        padding: '48px 40px', width: '100%', maxWidth: 440, textAlign: 'center',
      }}>
        <p style={{ fontSize: 11, color: '#7c3aed', letterSpacing: '.12em', marginBottom: 16, fontFamily: "'JetBrains Mono',monospace" }}>
          // newsletter
        </p>

        {success ? (
          <>
            <p style={{ fontSize: 36, marginBottom: 16 }}>✓</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Inscrição cancelada</h1>
            <p style={{ fontSize: 14, color: '#7a9bbf', lineHeight: 1.7, marginBottom: 24 }}>
              Você não receberá mais emails da newsletter segalla.dev.
            </p>
            <Link href="/" style={{ fontSize: 14, color: '#7c3aed' }}>← Voltar ao site</Link>
          </>
        ) : (
          <>
            <p style={{ fontSize: 36, marginBottom: 16 }}>⚠</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Não foi possível cancelar</h1>
            <p style={{ fontSize: 14, color: '#f87171', marginBottom: 24 }}>{error}</p>
            <Link href="/" style={{ fontSize: 14, color: '#7c3aed' }}>← Voltar ao site</Link>
          </>
        )}
      </div>
    </div>
  )
}
