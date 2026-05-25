'use client'
import { useState } from 'react'

interface ShareButtonsProps {
  url: string
  title: string
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const shares = [
    { label: 'Twitter', href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, icon: '𝕏' },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, icon: 'in' },
    { label: 'WhatsApp', href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`, icon: '💬' },
  ]

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ok = window.prompt('Copie o link:', url)
      if (ok !== null) setCopied(true)
    }
  }

  return (
    <div className="share-buttons">
      <span className="share-label">// compartilhar</span>
      <div className="share-buttons-list">
        {shares.map(s => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="share-button"
            aria-label={`Compartilhar no ${s.label}`}
          >
            <span className="share-icon" aria-hidden="true">{s.icon}</span>
            {s.label}
          </a>
        ))}
        <button type="button" onClick={copyLink} className="share-button" aria-label="Copiar link">
          <span className="share-icon" aria-hidden="true">{copied ? '✓' : '🔗'}</span>
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}
