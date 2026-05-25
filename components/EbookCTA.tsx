import Link from 'next/link'

type Variant = 'card' | 'banner' | 'compact'

export default function EbookCTA({ variant = 'card' }: { variant?: Variant }) {
  const kiwifyUrl = process.env.NEXT_PUBLIC_KIWIFY_URL || 'https://kiwify.com.br'

  if (variant === 'compact') {
    return (
      <div className="ebook-compact" id="ebook">
        <div className="ebook-compact-cover" aria-hidden="true">
          <span className="ebook-compact-cover-label">IA PARA DEVS</span>
          <span className="ebook-compact-cover-title">Hello<span style={{ color: '#a78bfa' }}>World</span></span>
        </div>
        <p className="ebook-tag">// eBook</p>
        <h3 className="ebook-compact-title">HelloWorld</h3>
        <p className="ebook-compact-sub">A Jornada Real de Quem Começa na Programação</p>
        <p className="ebook-compact-desc">
          10 capítulos. 10+ anos de experiência. Sem teoria vazia.
        </p>
        <div className="ebook-compact-footer">
          <span className="ebook-compact-price"><span className="ebook-compact-currency">R$</span>27</span>
          <Link href={kiwifyUrl} target="_blank" className="ebook-compact-cta">
            Comprar →
          </Link>
        </div>
      </div>
    )
  }

  if (variant === 'banner') {
    return (
      <div className="ebook-banner" id="ebook">
        <div className="ebook-banner-left">
          <div className="ebook-banner-icon" aria-hidden="true">📖</div>
          <div>
            <p className="ebook-tag">eBook</p>
            <h3 className="ebook-banner-title">
              HelloWorld — A Jornada Real de Quem Começa na Programação
            </h3>
            <p className="ebook-banner-desc">
              10 capítulos. 10+ anos de experiência. Sem teoria vazia.
            </p>
          </div>
        </div>
        <Link href={kiwifyUrl} target="_blank" className="ebook-banner-cta">
          Comprar eBook →
        </Link>
      </div>
    )
  }

  return (
    <div className="ebook-card" id="ebook">
      <div className="ebook-card-cover" aria-hidden="true">
        <p className="ebook-card-cover-label">IA PARA DEVS</p>
        <p className="ebook-card-cover-title">Hello<span style={{ color: '#a78bfa' }}>World</span></p>
        <p className="ebook-card-cover-sub">A Jornada Real de Quem Começa na Programação</p>
        <p className="ebook-card-cover-author">Gabriel Segalla</p>
      </div>
      <div className="ebook-card-body">
        <p className="ebook-tag">// eBook</p>
        <h2 className="ebook-card-title">HelloWorld</h2>
        <p className="ebook-card-sub">A Jornada Real de Quem Começa na Programação</p>
        <p className="ebook-card-desc">
          Um guia prático com 10 anos de experiência real — sobre carreira, IA, inglês,
          primeiro emprego e como se posicionar no mercado.
        </p>
        <div className="ebook-card-footer">
          <div>
            <p className="ebook-card-price">
              <span className="ebook-card-currency">R$</span>27
            </p>
            <p className="ebook-card-pay">pagamento único</p>
          </div>
          <Link href={kiwifyUrl} target="_blank" className="ebook-card-cta">
            Comprar eBook →
          </Link>
        </div>
      </div>
    </div>
  )
}
