# ChatGPT web (Playwright) — gambiarra local

Usa sua assinatura **ChatGPT Plus** no navegador para gerar imagens com o mesmo modelo da interface web, em vez da API `gpt-image-1`.

## Limitações

- **Só funciona no seu Mac** (agente local, scripts). Não roda na Vercel.
- **Frágil**: se o ChatGPT mudar a UI, o script pode quebrar.
- **Possível violação dos ToS** da OpenAI (automação do site). Use por sua conta e risco.
- **Mais lento**: ~30–90s por imagem (espera render + download).
- Sessão expira; você precisa rodar `setup-auth` de novo de vez em quando.

## Autenticação 2FA (Google)

Se o Google pedir verificação em duas etapas durante `npm run chatgpt:auth`:

1. O terminal mostra `=== AGUARDANDO_2FA ===`
2. Informe o código **aqui no chat**
3. O assistente roda: `npm run chatgpt:2fa -- 123456`
4. O login continua sozinho

Para aprovação no celular (sem código), aprove no app Google e aguarde.

## Modo background (sem janela)

No `.env`:

```bash
CHATGPT_HEADLESS=true
```

O Playwright roda Chromium **invisível** — nenhuma janela abre na tela. O processo fica em background.

Para forçar janela visível (debug ou captcha manual):

```bash
CHATGPT_HEADLESS=false npm run chatgpt:auth
```

O fallback automático que abria o browser quando headless falhava foi **desligado**. Só volta se você definir `CHATGPT_HEADED_FALLBACK=true`.

## Setup (uma vez)

```bash
npm install
npx playwright install chromium

# Abre Chrome, você loga manualmente
npm run chatgpt:auth
```

No `.env`:

```bash
IMAGE_PROVIDER=chatgpt-web
CHATGPT_STORAGE_STATE=.chatgpt/auth.json
```

## Gerar uma imagem

```bash
npm run chatgpt:image -- "minimal tech illustration, dark blue gradient" /tmp/test.png
```

Ou via skill do redator (mesmo `generate-image.sh`):

```bash
IMAGE_PROVIDER=chatgpt-web .cursor/skills/segalla-article-writer/scripts/generate-image.sh \
  "prompt aqui" --out /tmp/capa.png
```

## Instagram / admin local

Com `IMAGE_PROVIDER=chatgpt-web` no `.env`, o endpoint de gerar carrossel no admin também usa Playwright — **desde que** você rode `npm run dev` localmente, não na Vercel.

## Voltar para API

```bash
IMAGE_PROVIDER=openai-api
OPENAI_API_KEY=sk-...
```

## Debug

| Problema | Solução |
|----------|---------|
| Sessão expirada | `npm run chatgpt:auth` |
| Campo de prompt não encontrado | UI mudou; atualize seletores em `generate-image.mjs` |
| Timeout | Aumente `CHATGPT_IMAGE_TIMEOUT_MS=240000` |
| Ver o browser | `CHATGPT_HEADLESS=false npm run chatgpt:image -- "..." out.png` |
