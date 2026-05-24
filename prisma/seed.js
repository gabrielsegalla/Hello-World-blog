const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'gabriel@segalla.dev'
  const password = process.env.ADMIN_PASSWORD || 'changeme123'
  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: { email, password: await bcrypt.hash(password, 10) },
  })

  await prisma.post.upsert({
    where: { slug: 'como-uso-ia-no-trabalho-real' },
    update: {},
    create: {
      slug: 'como-uso-ia-no-trabalho-real',
      title: 'Como uso IA no meu trabalho real como dev fullstack',
      subtitle: 'Não é sobre substituição — é sobre amplificação',
      excerpt: 'Quando o ChatGPT explodiu, eu fiz o que a maioria dos devs fez: testei, achei legal, e continuei codando do jeito de sempre. Erro meu.',
      category: 'IA na Prática',
      readTime: 8,
      content: `## O erro que quase todo dev comete

Quando o ChatGPT explodiu em 2022, eu fiz o que a maioria dos devs fez: fui lá, testei, achei legal, e continuei codando do jeito que sempre codei.

Erro meu.

Levei quase 6 meses para entender que eu não estava usando IA como ferramenta real — estava usando como Google melhorado. E aí tudo mudou.

## O que mudou na minha forma de trabalhar

Primeiro, parei de perguntar "como faz X em Python?" e comecei a perguntar com contexto real:

> "Dado esse sistema de microserviços com FastAPI, qual a melhor abordagem para implementar cache distribuído considerando que temos picos de 10k req/s?"

A diferença na qualidade das respostas é brutal.

## Onde a IA me economiza mais tempo

- **Code review antes de abrir PR** — já me salvou de bugs feios várias vezes
- **Documentação** — ela gera uma base decente em segundos, você revisa e refina
- **Explorar APIs desconhecidas** — em vez de horas vasculhando docs
- **Debugging obscuro** — cola a stack trace, pede hipóteses

## O ponto que ninguém fala

A IA não vai substituir o programador. Mas um programador que sabe usar IA vai substituir um que não sabe.

Essa distinção vai definir carreiras nos próximos anos. Você escolhe de qual lado quer estar.`,
      tags: 'IA,Carreira,Produtividade',
      published: true,
    },
  })

  await prisma.post.upsert({
    where: { slug: 'de-r300-a-dev-internacional' },
    update: {},
    create: {
      slug: 'de-r300-a-dev-internacional',
      title: 'De R$300 como jovem aprendiz a dev internacional',
      subtitle: 'A jornada real — sem romantizar as partes difíceis',
      excerpt: 'Escola de manhã. Vôlei à tarde. Curso técnico à noite. R$300 como jovem aprendiz. E um sonho que não cabia nessa rotina.',
      category: 'Carreira',
      readTime: 10,
      content: `## O atleta que virou programador

Eu tenho dois metros de altura. E durante boa parte da minha adolescência, o plano era usar essa altura numa quadra de vôlei.

Escola de manhã. Treino à tarde. Curso técnico à noite. Tudo isso ganhando R$300 como jovem aprendiz numa farmácia.

Fiz uma promessa comigo mesmo: se até os 18 anos eu não estivesse em um time de verdade, eu largaria o esporte e me dedicaria completamente ao plano B. E o plano B era a programação.

## O clique que demorou para acontecer

Nas primeiras aulas de lógica de programação, algo mudou na minha forma de ver o mundo.

Pegar uma xícara virou um algoritmo: caminhar até o móvel → abrir a porta → se tiver xícara → pegar → senão → fechar a porta.

Parece bobo. Mas foi uma virada de chave real.

## O erro que me marcou

Numa startup, desenvolvi uma API sozinho para consultar bases de dados públicas do governo. Por inexperiência, armazenei CPF como numérico em vez de texto.

CPFs que começavam com zero perderam o primeiro dígito.

O gerente me chamou fora da empresa e disse: *"Se me pedissem alguém pra mandar embora hoje, seria você com certeza."*

Não almocei naquele dia. Corrigi o bug. Mas essa frase ficou por anos.

## O que aprendi

Cada erro é escola. Cada ambiente tóxico te ensina o que você não quer carregar. E cada vitória — por menor que seja — merece ser celebrada.`,
      tags: 'Carreira,Jornada',
      published: true,
    },
  })

  await prisma.post.upsert({
    where: { slug: 'ingles-chave-para-dev' },
    update: {},
    create: {
      slug: 'ingles-chave-para-dev',
      title: 'Inglês: a chave que abre as maiores portas do dev',
      subtitle: 'A entrevista que fugi — e o que aprendi com isso',
      excerpt: 'Marquei uma entrevista para empresa americana. A recrutadora falou em inglês. Eu não entendi nada. Saí com vergonha. E quase perdi a melhor oportunidade da minha carreira.',
      category: 'Carreira',
      readTime: 7,
      content: `## A entrevista que me travou de vergonha

Certa vez marquei uma entrevista para uma empresa americana. A recrutadora começou a falar em inglês e eu não entendi quase nada.

A única frase que ficou clara: *"Do you know this is a position for Advanced English only, right?"*

Saí com uma vergonha tão grande que peguei medo de entrevistas em inglês. Esse medo quase me custou a melhor oportunidade da minha carreira.

## O erro que quase repeti

Anos depois, me candidatei para uma empresa internacional que sempre quis. Quando chegou o convite e vi "Advanced English" nos requisitos — desisti antes de aparecer. Não avisei ninguém. Simplesmente não fui.

## A reviravolta

Mais alguns anos depois, me candidatei de novo para a mesma empresa. Dessa vez fui.

Tive a melhor entrevista de emprego da minha vida. A recrutadora disse: *"Seu inglês é ok — nada que te impeça de seguir. Mas quando entrar, você vai precisar desenvolver mais."*

Aceitei. Estou lá até hoje, fazendo apresentações internacionais.

## Por onde começar hoje

- **Duolingo** — hábito diário, gratuito
- **BBC Learning English** — conteúdo gratuito de qualidade
- **italki** — aulas com professores a preços acessíveis
- **Séries com legenda em inglês** — não em português

A diferença entre as duas tentativas? Investi em inglês. E o medo foi diminuindo à medida que a competência crescia.`,
      tags: 'Carreira,Inglês',
      published: true,
    },
  })

  console.log('✅ Seed concluído')
}

main().catch(console.error).finally(() => prisma.$disconnect())
