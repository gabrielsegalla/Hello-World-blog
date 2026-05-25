# Guia de escrita — segalla-article-writer

Referência obrigatória para artigos com linguagem natural e profissional.

## Objetivo

O leitor deve sentir que um dev experiente escreveu pensando nele, não que uma IA preencheu template.

## Voz

Mesma base de [voice.md](../segalla-article-researcher/voice.md), com ênfase extra em **fluidez** e **densidade útil**.

Escreva como conversa entre colegas que respeitam o tempo um do outro. Pode usar "eu" quando for experiência real ou opinião fundamentada. Use "a gente" com moderação.

## Ritmo e cadência

Varie o tamanho das frases. Três parágrafos seguidos com a mesma estrutura (sujeito + verbo + complemento) cansam.

**Monótono:**
> O Cypress roda no navegador. Ele espera elementos automaticamente. Ele tira snapshots dos passos. Ele é rápido.

**Natural:**
> O Cypress roda dentro do navegador, não do outro lado da rede como o Selenium clássico. Isso muda tudo na hora de debugar: cada passo fica visível no log lateral, com snapshot do DOM naquele instante. Quando o teste quebra, você sabe onde parou.

## Conectivos naturais em PT-BR

Prefira transições simples: "por isso", "na prática", "o ponto é", "funciona assim", "vale dizer que".

Evite: "dito isso", "em suma", "outrossim", "cabe destacar", "é válido mencionar".

## Proibido

| Pattern | Substituir por |
|---------|----------------|
| Emojis | Nada |
| Travessão (—) | Vírgula, ponto, dois-pontos ou parênteses |
| "Neste artigo..." | Gancho com problema real |
| "Revolutionary / game-changer" | Descrição concreta do efeito |
| Listas `-` com 5+ itens | Parágrafos ou blocos **Título:** explicação |
| Negrito em cada frase | Negrito só em termos-chave |
| "Mergulhe", "Desvende", "Domine" | Verbo direto |

## Estrutura recomendada

### Abertura (2–4 parágrafos)

Comece com situação reconhecível: bug em prod, ferramenta nova no time, decisão de arquitetura. O leitor precisa se identificar nos primeiros 100 palavras.

### Corpo

Alternar:
1. Conceito explicado em prosa
2. Exemplo (código, cenário, número)
3. Implicação prática

Cada seção `##` deve responder uma pergunta que o leitor já teria.

### Seção de limitações

Artigos bons dizem quando **não** usar a abordagem. Isso gera confiança.

### Fechamento (1–2 parágrafos)

Sem "espero que tenham gostado". Termine com ação concreta: o que testar amanhã, o que ler depois, o que medir.

## Código no artigo

Introduza blocos de código com contexto em prosa, não só "veja o exemplo abaixo".

```javascript
// Ruim: código solto sem setup
cy.get('#btn').click()
```

Melhor: explicar o estado da tela, o que o teste assume, depois mostrar o trecho mínimo.

## Densidade mínima por tipo

| Tipo | Palavras | Seções ## |
|------|----------|-----------|
| Opinião/análise | 1.200+ | 4+ |
| Tutorial | 1.800+ | 5+ |
| Guia completo | 2.500+ | 6+ |

## Checklist de polimento

Rodar item a item no `article.md` final:

**Linguagem**
- [ ] Nenhum travessão longo no arquivo
- [ ] Nenhum emoji
- [ ] Nenhuma lista `-` com mais de 3 itens seguidos
- [ ] Abertura não começa com "Neste artigo" ou "Com a ascensão de"
- [ ] Pelo menos 3 frases soam como fala, não como manual

**Conteúdo**
- [ ] Cada seção entrega algo novo (sem repetir ideia com outras palavras)
- [ ] Fatos externos têm link ou menção à fonte
- [ ] Opinião identificável como opinião
- [ ] Existe seção ou parágrafo de limitações/trade-offs
- [ ] Fechamento com próximo passo concreto

**Forma**
- [ ] Subtítulos descritivos (não "Considerações finais" genérico; preferir "Quando não vale a pena")
- [ ] Parágrafos com no máximo ~5 linhas na tela
- [ ] Código com syntax highlight correto (javascript, bash, yaml, json)

**Teste final**

Ler o artigo em voz alta. Onde você tropeçar ou soar robótico, reescrever.

## Exemplo de reescrita

**Antes (artificial):**
> A inteligência artificial — especialmente os modelos de linguagem — está transformando radicalmente o fluxo de desenvolvimento. Neste contexto, é fundamental compreender as melhores práticas.

**Depois (natural):**
> Passei duas semanas usando agente de código no mesmo monorepo que mantenho há três anos. Em tarefas pequenas e bem delimitadas, ganhei tempo de verdade. Em refatorações que cruzam cinco pacotes, o agente inventou imports que nem existiam. O resto deste texto é o que aprendi sobre onde confiar e onde revisar linha por linha.
