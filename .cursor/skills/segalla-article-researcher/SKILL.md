---
name: segalla-article-researcher
description: >-
  Agente de pesquisa e redação para o blog segalla.dev. Descobre tópicos em alta
  em IA e Dev, coleta fontes em profundidade, monta brief estruturado e escreve
  artigos profissionais no tom do Gabriel. Use quando o usuário pedir ideias de
  artigo, tópicos trending, pesquisa de conteúdo, redação de posts sobre IA/Dev,
  ou pipeline de criação editorial para o blog.
---

# Pesquisador e redator segalla.dev

Agente editorial completo: descoberta → pesquisa profunda → brief → artigo → publicação opcional.

Integra com a skill [segalla-blog-post](../segalla-blog-post/SKILL.md) para publicar.

## Quando acionar

| Pedido do usuário | Modo |
|-------------------|------|
| "O que está em alta?" / "ideias de artigo" | **Descoberta** |
| "Pesquise sobre X" / "escreva sobre X" | **Artigo** (com tópico definido) |
| "Pesquise e publique" | **Pipeline completo** → use [segalla-blog-pipeline](../segalla-blog-pipeline/SKILL.md) |

Para pipeline automático sem pausas, prefira **segalla-blog-pipeline** em vez desta skill isolada.

Se o tópico não foi escolhido, **nunca pule a descoberta**. Apresente 3 opções ranqueadas antes de escrever.

## Fluxo do agente

```
Descoberta → Curadoria → Pesquisa profunda → Brief → Artigo → [Publicar]
```

Marque progresso mentalmente a cada fase. Não escreva o artigo sem brief aprovado (explícito ou implícito).

---

## Fase 1: Descoberta

### 1.1 Scan automatizado

Execute o script de tendências:

```bash
.cursor/skills/segalla-article-researcher/scripts/research-trends.sh
```

Salve a saída. Ela traz candidatos de Hacker News e Dev.to filtrados por IA/Dev.

### 1.2 Scan manual (obrigatório, paralelo)

Faça **no mínimo 4 buscas** com `WebSearch`, variando ângulo:

1. Tópico amplo: `AI developer trends {ano atual}`
2. Ferramentas: `new AI coding tools {ano atual}`
3. Dev prático: `software engineering trends {ano atual}`
4. Em PT quando fizer sentido: `tendências IA desenvolvimento {ano atual}`

Use `WebFetch` nos 3 resultados mais promissores de cada busca.

### 1.3 Fontes prioritárias

Consulte [reference.md](reference.md) para lista completa. Priorize:

1. Documentação oficial e changelogs
2. Blogs de engenharia (Vercel, Anthropic, OpenAI, Google AI)
3. Hacker News / Lobsters com discussão técnica
4. GitHub releases e RFCs
5. Análises de praticantes (evitar só conteúdo SEO genérico)

---

## Fase 2: Curadoria

Pontue cada candidato (0–10) em:

| Critério | Peso |
|----------|------|
| Relevância para devs que leem segalla.dev | 30% |
| Frescor (últimas 2–4 semanas) | 25% |
| Ângulo original (não rehash de todo blog) | 25% |
| Potencial prático (exemplos, código, decisão real) | 20% |

Apresente **top 3** neste formato:

```markdown
## Opções de artigo

### 1. [Título provisório] — score X/10
**Por que agora:** ...
**Ângulo sugerido:** ...
**Fontes iniciais:** [url1], [url2]

### 2. ...
### 3. ...
```

Se o usuário já definiu o tópico, pule a apresentação e vá direto à Fase 3.

---

## Fase 3: Pesquisa profunda

**Mínimo antes de escrever:**

| Recurso | Quantidade |
|---------|------------|
| Fontes distintas consultadas | ≥ 8 |
| Fontes primárias (docs, papers, releases) | ≥ 3 |
| Fontes citáveis no artigo | ≥ 5 |
| Buscas web distintas | ≥ 4 |
| Páginas lidas com WebFetch | ≥ 6 |

### Como pesquisar

1. **Mapa do tema**: definições, contexto histórico curto, estado atual
2. **Fatos verificáveis**: datas, números, nomes de produtos, limitações reais
3. **Opiniões divergentes**: o que críticos e defensores dizem
4. **Aplicação prática**: casos de uso, trade-offs, quando não usar
5. **Lacunas**: o que ninguém está cobrindo (seu diferencial)

### Registro de fontes

Para cada fonte, anote:

```
- URL:
- Tipo: primária | secundária | opinião
- Dado-chave extraído:
- Confiabilidade: alta | média | baixa
```

**Nunca invente** estatística, citação ou release. Se não achou, diga que não achou.

---

## Fase 4: Brief

Gere `.cursor/skills/segalla-article-researcher/examples/brief-{slug}.json` ou mostre inline.

Template: [examples/brief.example.json](examples/brief.example.json)

Campos obrigatórios preenchidos antes de escrever:

- `topic`, `workingTitle`, `angle`, `audience`
- `keyFindings` (≥ 5 bullets factuais)
- `sources` (≥ 8 entradas)
- `outline` (≥ 5 seções)
- `category`, `tags`, `estimatedReadTime`

Mostre o brief resumido ao usuário. Prossiga se ele aprovou ou pediu para continuar direto.

---

## Fase 5: Redação

**Delegar à skill [segalla-article-writer](../segalla-article-writer/SKILL.md).**

Esta skill cobre apenas pesquisa e brief. A redação final, polimento, geração de imagens (OpenAI/ChatGPT) e montagem do post ficam com o redator.

Passar ao redator:
- `brief-{slug}.json` completo
- Fontes e notas da Fase 3
- Pedido explícito de imagens se o usuário quiser

O redator salva em `.cursor/skills/segalla-article-writer/drafts/{slug}/`.

---

## Fase 6: Revisão interna (redator)

O redator executa o checklist. Se o usuário pediu só pesquisa, pare após o brief.

---

## Fase 7: Publicação (opcional)

Só publique se o usuário pediu. Use o `post.json` gerado pelo [segalla-article-writer](../segalla-article-writer/SKILL.md):

```bash
.cursor/skills/segalla-blog-post/scripts/post-to-blog.sh \
  .cursor/skills/segalla-article-writer/drafts/{slug}/post.json
```

---

## Modo pipeline completo

Use [segalla-blog-pipeline](../segalla-blog-pipeline/SKILL.md) para execução automática em uma tacada.

Resumo manual (se não usar pipeline):

1. `research-trends.sh`
2. 4+ WebSearch + 6+ WebFetch
3. Top 3 → escolher o melhor (ou perguntar)
4. Pesquisa profunda (8+ fontes)
5. Brief JSON → handoff ao **segalla-article-writer**
6. Publicar via **segalla-blog-post**

---

## Erros comuns

| Erro | Correção |
|------|----------|
| Artigo genérico tipo "IA vai mudar tudo" | Voltar ao brief; exigir exemplos e fontes |
| Poucas fontes | Continuar pesquisa até mínimo |
| Tom corporativo/robotizado | Reler voice.md e reescrever intro + conclusão |
| Título igual a dezenas de blogs | Ajustar ângulo no brief |
| Publicar sem revisão | Rodar checklist Fase 6 |

Detalhes de fontes e queries: [reference.md](reference.md)
