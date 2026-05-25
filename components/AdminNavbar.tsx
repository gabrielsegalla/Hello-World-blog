'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

function getBackHref(pathname: string): string | null {
  if (pathname === '/admin/posts') return null
  if (pathname === '/admin/posts/new' || /^\/admin\/posts\/\d+$/.test(pathname)) return '/admin/posts'
  if (pathname === '/admin/newsletter' || pathname === '/admin/instagram') return '/admin/posts'
  if (/^\/admin\/instagram\/\d+$/.test(pathname)) return '/admin/instagram'
  return '/admin/posts'
}

const linkBase: React.CSSProperties = {
  fontSize: 12,
  padding: '8px 14px',
  borderRadius: 6,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
}

function navLink(active: boolean): React.CSSProperties {
  return {
    ...linkBase,
    color: active ? '#fff' : '#a78bfa',
    border: `1px solid ${active ? '#7c3aed' : '#3730a3'}`,
    background: active ? 'rgba(124,58,237,.25)' : 'rgba(124,58,237,.1)',
  }
}

export default function AdminNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const backHref = getBackHref(pathname)

  if (pathname === '/admin/login') return null

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const sections = [
    { href: '/admin/posts', label: 'Painel' },
    { href: '/admin/newsletter', label: 'Newsletter' },
    { href: '/admin/instagram', label: 'Instagram' },
  ]

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(10, 10, 20, 0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #1e1b4b',
        padding: '12px 5%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {backHref && (
            <Link
              href={backHref}
              style={{
                ...linkBase,
                color: '#7a9bbf',
                border: '1px solid #1e1b4b',
              }}
            >
              ← Voltar
            </Link>
          )}
          <span
            style={{
              fontSize: 11,
              color: '#7c3aed',
              letterSpacing: '.12em',
              fontFamily: "'JetBrains Mono',monospace",
            }}
          >
            // admin
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {sections.map(({ href, label }) => {
            const active =
              href === '/admin/posts'
                ? pathname === '/admin/posts' || pathname.startsWith('/admin/posts/')
                : pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link key={href} href={href} style={navLink(active)}>
                {label}
              </Link>
            )
          })}
          <Link
            href="/"
            target="_blank"
            style={{
              ...linkBase,
              color: '#7a9bbf',
              border: '1px solid #1e1b4b',
            }}
          >
            Ver site →
          </Link>
          <button
            onClick={logout}
            style={{
              ...linkBase,
              background: 'transparent',
              border: '1px solid #1e1b4b',
              color: '#7a9bbf',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  )
}
