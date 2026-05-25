---
name: segalla-blog-post
description: >-
  Publica artigos no blog segalla.dev (hello-world-blog) via API REST autenticada.
  Use quando o usuário pedir para postar, publicar ou criar artigo no blog,
  automatizar publicação, ou enviar conteúdo markdown para segalla.dev.
---

# Publicar no segalla.dev

Automatiza login admin + criação de post via API do projeto `segalla-blog-v2`.

Para pesquisar tópicos em alta e redigir o artigo antes de publicar, use [segalla-blog-pipeline](../segalla-blog-pipeline/SKILL.md) (fluxo completo) ou as skills [segalla-article-researcher](../segalla-article-researcher/SKILL.md) + [segalla-article-writer](../segalla-article-writer/SKILL.md).

## Pré-requisitos

Variáveis de ambiente (local `.env` ou shell):

| Variável | Obrigatória | Exemplo |
|----------|-------------|---------|
| `BLOG_URL` | Não | `https://hello-world-blog-xi.vercel.app` |
| `BLOG_ADMIN_EMAIL` | Sim | `gabriel@segalla.dev` |
| `BLOG_ADMIN_PASSWORD` | Sim | senha definida na Vercel |

Default de `BLOG_URL`: `https://hello-world-blog-xi.vercel.app`

## Fluxo do agente

1. **Preparar o payload** do post (ver campos abaixo)
2. **Gerar slug** se o usuário não informou (regras na seção Slug)
3. **Executar o script** (preferido) ou curl manual
4. **Confirmar** URL pública se `published: true`

### Script (recomendado)

```bash
# Post a partir de JSON
.cursor/skills/segalla-blog-post/scripts/post-to-blog.sh path/to/post.json

# Rascunho rápido
.cursor/skills/segalla-blog-post/scripts/post-to-blog.sh \
  --title "Título" \
  --slug "meu-slug" \
  --content-file article.md \
  --category "Dev" \
  --published false
```

O script faz login, envia o post e imprime a resposta JSON + URL.

## Campos do post (JSON)

| Campo | Obrigatório | Tipo | Default | Notas |
|-------|-------------|------|---------|-------|
| `title` | Sim | string | — | Título |
| `slug` | Sim | string | — | `a-z`, `0-9`, hífens |
| `content` | Sim | string | — | Markdown |
| `subtitle` | Não | string | null | Subtítulo |
| `excerpt` | Não | string | null | Resumo (listagem/SEO) |
| `tags` | Não | string | `""` | Vírgula: `"IA,Carreira"` |
| `category` | Não | string | `"Dev"` | Ver categorias |
| `readTime` | Não | number | `5` | 1–60 minutos |
| `coverImage` | Não | string | null | URL `https://...` pública |
| `published` | Não | boolean | `false` | `true` = live |

**Categorias válidas:** `IA na Prática`, `Carreira`, `Dev`, `Tutoriais`, `Ferramentas`, `Inglês`

**Não enviar:** `id`, `createdAt`, `updatedAt` (gerados pelo servidor)

## Slug

Gerar a partir do título quando ausente:

1. lowercase
2. remover acentos (NFD)
3. remover caracteres exceto `a-z`, `0-9`, espaços, hífens
4. espaços → `-`
5. truncar em 80 chars

Regex aceita: `^[a-z0-9]+(?:-[a-z0-9]+)*$`

## Autenticação

Cookie `segalla_token` (HttpOnly, 7 dias). Login:

```http
POST {BLOG_URL}/api/auth
Content-Type: application/json

{ "email": "...", "password": "..." }
```

Todas as rotas `/api/posts*` e `/api/upload` exigem o cookie.

## Endpoints

| Ação | Método | Rota |
|------|--------|------|
| Login | POST | `/api/auth` |
| Criar post | POST | `/api/posts` |
| Listar (admin) | GET | `/api/posts` |
| Atualizar | PUT | `/api/posts/{id}` |
| Excluir | DELETE | `/api/posts/{id}` |
| Upload capa | POST | `/api/upload` (multipart `file`) |

URL pública: `{BLOG_URL}/posts/{slug}` (só se `published: true`)

## Template JSON

```json
{
  "title": "Como uso IA no trabalho real",
  "slug": "como-uso-ia-no-trabalho-real",
  "subtitle": "Não é sobre substituição — é sobre amplificação",
  "excerpt": "Resumo de 1–2 frases para a listagem.",
  "content": "## Introdução\n\nTexto em **markdown**...",
  "tags": "IA,Carreira,Produtividade",
  "category": "IA na Prática",
  "readTime": 8,
  "coverImage": null,
  "published": true
}
```

## Erros comuns

| Status | Causa | Ação |
|--------|-------|------|
| 401 | Cookie expirado ou credenciais erradas | Relogar; checar `BLOG_ADMIN_*` na Vercel |
| 400 | `title`, `slug` ou `content` inválidos | Corrigir payload |
| 409 | Slug duplicado | Usar outro slug ou PUT em post existente |

## Checklist antes de publicar

- [ ] `content` em markdown válido
- [ ] `slug` único e no formato correto
- [ ] `excerpt` preenchido (melhora listagem)
- [ ] `published: false` se o usuário quiser revisar no admin primeiro
- [ ] `coverImage` com URL pública se houver capa

Detalhes da API: [reference.md](reference.md)
