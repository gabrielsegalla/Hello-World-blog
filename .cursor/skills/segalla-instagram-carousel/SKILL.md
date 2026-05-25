---
name: segalla-instagram-carousel
description: >-
  Gera carrosséis Instagram a partir de artigos do blog segalla.dev usando ChatGPT
  (OpenAI) para legendas, hashtags e imagens. Integra com dashboard admin,
  agendamento e publicação via Meta Graph API. Use quando o usuário pedir post
  Instagram, carrossel, social media do blog, ou promover artigo no Instagram.
---

# Instagram Carrossel — segalla.dev

Transforma artigos publicados em carrosséis Instagram com legenda, hashtags, slides visuais e agendamento.

Integra com [segalla-blog-pipeline](../segalla-blog-pipeline/SKILL.md) (opcional após publicar artigo).

## Pré-requisitos

| Variável | Uso |
|----------|-----|
| `OPENAI_API_KEY` | Legendas + imagens (ChatGPT / OpenAI API) |
| `META_APP_ID`, `META_APP_SECRET` | OAuth Instagram |
| `META_REDIRECT_URI` | Callback OAuth |
| `CRON_SECRET` | Job de agendamento na Vercel |
| Supabase (`NEXT_PUBLIC_SUPABASE_URL`, etc.) | Storage das imagens |

Setup completo: [setup.md](setup.md)

## Fluxo do agente

```
Artigo publicado → Gerar carrossel (OpenAI) → Revisar no admin → Agendar ou publicar
```

### Modo automático

Quando o usuário pedir carrossel para um artigo:

1. Confirmar que o post existe e está `published: true`
2. `POST /api/instagram/carousels` com `{ "postId": N }` (requer login admin via cookie ou orientar uso do dashboard)
3. Aguardar geração (texto + 6–8 imagens via OpenAI)
4. Entregar link: `/admin/instagram/{id}`

### Modo dashboard (recomendado)

Orientar o usuário:

1. Acesse `/admin/instagram`
2. Conecte Instagram (se ainda não)
3. Escolha artigo → **Gerar carrossel com ChatGPT**
4. Revise legenda, hashtags e slides
5. **Agendar** ou **Publicar agora**

## Geração via API (autenticado)

Login igual ao blog:

```bash
curl -s -c /tmp/cookies.txt -X POST "$BLOG_URL/api/auth" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$BLOG_ADMIN_EMAIL\",\"password\":\"$BLOG_ADMIN_PASSWORD\"}"

curl -s -b /tmp/cookies.txt -X POST "$BLOG_URL/api/instagram/carousels" \
  -H "Content-Type: application/json" \
  -d '{"postId": 5}'
```

Agendar:

```bash
curl -s -b /tmp/cookies.txt -X POST "$BLOG_URL/api/instagram/carousels/ID" \
  -H "Content-Type: application/json" \
  -d '{"action":"schedule","scheduledAt":"2026-05-26T18:00:00.000Z"}'
```

Publicar agora:

```bash
curl -s -b /tmp/cookies.txt -X POST "$BLOG_URL/api/instagram/carousels/ID" \
  -H "Content-Type: application/json" \
  -d '{"action":"publish"}'
```

## O que o OpenAI gera

Por artigo:

| Output | Detalhe |
|--------|---------|
| 6–8 slides | headline + bodyText curto |
| Imagens | 1024x1024, estilo dark/roxo segalla.dev |
| Legenda | até 2200 chars, CTA com link do artigo |
| Hashtags | 8–15 tags relevantes |

Modelos: `OPENAI_TEXT_MODEL` (default gpt-4o-mini), `OPENAI_IMAGE_MODEL` (default gpt-image-1).

## Agendamento

Carrosséis com `status: scheduled` e `scheduledAt` no passado são publicados pelo cron:

```
GET /api/cron/instagram
Authorization: Bearer $CRON_SECRET
```

Vercel roda a cada 5 min (`vercel.json`).

## Integração com pipeline editorial

Após `segalla-blog-pipeline --publish`:

```
1. Anotar post id/slug da resposta
2. Rodar segalla-instagram-carousel para esse postId
3. Usuário revisa em /admin/instagram/{id}
4. Agendar ou publicar
```

## Erros comuns

| Erro | Solução |
|------|---------|
| OPENAI_API_KEY ausente | Adicionar no `.env` e Vercel |
| Instagram não conectado | `/admin/instagram` → Conectar |
| Conta pessoal (não Business) | Converter para Creator/Business + Page Facebook |
| Permissão negada Meta | Revisar App Review em setup.md |
| Imagens não carregam no IG | URLs Supabase devem ser públicas |

Detalhes: [setup.md](setup.md)
