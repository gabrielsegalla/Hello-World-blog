'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const NAV_LINKS = [
  { href: '/', label: 'Início' },
  { href: '/artigos', label: 'Artigos' },
  { href: '/artigos', label: 'Categorias' },
  { href: '/ebook', label: 'eBook' },
  { href: '/#sobre', label: 'Sobre' },
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
          <Link href="/" className="nav-link">Início</Link>
          <Link href="/artigos" className="nav-link">Artigos</Link>
          <Link href="/artigos" className="nav-link">Categorias</Link>
          <Link href="/#sobre" className="nav-link">Sobre</Link>
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
            <Link key={l.label} href={l.href} className="nav-link-mobile" onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
