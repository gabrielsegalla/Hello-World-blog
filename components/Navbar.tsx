'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/artigos', label: 'Artigos' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8) }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <span className="navbar-brand-prompt">&gt;_</span>
          <span className="navbar-brand-name">dev.segalla</span>
        </Link>

        <div className="navbar-desktop">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="nav-link">{l.label}</Link>
          ))}
        </div>

        <div className="navbar-actions">
          <Link href="/ebook" className="navbar-cta">
            <span className="navbar-cta-icon" aria-hidden="true">📖</span>
            <span className="navbar-cta-label">Comprar eBook</span>
          </Link>
          <button
            type="button"
            className="navbar-toggle"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(v => !v)}
          >
            <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="navbar-mobile">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="nav-link-mobile" onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
