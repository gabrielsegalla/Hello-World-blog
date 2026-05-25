## O que é o Cypress?

Cypress é uma ferramenta de automatização de testes construída para aplicações web modernas. Surgiu com o objetivo de facilitar o processo de configuração e depuração dos seus testes, e hoje continua sendo uma das opções mais usadas quando o assunto é teste end to end em front end.

Diferente do que acontecia quando escrevi a versão original deste guia em 2022, o Cypress amadureceu bastante. A interface mudou, a configuração saiu do `cypress.json` para o `cypress.config.js`, o suporte a Firefox e WebKit ficou estável, e ferramentas como `cy.session()` e interceptação de rede ficaram parte do dia a dia de quem mantém suíte de testes de verdade.

## Por que usar o Cypress?

O Cypress automaticamente aguarda por comandos e asserções antes de seguir em frente. Isso elimina boa parte da dor de cabeça com async que a gente enfrentava em outras ferramentas, onde era comum colocar `sleep` ou retry manual só pra esperar um elemento aparecer.

Durante a execução, o Cypress registra snapshots de cada passo. Você acompanha tudo pelo log lateral e consegue ver exatamente o que aconteceu na tela naquele momento. Quando um teste quebra, essa visibilidade faz diferença.

Pela forma como foi arquitetado, o Cypress tende a ser mais rápido e consistente do que stacks que rodam comandos remotos fora do navegador. Ele executa dentro do browser. O próprio navegador roda o seu caso de teste. Isso permite escutar e modificar o comportamento da aplicação em tempo real, manipulando o DOM e inclusive alterando requisições e respostas de rede com `cy.intercept()`.

A stack é Node.js. Os testes são JavaScript ou TypeScript. Na prática, a maior parte do que você escreve usa os comandos embutidos do Cypress, que são diretos de entender. A API também expõe encadeamento estilo jQuery para interagir com elementos da interface.

**Navegadores com suporte hoje:** Chrome, Electron, Firefox e WebKit (Safari). Internet Explorer saiu de cena faz tempo, e o Cypress seguiu esse caminho.

## Começando com o Cypress

Antes da instalação, certifique-se de ter o [Node.js](https://nodejs.org/) instalado na sua máquina. Versão LTS recente resolve.

Instale o Cypress no seu projeto:

```bash
npm install cypress --save-dev
```

Para abrir a interface do Cypress:

```bash
npx cypress open
```

Vale adicionar scripts no `package.json` pra não ficar digitando o comando inteiro:

```json
{
  "scripts": {
    "cy:open": "cypress open",
    "cy:run": "cypress run"
  }
}
```

Na primeira execução, o Cypress pergunta que tipo de teste você quer configurar. Aqui vou focar em **E2E (End-to-End)**, que replica cenários reais com a intenção de validar que o sistema funciona como esperado do ponto de vista do usuário.

![Tela inicial de configuração do Cypress para testes E2E](https://cdn-images-1.medium.com/max/1024/1*MJxMdOER0195Jcx7Gnmohw.png)

Seguindo as etapas, ele adiciona arquivos ao projeto e pede qual navegador você quer usar na execução.

![Seleção do navegador para rodar os testes](https://cdn-images-1.medium.com/max/1024/1*O6JT3HhscDXL1AGkn6G5LA.png)

Depois de escolher o navegador, abre a tela principal com a opção de gerar specs de exemplo ou criar um arquivo em branco. No meu caso, gerei os exemplos pra demonstração.

![Tela principal do Cypress com specs de exemplo](https://cdn-images-1.medium.com/max/1024/1*1qIDmLB7gsE5eHd-FJyglA.png)

![Execução dos exemplos gerados pelo Cypress](https://cdn-images-1.medium.com/max/1024/1*Teve_tF9La0zxSylv6JXXQ.png)

### Estrutura de pastas

Observando a pasta do projeto, o Cypress cria algo nessa linha:

![Estrutura de pastas criada pelo Cypress](https://cdn-images-1.medium.com/max/1024/1*1W7x4al_-wOUSWDcm9GNvQ.png)

**Fixtures:** é onde você guarda mocks de requisições ou dados estáticos em JSON.

**e2e:** diretório dos seus testes. Você pode organizar por telas ou fluxos e manter a extensão `.cy.js` ou `.cy.ts` em cada arquivo.

**downloads:** arquivos baixados durante a execução, como um PDF em teste de download.

**support:** comandos globais reutilizáveis e configurações compartilhadas. Um exemplo clássico é criar um comando de login pra não repetir os mesmos passos em todo spec.

**screenshots e videos:** gerados automaticamente quando configurado, especialmente úteis em CI.

### Configuração com baseUrl

Hoje a configuração fica no `cypress.config.js`. Definir `baseUrl` evita repetir a URL completa em todo `cy.visit()`:

```javascript
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      return config
    },
  },
})
```

Com isso, no teste você usa `cy.visit('/')` em vez de passar o endereço inteiro.

## Escrevendo o primeiro teste

Vou demonstrar um exemplo básico. Tenho uma aplicação simples com um formulário e um botão que limpa os campos.

Criei o arquivo `example.cy.js` e declarei o bloco do teste assim:

```javascript
describe('Tela de Exemplo', () => {})
```

O `describe` agrupa os casos da mesma tela ou fluxo. Antes dos testes, precisamos acessar a página. Para isso uso o `beforeEach`:

```javascript
describe('Tela de Exemplo', () => {
  beforeEach(() => {
    cy.visit('/')
  })
})
```

Tudo dentro dessa função roda antes de cada `it`. Além da URL inicial, dá pra configurar viewport, interceptar requisições ou restaurar sessão. Por ora, só a visita.

Agora o caso de teste em si:

```javascript
describe('Tela de Exemplo', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Devera preencher os campos e limpar após clicar no botão', () => {})
})
```

O `it` declara cada cenário. O primeiro passo é localizar os inputs e preenchê-los:

```javascript
describe('Tela de Exemplo', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Devera preencher os campos e limpar após clicar no botão', () => {
    cy.get('#fname').type('GABRIEL')
    cy.get('#lname').type('SEGALLA')
  })
})
```

O `cy.get()` localiza elementos na tela. Funciona com id, classe CSS, atributos ou pelo próprio elemento. Meus inputs têm id `fname` e `lname`. Para id, usa `#` antes do nome. Para classe, `.`.

O `.type()` preenche valores em inputs. Tendo o elemento selecionado, você encadeia a ação.

Se acompanhar pelo Cypress que abrimos antes, dá pra ver o andamento do teste e as informações de cada passo executado.

![Log do Cypress durante o preenchimento dos campos](https://cdn-images-1.medium.com/max/1024/1*VOjNHibid6P4ghZkVqdE9A.png)

Para fechar o exemplo, clico no botão e verifico se os campos foram limpos:

```javascript
describe('Tela de Exemplo', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Devera preencher os campos e limpar após clicar no botão', () => {
    cy.get('#fname').type('GABRIEL')
    cy.get('#lname').type('SEGALLA')
    cy.get('button').click()
    cy.get('#fname').should('be.empty')
    cy.get('#lname').should('be.empty')
  })
})
```

Peguei o botão pelo elemento `button`, já que ele não tem id e é o único botão na tela. Se houvesse mais de um, o Cypress aplicaria o comando em todos eles, o que geralmente indica que o seletor precisa ser mais específico.

Com o botão selecionado, uso `.click()` para simular o clique.

Os inputs zeram após o clique. Para validar isso, uso `.should()`. Nesse caso, `be.empty` confirma que `fname` e `lname` estão vazios.

![Teste concluído com sucesso no Cypress](https://cdn-images-1.medium.com/max/1024/1*X7322lnrQy5qYD3wCfZ1EA.png)

## Seletores que envelhecem bem

No exemplo usei `#fname` e `#lname` porque a aplicação de demonstração era simples. Em projetos reais, ids e classes de CSS mudam com frequência por causa de refatoração visual.

Uma prática comum é expor atributos de teste na aplicação, como `data-cy="campo-nome"`, e selecionar com `cy.get('[data-cy=campo-nome]')`. Isso deixa claro que aquele atributo existe pro teste, sem acoplar o spec a detalhes de implementação do CSS.

## Comando customizado de login

Quando vários testes começam logando na aplicação, repetir email e senha em todo arquivo vira manutenção. No `cypress/support/commands.js`:

```javascript
Cypress.Commands.add('login', (email, senha) => {
  cy.visit('/login')
  cy.get('[data-cy=email]').type(email)
  cy.get('[data-cy=senha]').type(senha)
  cy.get('[data-cy=entrar]').click()
})
```

No spec, fica `cy.login('usuario@teste.com', '123456')`.

Se o fluxo de login for pesado, combine com `cy.session()` para reutilizar autenticação entre testes sem repetir a navegação completa toda vez.

## Mock de API com cy.intercept

Testes E2E não precisam bater em produção o tempo todo. Com `cy.intercept()` você controla o que a aplicação recebe:

```javascript
cy.intercept('GET', '/api/usuario', {
  statusCode: 200,
  body: { nome: 'Gabriel', plano: 'pro' },
}).as('getUsuario')

cy.visit('/perfil')
cy.wait('@getUsuario')
cy.contains('Gabriel').should('be.visible')
```

Isso deixa o teste previsível e mais rápido quando a API externa não é o foco do cenário.

## Rodando em CI

Localmente, `npx cypress open` é ótimo pra desenvolver e debugar. Na pipeline, o usual é `npx cypress run`, que executa headless e gera relatório, screenshots e vídeo em caso de falha.

Um GitHub Actions mínimo fica assim:

```yaml
name: Cypress
on: [push]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run cy:run
```

O importante é a aplicação estar acessível no momento da execução, seja subindo um servidor no job ou apontando `baseUrl` para um ambiente de staging.

## O que vem depois

Este guia cobre instalação, estrutura de pastas, primeiro spec e alguns caminhos que você vai usar cedo: `baseUrl`, seletores estáveis, comandos customizados, intercept e CI.

Ainda tem muito o que explorar: testes de componente, plugins da comunidade, integração com Cucumber/Gherkin, relatórios customizados e estratégias de paralelização. Mas pra começar e sentir se a ferramenta encaixa no seu projeto, o caminho acima já entrega valor.

O Cypress continua valendo o esforço de implementação. A curva inicial é baixa, a depuração é boa, e quando a suíte cresce a organização em pastas, comandos reutilizáveis e mocks bem feitos fazem diferença.

Se quiser trocar ideia sobre automação ou carreira em QA/dev, estou no [LinkedIn](https://www.linkedin.com/in/gabrielrsegalla/).
