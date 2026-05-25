# Referência de pesquisa — segalla-article-researcher

## Fontes por tier

### Tier 1 — primárias (priorizar)

| Fonte | URL | Uso |
|-------|-----|-----|
| Hacker News | https://news.ycombinator.com | Sinal de relevância + discussão |
| HN Algolia | https://hn.algolia.com/api/v1/search | Busca por termo e data |
| Dev.to API | https://dev.to/api/articles | Tags `ai`, `webdev`, `javascript`, `devops` |
| GitHub Changelog | https://github.blog/changelog/ | Lançamentos que afetam devs |
| Anthropic Docs/News | https://docs.anthropic.com, https://www.anthropic.com/news | Claude, MCP, API |
| OpenAI Blog | https://openai.com/blog | Modelos, API |
| Cursor Changelog | https://www.cursor.com/changelog | Ferramentas de coding AI |
| Vercel Blog | https://vercel.com/blog | Next.js, deploy, AI SDK |
| MDN / RFCs | https://developer.mozilla.org | Padrões web |

### Tier 2 — análise e contexto

| Fonte | Uso |
|-------|-----|
| Simon Willison | AI prático com código |
| Pragmatic Engineer | Impacto em times de engenharia |
| Lobsters | Discussão técnica filtrada |
| Changelog podcast/blog | Ferramentas dev |
| Papers With Code | Benchmarks e papers recentes |

### Tier 3 — sinal fraco (validar antes de citar)

Reddit, Twitter/X threads, newsletters sem fonte, artigos "Top 10" genéricos.

## Queries de busca (templates)

Substitua `{termo}` e use o ano atual.

```
{termo} site:github.com/blog OR site:vercel.com/blog
{termo} release notes {ano}
{termo} hacker news discussion
{termo} limitations production experience
{termo} vs {alternativa} developer comparison
{termo} em português tutorial prático
```

### IA

```
Claude MCP server developer workflow
AI coding agent CI pipeline
LLM context window production lessons
prompt caching cost optimization
RAG architecture trade-offs
```

### Dev

```
TypeScript 5 new features
React Server Components production
platform engineering trends
test automation AI assisted
monorepo tooling comparison
```

## API rápida — HN Algolia

```bash
# Stories sobre AI nos últimos 7 dias
curl -sG "https://hn.algolia.com/api/v1/search" \
  --data-urlencode "query=AI" \
  --data-urlencode "tags=story" \
  --data-urlencode "numericFilters=created_at_i>$(($(date +%s)-604800))" \
  | jq '.hits[] | {title, url, points, num_comments, created_at}'
```

## API rápida — Dev.to

```bash
curl -s "https://dev.to/api/articles?tag=ai&top=7&per_page=10" \
  | jq '.[] | {title, url: .url, tags: .tag_list, reactions: .positive_reactions_count}'
```

## Critérios de qualidade do artigo

Um artigo está pronto quando:

1. **Específico:** dá para explicar em uma frase o que o leitor aprende
2. **Fundamentado:** fatos com fonte, opiniões identificadas como opinião
3. **Útil:** pelo menos uma ação concreta (código, checklist, decisão)
4. **Honesto:** limitações e contraindications presentes
5. **Original:** ângulo pessoal ou síntese que não é copy-paste de uma fonte

## Integração com segalla-blog-post

| Campo brief | Campo post |
|-------------|------------|
| `workingTitle` | `title` |
| `slug` | `slug` |
| `subtitle` | `subtitle` |
| `excerpt` | `excerpt` |
| draft `.md` | `content` |
| `category` | `category` |
| `tags` | `tags` |
| `estimatedReadTime` | `readTime` |
| `coverImage` | `coverImage` |

Publicação: ver [segalla-blog-post/SKILL.md](../segalla-blog-post/SKILL.md).

## Anti-patterns de pesquisa

| Pattern | Problema |
|---------|----------|
| Uma busca só | Visão enviesada |
| Só Tier 3 | Rumor e hype |
| Escrever enquanto pesquisa | Buracos factuais |
| Ignorar comentários HN | Contexto e críticas perdidos |
| Não checar data | "Novidade" de 2023 |
