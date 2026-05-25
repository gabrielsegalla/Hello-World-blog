import type { Metadata } from 'next'
import Link from 'next/link'
import BookTilt from '@/components/BookTilt'
import EbookCheckoutLink from '@/components/EbookCheckoutLink'
import EbookViewContentTracker from '@/components/EbookViewContentTracker'
import { SITE_URL } from '@/lib/site'

const KIWIFY_URL = process.env.NEXT_PUBLIC_KIWIFY_URL || 'https://kiwify.com.br'

export const metadata: Metadata = {
  title: 'HelloWorld — A Jornada Real de Quem Começa na Programação',
  description:
    'O eBook que eu queria ter lido quando comecei: 10+ anos de carreira dev condensados em um guia direto sobre código, IA, inglês e como conseguir seu primeiro emprego sem se perder em curso infinito.',
  alternates: { canonical: `${SITE_URL}/ebook` },
  openGraph: {
    title: 'HelloWorld — A Jornada Real de Quem Começa na Programação',
    description:
      'O caminho que ninguém te conta: do "print(\'Hello, World!\')" ao primeiro contracheque, sem ficar 3 anos rodando em círculos.',
    type: 'website',
    url: `${SITE_URL}/ebook`,
    images: ['/book.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HelloWorld — A Jornada Real de Quem Começa na Programação',
    description:
      'O caminho que ninguém te conta: do "print(\'Hello, World!\')" ao primeiro contracheque.',
    images: ['/book.png'],
  },
}

const CHAPTERS = [
  {
    n: '01',
    title: 'Minha Jornada Até Aqui',
    desc: 'De jovem aprendiz ganhando R$300/mês, fazendo escola + vôlei + curso técnico à noite, até trabalhar para empresas internacionais. A história real — com os traumas, os erros e as viradas.',
  },
  {
    n: '02',
    title: 'O que é ser Programador?',
    desc: 'Não é o hacker de filme. É resolver problemas. As especializações da área, o que cada uma exige, e por que soft skills importam tanto quanto técnicas.',
  },
  {
    n: '03',
    title: 'Por Onde Começar?',
    desc: 'Sem paralisia de análise. O caminho que funciona: área, linguagem, Git, GitHub, rotina de estudos, Pomodoro, primeiros projetos.',
  },
  {
    n: '04',
    title: 'Meu caro amigo ChatGPT',
    desc: 'Como usar IA sem virar dependente. O perigo real da muleta. Como aproveitar sem abrir mão de aprender de verdade.',
  },
  {
    n: '05',
    title: 'A Vida Real de um Programador',
    desc: 'Home office, escritório, híbrido. O que ninguém te conta sobre o dia a dia. A rotina real — com pausas, cachorros e caminhada na beira-mar.',
  },
  {
    n: '06',
    title: 'Tenha Qualidade de Vida',
    desc: 'Por que a área romantiza o excesso e como isso destrói carreiras. Como proteger sua saúde mental sem abrir mão da ambição.',
  },
  {
    n: '07',
    title: 'Como Conseguir o Primeiro Emprego',
    desc: 'O que realmente pesa na contratação (não é só técnico). Portfólio, LinkedIn, como negociar salário, como se sair bem na entrevista.',
  },
  {
    n: '08',
    title: 'Inglês: A Chave que Abre as Maiores Portas',
    desc: 'A entrevista que fugi de vergonha. Como aprendi na prática. O que mudou na minha carreira quando parei de ter medo de errar.',
  },
  {
    n: '09',
    title: 'O Valor de Saber se Vender',
    desc: 'O feedback que me acordou. Como virei referência em IA no trabalho. Por que saber se promover não é arrogância — é necessidade.',
  },
  {
    n: '10',
    title: 'IA na Prática: O Programador Aumentado',
    desc: 'Ferramentas reais (Copilot, Claude, Cursor), prompts que funcionam, onde a IA ajuda de verdade e onde ainda falha. A diferença entre dev com muleta e programador aumentado.',
  },
]

const FAQ = [
  {
    q: 'Sou completo iniciante. Esse livro é pra mim?',
    a: 'Sim — foi feito justamente pra quem ainda não escreveu uma linha de código ou está perdido entre 200 tutoriais. A premissa é exatamente essa: zerar a curva e te dar um caminho linear.',
  },
  {
    q: 'Já programo há um tempo. Vale a pena?',
    a: 'Se você ainda não conseguiu seu primeiro emprego, ou está estagnado em júnior há mais de 2 anos, vale demais. Os capítulos 06 a 10 são sobre posicionamento, entrevista e crescimento — coisas que ninguém ensina em curso técnico.',
  },
  {
    q: 'Qual linguagem o livro ensina?',
    a: 'Nenhuma especificamente — e isso é proposital. Linguagem você aprende em 2 semanas no YouTube. O livro é sobre tudo que vem antes e depois disso: método, carreira, IA, posicionamento. Os exemplos usam Python e JavaScript porque são os mais acessíveis.',
  },
  {
    q: 'É um curso em vídeo?',
    a: 'Não. É um eBook em PDF + ePub, pensado pra ser lido em 1 final de semana e consultado pelos próximos 2 anos. Sem playlist infinita pra te fazer sentir produtivo sem aprender nada.',
  },
  {
    q: 'Tem garantia?',
    a: 'Sim, 7 dias de garantia incondicional. Comprou, leu, não gostou? Manda email e devolvo 100% do valor. Sem perguntas.',
  },
  {
    q: 'Recebo atualizações futuras?',
    a: 'Sim. Toda atualização do livro (incluindo novos capítulos sobre IA, que o mercado muda toda semana) vai direto pro seu email, de graça, pra sempre.',
  },
  {
    q: 'Como recebo o livro depois de comprar?',
    a: 'Imediatamente após a confirmação do pagamento, você recebe um email com os arquivos em PDF e ePub. Acesso vitalício, sem assinatura.',
  },
]

export default function EbookPage() {
  return (
    <main className="ebook-page">
      <EbookViewContentTracker />
      <header className="ebook-page-topbar">
        <div className="ebook-page-topbar-inner">
          <Link href="/" className="ebook-page-topbar-brand">
            <span className="navbar-brand-prompt">&gt;_</span>
            <span>dev.segalla</span>
          </Link>
          <Link href="/" className="ebook-page-blog-link">
            <span aria-hidden="true">←</span>
            Acessar o blog
          </Link>
        </div>
      </header>

      <section className="ebook-page-hero">
        <div className="ebook-hero-bg" aria-hidden="true">
          <div className="ebook-hero-grid" />
          <div className="ebook-hero-glow ebook-hero-glow-a" />
          <div className="ebook-hero-glow ebook-hero-glow-b" />
        </div>

        <div className="ebook-page-hero-inner">
          <div className="ebook-page-hero-text">
            <p className="ebook-hero-tag">
              <span className="ebook-hero-tag-dot" aria-hidden="true" />
              // eBook · lançamento · acesso vitalício
            </p>
            <h1 className="ebook-page-h1">
              O caminho que <span className="ebook-page-h1-strike">90% dos cursos</span> <span className="ebook-page-h1-alt">não te conta</span> sobre virar dev.
            </h1>
            <p className="ebook-page-lede">
              Você não precisa do 14º curso de Python. Precisa do mapa que liga
              o <code>print(&quot;Hello, World!&quot;)</code> ao seu primeiro contracheque
              — sem 3 anos perdido em tutorial.
            </p>

            <ul className="ebook-page-bullets">
              <li><span aria-hidden="true">✓</span> 10 capítulos · 25 páginas densas · leitura de 2-3 horas</li>
              <li><span aria-hidden="true">✓</span> PDF + ePub · acesso vitalício · atualizações grátis</li>
              <li><span aria-hidden="true">✓</span> 7 dias de garantia · risco zero</li>
            </ul>

            <div className="ebook-page-cta-row">
              <div className="ebook-hero-price">
                <span className="ebook-hero-price-from">de R$ 67 por</span>
                <span className="ebook-hero-price-currency">R$</span>
                <span className="ebook-hero-price-value">27</span>
                <span className="ebook-hero-price-pay">pagamento único · sem assinatura</span>
              </div>
              <EbookCheckoutLink href={KIWIFY_URL} target="_blank" className="ebook-hero-button">
                Garantir meu eBook
                <span aria-hidden="true">→</span>
              </EbookCheckoutLink>
            </div>
            <p className="ebook-page-microcopy">
              💳 Pix, cartão em até 12x ou boleto · Entrega imediata por email
            </p>
          </div>

          <div className="ebook-page-hero-cover">
            <BookTilt
              src="/book.png"
              alt="Capa do eBook HelloWorld — A Jornada Real de Quem Começa na Programação"
              width={320}
              height={512}
            />
          </div>
        </div>
      </section>

      <section className="ebook-page-section ebook-page-pain">
        <div className="ebook-page-section-inner">
          <h2 className="ebook-page-h2">Se você está aqui, provavelmente já passou por isso:</h2>
          <div className="ebook-page-pain-grid">
            <div className="ebook-page-pain-card">
              <span className="ebook-page-pain-emoji" aria-hidden="true">😤</span>
              <h3>Tutorial hell sem fim</h3>
              <p>Você assiste curso, acha que entendeu, abre o VSCode pra fazer sozinho e <strong>não sai do lugar</strong>.</p>
            </div>
            <div className="ebook-page-pain-card">
              <span className="ebook-page-pain-emoji" aria-hidden="true">🤯</span>
              <h3>Paralisia de escolha</h3>
              <p>Python ou JavaScript? Frontend ou backend? Cada thread do Twitter te diz uma coisa e você não começa nunca.</p>
            </div>
            <div className="ebook-page-pain-card">
              <span className="ebook-page-pain-emoji" aria-hidden="true">📉</span>
              <h3>0 respostas no LinkedIn</h3>
              <p>Você mandou 200 currículos. Recebeu 2 respostas. Acha que o problema é técnico, mas <strong>não é</strong>.</p>
            </div>
            <div className="ebook-page-pain-card">
              <span className="ebook-page-pain-emoji" aria-hidden="true">🤖</span>
              <h3>Medo da IA</h3>
              <p>A IA não vai substituir o programador. Mas um dev que sabe usar IA vai substituir um que não sabe. Esse livro te coloca do lado certo dessa equação.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ebook-page-section ebook-page-solution">
        <div className="ebook-page-section-inner ebook-page-solution-inner">
          <div>
            <p className="ebook-page-kicker">// a solução</p>
            <h2 className="ebook-page-h2">
              Eu escrevi o livro que eu queria ter lido em 2014.
            </h2>
            <p className="ebook-page-paragraph">
              Em 10+ anos como dev fullstack — passando por startups, consultorias e
              times distribuídos — eu vi todo mundo cair nos mesmos buracos. <strong>Curso
              demais, código de menos.</strong> Linguagem demais, projeto de menos. Tutorial
              demais, decisão de menos.
            </p>
            <p className="ebook-page-paragraph">
              O <strong>HelloWorld</strong> é um manual direto, sem enrolação,
              sem &quot;agora aperte F12 e veja o resultado&quot;. É a conversa que eu teria
              com você num café se tivéssemos 4 horas pra resolver sua carreira.
            </p>
            <p className="ebook-page-paragraph">
              Sem teoria de faculdade. Sem &quot;a internet é uma rede de computadores&quot;.
              Sem 80 páginas explicando o que é variável. <strong>Direto ao que importa:
              como sair do zero e construir uma carreira que paga as contas, te dá
              liberdade e ainda te diverte.</strong>
            </p>
          </div>
          <div className="ebook-page-solution-quote">
            <p>&ldquo;Eu perdi 2 anos rodando em círculos. Esse livro economiza esses 2 anos pra você.&rdquo;</p>
            <span>— Gabriel Segalla, autor</span>
          </div>
        </div>
      </section>

      <section className="ebook-page-section ebook-page-chapters" id="conteudo">
        <div className="ebook-page-section-inner">
          <p className="ebook-page-kicker">// o que você vai ler</p>
          <h2 className="ebook-page-h2">10 capítulos, 0 enrolação.</h2>
          <p className="ebook-page-h2-sub">
            Cada capítulo resolve uma dúvida real que eu vejo todo dia no DM.
          </p>

          <ol className="ebook-page-chapters-list">
            {CHAPTERS.map(c => (
              <li key={c.n} className="ebook-page-chapter">
                <span className="ebook-page-chapter-n">{c.n}</span>
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="ebook-page-section ebook-page-audience">
        <div className="ebook-page-section-inner ebook-page-audience-grid">
          <div className="ebook-page-audience-card ebook-page-audience-yes">
            <h3>✅ É pra você se…</h3>
            <ul>
              <li>Você ainda não escreveu sua primeira linha de código (ou escreveu, mas travou)</li>
              <li>Já tentou aprender 3 linguagens e desistiu de todas</li>
              <li>Está cansado de tutorial e quer um caminho claro</li>
              <li>Quer entender de verdade como usar IA a seu favor</li>
              <li>Tá perdido em como conseguir o primeiro emprego</li>
              <li>Já é júnior e quer evoluir mais rápido</li>
            </ul>
          </div>
          <div className="ebook-page-audience-card ebook-page-audience-no">
            <h3>❌ Não é pra você se…</h3>
            <ul>
              <li>Você já é dev pleno/sênior — esse livro vai parecer raso</li>
              <li>Procura um curso passo-a-passo de uma linguagem específica</li>
              <li>Acha que dev rico aprendeu em 30 dias e ficou rico em 60</li>
              <li>Não tá disposto a abrir o editor e codar de verdade</li>
              <li>Quer fórmula mágica em vez de método consistente</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="ebook-page-section ebook-page-author">
        <div className="ebook-page-section-inner ebook-page-author-grid">
          <div className="ebook-page-author-photo" aria-hidden="true">
            <span>GS</span>
          </div>
          <div>
            <p className="ebook-page-kicker">// sobre o autor</p>
            <h2 className="ebook-page-h2">Gabriel Segalla</h2>
            <p className="ebook-page-paragraph">
              Dev fullstack há mais de 10 anos. Comecei como jovem aprendiz ganhando
              R$300/mês numa farmácia, fazendo escola de manhã, vôlei à tarde e curso
              técnico à noite. Passei por startups, instituto de pesquisa, freelance
              para clientes dos EUA, e hoje trabalho numa empresa internacional de
              tecnologia — fazendo apresentações para times em outros países.
            </p>
            <p className="ebook-page-paragraph">
              Esse livro é o destilado de tudo que eu vivi. Não é teoria. É o que
              eu fiz, o que eu errei, e o que eu aprendi.
            </p>
            <div className="ebook-page-author-stats">
              <div>
                <strong>10+</strong>
                <span>anos como dev</span>
              </div>
              <div>
                <strong>3</strong>
                <span>países de atuação</span>
              </div>
              <div>
                <strong>React + Python</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ebook-page-section ebook-page-guarantee">
        <div className="ebook-page-section-inner ebook-page-guarantee-inner">
          <div className="ebook-page-guarantee-badge" aria-hidden="true">
            <span>7</span>
            <small>dias</small>
          </div>
          <div>
            <h2 className="ebook-page-h2">Risco zero. Garantia de 7 dias.</h2>
            <p className="ebook-page-paragraph">
              Compra, lê, aplica. Se em 7 dias você achar que não vale o que pagou,
              é só me mandar um email e eu <strong>devolvo 100% do seu dinheiro</strong>.
              Sem perguntas, sem formulário, sem &quot;por quê&quot;.
            </p>
            <p className="ebook-page-paragraph">
              O risco é todo meu. Se o livro não entregar, eu é que perco — não você.
            </p>
          </div>
        </div>
      </section>

      <section className="ebook-page-section ebook-page-faq" id="faq">
        <div className="ebook-page-section-inner ebook-page-faq-inner">
          <p className="ebook-page-kicker">// perguntas frequentes</p>
          <h2 className="ebook-page-h2">As dúvidas que mais aparecem.</h2>
          <div className="ebook-page-faq-list">
            {FAQ.map((item, i) => (
              <details key={i} className="ebook-page-faq-item">
                <summary>
                  <span>{item.q}</span>
                  <span className="ebook-page-faq-icon" aria-hidden="true">+</span>
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="ebook-page-section ebook-page-final-cta">
        <div className="ebook-page-section-inner ebook-page-final-cta-inner">
          <p className="ebook-page-kicker">// última chance</p>
          <h2 className="ebook-page-final-cta-h2">
            Ou você gasta <strong>R$ 27</strong> agora,
            <br />
            ou outros 2 anos sem direção.
          </h2>
          <p className="ebook-page-paragraph">
            O preço de lançamento sobe pra R$ 67 em breve. Acesso vitalício,
            atualizações gratuitas pra sempre, 7 dias de garantia.
          </p>

          <div className="ebook-page-final-cta-row">
            <EbookCheckoutLink href={KIWIFY_URL} target="_blank" className="ebook-hero-button ebook-page-final-button">
              Garantir meu eBook por R$ 27
              <span aria-hidden="true">→</span>
            </EbookCheckoutLink>
          </div>
          <p className="ebook-page-microcopy">
            🔒 Pagamento seguro via Kiwify · Pix, cartão em até 12x ou boleto
          </p>
          <p className="ebook-page-blog-footer">
            Prefere ler antes de comprar?{' '}
            <Link href="/">Acesse o blog com artigos gratuitos sobre dev e IA →</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
