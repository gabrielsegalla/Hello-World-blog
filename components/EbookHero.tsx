import Link from 'next/link'
import BookTilt from './BookTilt'

export default function EbookHero() {
  return (
    <section className="ebook-hero" id="ebook">
      <div className="ebook-hero-bg" aria-hidden="true">
        <div className="ebook-hero-grid" />
        <div className="ebook-hero-glow ebook-hero-glow-a" />
        <div className="ebook-hero-glow ebook-hero-glow-b" />
      </div>

      <div className="ebook-hero-inner">
        <div className="ebook-hero-cover">
          <BookTilt
            src="/book.png"
            alt="Capa do eBook HelloWorld — A Jornada Real de Quem Começa na Programação"
            width={280}
            height={448}
          />
        </div>

        <div className="ebook-hero-text">
          <p className="ebook-hero-tag">
            <span className="ebook-hero-tag-dot" aria-hidden="true" />
            // eBook · disponível agora
          </p>
          <h1 className="ebook-hero-title">
            HelloWorld<span className="ebook-hero-title-dot">.</span>
          </h1>
          <p className="ebook-hero-subtitle">
            A jornada real de quem começa na programação — sem teoria vazia.
          </p>
          <p className="ebook-hero-desc">
            10+ anos de experiência condensados em 10 capítulos práticos sobre carreira,
            IA, inglês e como se posicionar no mercado dev.
          </p>

          <ul className="ebook-hero-bullets">
            <li><span aria-hidden="true">✓</span> Da primeira linha de código ao primeiro emprego</li>
            <li><span aria-hidden="true">✓</span> Como usar IA pra acelerar — sem virar refém dela</li>
            <li><span aria-hidden="true">✓</span> Inglês, posicionamento e o que ninguém te conta</li>
          </ul>

          <div className="ebook-hero-cta-row">
            <div className="ebook-hero-price">
              <span className="ebook-hero-price-currency">R$</span>
              <span className="ebook-hero-price-value">27</span>
              <span className="ebook-hero-price-pay">pagamento único · acesso vitalício</span>
            </div>
            <Link href="/ebook" className="ebook-hero-button">
              Conhecer o eBook
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
