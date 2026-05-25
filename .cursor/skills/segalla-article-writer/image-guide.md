# Guia de imagens — segalla-article-writer

Imagens via **OpenAI API** (`gpt-image-1`) ou, opcionalmente, **ChatGPT web** (Plus + Playwright, só local).

## Provider de imagem

| Modo | Env | Onde funciona |
|------|-----|---------------|
| API (padrão) | `IMAGE_PROVIDER=openai-api` + `OPENAI_API_KEY` | Local e Vercel |
| ChatGPT web | `IMAGE_PROVIDER=chatgpt-web` + sessão salva | Só no seu Mac |

Setup da gambiarra web: `scripts/chatgpt-web/README.md` e `npm run chatgpt:auth`.

## Estilo visual do blog

Referência de cores (dark tech):
- Fundo escuro: `#0a0a14`, `#0f0a1e`
- Roxo accent: `#7c3aed`, `#a78bfa`
- Texto claro: `#e8f4ff`

## Prompt base (copiar e adaptar)

```
Minimal tech blog illustration, dark background #0a0a14,
subtle purple accent #7c3aed, clean flat design with soft glow,
developer workspace aesthetic, no text, no watermark, no logo,
professional editorial style, 16:9 composition
```

Sempre acrescentar o **assunto específico** da imagem no final do prompt.

## Por tipo de imagem

### Capa (`role: cover`)

Wide, impacto visual, tema do artigo legível sem texto na imagem.

```
[Prompt base], abstract representation of [TEMA],
wide cinematic composition, single focal point, moody lighting
```

Tamanho: `1536x1024` (landscape).

### Figura inline (`role: inline`)

Diagrama ou metáfora visual simples. Deve funcionar em ~800px de largura.

```
[Prompt base], simple diagram showing [CONCEITO],
isometric or flat, 2-3 elements maximum, high contrast purple highlights
```

Tamanho: `1024x1024` ou `1536x1024`.

## Regras de prompt

**Fazer:**
- Descrever cena, cores, estilo, composição
- Pedir explicitamente `no text, no letters, no words`
- Manter paleta dark + purple consistente entre capa e figuras do mesmo artigo

**Evitar:**
- Texto dentro da imagem (OpenAI erra ortografia)
- Rostos realistas de pessoas famosas
- Logos de marcas (OpenAI, Google, etc.)
- Estilo cartoon infantil
- Imagens genéricas "brain with circuits" sem ligação ao tema

## Alt text

Descrição factual em português, 1 frase, para acessibilidade:

```
Diagrama de fluxo entre editor de código, servidor MCP e API externa
```

Não repetir o prompt inteiro no alt.

## Manifesto images.json

```json
{
  "slug": "exemplo-artigo",
  "images": [
    {
      "id": "cover",
      "role": "cover",
      "alt": "Ilustração abstrata de terminal conectado a serviços externos",
      "prompt": "Minimal tech blog illustration, dark background..."
    }
  ]
}
```

## Fallback

Se a imagem sair com texto ilegível ou estilo errado:
1. Reforçar `no text` no prompt
2. Simplificar cena (menos elementos)
3. Regenerar com `--model dall-e-3` se `gpt-image-1` falhar

## Upload

Após gerar localmente, sempre fazer upload pro Supabase via blog API para URL pública permanente. Não usar URLs temporárias da OpenAI no post final.
