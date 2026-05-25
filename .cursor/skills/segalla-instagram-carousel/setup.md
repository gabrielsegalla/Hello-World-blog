# Configuração — Instagram + ChatGPT no segalla.dev

## Visão geral

| Serviço | Para quê |
|---------|----------|
| **OpenAI API** | Legendas, hashtags e imagens dos slides (mesma key dos artigos) |
| **Meta for Developers** | OAuth + publicação no Instagram via Graph API |
| **Supabase Storage** | Hospedar imagens públicas (Instagram exige URL acessível) |
| **Vercel Cron** | Publicar carrosséis agendados |

---

## 1. OpenAI (ChatGPT API)

Usado pelo módulo de **artigos** e **Instagram**. Uma chave só.

### Passos

1. Acesse [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Crie uma API key (não confundir com login do ChatGPT Plus)
3. Adicione crédito/billing em [platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing)
4. No `.env` local e na Vercel:

```bash
OPENAI_API_KEY="sk-proj-..."
OPENAI_TEXT_MODEL="gpt-4o-mini"
OPENAI_IMAGE_MODEL="gpt-image-1"
OPENAI_IMAGE_SIZE="1024x1024"
```

### Custos aproximados por carrossel

| Item | Estimativa |
|------|------------|
| Texto (1 call gpt-4o-mini) | ~$0,01 |
| Imagens (7 slides gpt-image-1) | ~$0,10–0,40 |
| **Total** | ~$0,15–0,50 por carrossel |

### Teste rápido

No admin: `/admin/instagram` → status **ChatGPT: Configurado** (verde).

---

## 2. Instagram via Meta Graph API

A API oficial **não usa login/senha do Instagram**. Usa OAuth do Facebook com app Meta.

### Requisitos da conta

1. Instagram **Creator** ou **Business** (não conta pessoal comum)
2. Instagram **vinculado a uma Página do Facebook**
3. Você como admin da Page e do app Meta

Converter: Instagram → Configurações → Conta → Mudar para conta profissional.

Vincular Page: Instagram → Configurações → Conta → Página vinculada (ou Meta Business Suite).

### Criar app Meta

1. [developers.facebook.com/apps](https://developers.facebook.com/apps) → **Criar app**
2. Tipo: **Business** (ou Other → Business)
3. Adicionar produto **Instagram Graph API**
4. Em **Configurações → Básico**, copie:
   - ID do app → `META_APP_ID`
   - Chave secreta → `META_APP_SECRET`

### OAuth Redirect URI

Em **Facebook Login → Configurações** (ou Instagram → Configurações de API):

Adicione **URIs de redirecionamento OAuth válidos**:

```
https://segalla.dev/api/instagram/callback
http://localhost:3000/api/instagram/callback
```

No `.env`:

```bash
META_APP_ID="123456789"
META_APP_SECRET="abc..."
META_GRAPH_VERSION="v21.0"
META_REDIRECT_URI="https://segalla.dev/api/instagram/callback"
NEXT_PUBLIC_SITE_URL="https://segalla.dev"
```

### Permissões (App Review)

Para publicar em produção, solicite revisão das permissões:

| Permissão | Uso |
|-----------|-----|
| `instagram_basic` | Ler perfil |
| `instagram_content_publish` | Publicar carrosséis |
| `pages_show_list` | Listar Pages |
| `pages_read_engagement` | Acesso à Page |
| `business_management` | Contas Business |

Enquanto o app está em **modo Desenvolvimento**, só admins/testadores do app conseguem conectar.

Adicione seu usuário Facebook em **Funções → Funções do app → Administradores/Testadores**.

### Conectar no blog

1. Deploy com variáveis Meta na Vercel
2. Rode `npx prisma db push` (novas tabelas Instagram)
3. Acesse `/admin/instagram`
4. Clique **Conectar Instagram**
5. Autorize com a conta Facebook que administra a Page

---

## 3. Supabase Storage

Instagram precisa baixar cada imagem por URL pública.

1. Bucket `covers` (ou o definido em `SUPABASE_STORAGE_BUCKET`) deve ser **público**
2. Slides vão para `instagram/{carouselId}/{order}.png`

Variáveis (já usadas pelo blog):

```bash
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="..."
SUPABASE_STORAGE_BUCKET="covers"
```

---

## 4. Banco de dados (novas tabelas)

Após pull das alterações:

```bash
npx prisma generate
npx prisma db push
```

Tabelas: `InstagramAccount`, `InstagramCarousel`, `InstagramSlide`.

---

## 5. Agendamento (Vercel Cron)

1. Gere um secret:

```bash
openssl rand -hex 32
```

2. Adicione na Vercel:

```bash
CRON_SECRET="seu-secret"
```

3. O arquivo `vercel.json` já agenda `/api/cron/instagram` a cada 5 minutos.

4. No dashboard do carrossel, escolha data/hora e clique **Agendar**.

O cron publica carrosséis com `status: scheduled` quando `scheduledAt <= now`.

---

## 6. Fluxo de uso

### Manual (dashboard)

```
/admin/instagram
  → Conectar Instagram (uma vez)
  → Escolher artigo publicado
  → Gerar carrossel com ChatGPT
  → /admin/instagram/{id}
  → Revisar legenda + hashtags + slides
  → Agendar OU Publicar agora
```

### Via agente (skill)

```
Rode segalla-instagram-carousel para o post "guardrails-agentes-codigo-modelos-locais"
```

Ou após pipeline:

```
Rode segalla-blog-pipeline --auto --publish
Depois gere carrossel Instagram do artigo publicado
```

---

## 7. Variáveis completas (.env)

```bash
# OpenAI
OPENAI_API_KEY="sk-..."
OPENAI_TEXT_MODEL="gpt-4o-mini"
OPENAI_IMAGE_MODEL="gpt-image-1"
OPENAI_IMAGE_SIZE="1024x1024"

# Meta / Instagram
META_APP_ID=""
META_APP_SECRET=""
META_GRAPH_VERSION="v21.0"
META_REDIRECT_URI="https://segalla.dev/api/instagram/callback"

# Cron
CRON_SECRET="..."

# Já existentes
NEXT_PUBLIC_SITE_URL="https://segalla.dev"
NEXT_PUBLIC_SUPABASE_URL="..."
SUPABASE_SERVICE_ROLE_KEY="..."
SUPABASE_STORAGE_BUCKET="covers"
JWT_SECRET="..."
POSTGRES_URL_NON_POOLING="..."
```

---

## 8. Troubleshooting

| Problema | Causa provável |
|----------|----------------|
| "Nenhuma conta Instagram Business" | IG não vinculado à Page Facebook |
| OAuth redirect mismatch | `META_REDIRECT_URI` diferente do cadastrado no app |
| Publicação falha "Invalid image URL" | Bucket Supabase não público |
| Token expirado | Reconectar em `/admin/instagram` |
| App em dev mode | Adicionar usuário como tester ou submeter App Review |
| OPENAI quota | Billing/créditos na OpenAI |

---

## 9. Limitações atuais

- Máximo 10 slides por carrossel (Instagram)
- Imagens quadradas 1024x1024
- Texto dentro das imagens não é renderizado (só headline/body no admin preview; legenda vai na caption)
- Um único Instagram conectado por instalação
- Reconexão manual se token expirar (long-lived ~60 dias)
