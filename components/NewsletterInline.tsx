'use client'
import { useState } from 'react'

interface NewsletterInlineProps {
  variant?: 'default' | 'compact'
}

export default function NewsletterInline({ variant = 'default' }: NewsletterInlineProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function subscribe(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    const res = await fetch('/api/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    })
    const data = await res.json()
    if (res.ok) {
      localStorage.setItem('newsletter_subscribed', '1')
      setStatus('success')
    } else {
      setErrorMsg(data.error || 'Erro')
      setStatus('error')
    }
  }

  return (
    <div className={`newsletter newsletter-${variant}`}>
      <p className="newsletter-tag">// newsletter</p>

      {status === 'success' ? (
        <div className="newsletter-success">
          <p className="newsletter-success-emoji">🎉</p>
          <h3 className="newsletter-success-title">Você está dentro!</h3>
          <p className="newsletter-success-text">
            Confira sua caixa de entrada — um email de boas-vindas está a caminho.
          </p>
        </div>
      ) : (
        <>
          <h3 className="newsletter-title">
            {variant === 'compact' ? 'Receba os próximos artigos' : 'Fique por dentro dos próximos artigos'}
          </h3>
          <p className="newsletter-desc">
            Conteúdo real sobre IA e dev, direto no seu email. Sem spam.
          </p>
          <form onSubmit={subscribe} className="newsletter-form">
            {variant === 'default' && (
              <input
                type="text"
                placeholder="Nome (opcional)"
                value={name}
                onChange={e => setName(e.target.value)}
                className="newsletter-input newsletter-input-name"
              />
            )}
            <input
              type="email"
              placeholder="Seu email *"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="newsletter-input"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="newsletter-submit"
            >
              {status === 'loading' ? '...' : 'Inscrever →'}
            </button>
          </form>
          {errorMsg && <p className="newsletter-error">{errorMsg}</p>}
        </>
      )}
    </div>
  )
}
