---
name: segalla-article-writer
description: >-
  Redator profissional para segalla.dev. Transforma brief ou tópico em artigo
  longo, bem elaborado e com linguagem natural, gera imagens via OpenAI (ChatGPT)
  e integra capa/figuras no markdown. Use quando o usuário pedir para escrever,
  redigir ou finalizar artigo, gerar imagens para post, ou produzir conteúdo
  editorial de alta qualidade para o blog.
---

# Redator segalla.dev

Agente especializado em **escrita final**: artigo polido, tom humano, imagens via ChatGPT/OpenAI.

**Entrada:** brief JSON ([researcher](../segalla-article-researcher/examples/brief.example.json)), rascunho parcial, ou tópico + notas do usuário.

**Saída:** markdown completo em `drafts/{slug}/article.md` + imagens em `drafts/{slug}/images/` + `post.json` pronto para publicar.

Integra com [segalla-article-researcher](../segalla-article-researcher/SKILL.md) (pesquisa), [segalla-blog-post](../segalla-blog-post/SKILL.md) (publicação) e [segalla-blog-pipeline](../segalla-blog-pipeline/SKILL.md) (fluxo completo automático).

---

## Pré-requisitos

| Variável | Obrigatória | Uso |
|----------|-------------|-----|
| `OPENAI_API_KEY` | Sim (imagens) | API OpenAI / ChatGPT |
| `BLOG_ADMIN_EMAIL` | Upload | Enviar imagens ao Supabase |
| `BLOG_ADMIN_PASSWORD` | Upload | Enviar imagens ao Supabase |
| `BLOG_URL` | Não | Default hello-world-blog |

Adicione `OPENAI_API_KEY` no `.env` local. Ver `.env.example`.

---

## Fluxo do agente

```
Brief → Estrutura → Rascunho → Polimento → Imagens → Montagem → Revisão → [Publicar]
```

Não pule o polimento. Não publique sem revisão final.

---

## Fase 1: Preparar

1. Ler o brief ou pedido do usuário
2. Ler [writing-guide.md](writing-guide.md) e [voice.md](../segalla-article-researcher/voice.md)
3. Ler [image-guide.md](image-guide.md) se for gerar imagens
4. Criar pasta: `.cursor/skills/segalla-article-writer/drafts/{slug}/`

Se não houver brief, montar mentalmente: título provisório, ângulo, 5+ fatos com fonte, outline de 5+ seções.

---

## Fase 2: Estrutura expandida

Antes de escrever prosa, expandir o outline em `drafts/{slug}/outline.md`:

Por seção, definir:
- Objetivo da seção (1 frase)
- Pontos factuais obrigatórios
- Exemplo ou código (se aplicável)
- Transição para a próxima seção

Artigo longo: **mínimo 1.800 palavras** para temas técnicos, salvo pedido contrário.

---

## Fase 3: Rascunho

Escrever `drafts/{slug}/article.md` seguindo [writing-guide.md](writing-guide.md).

Regras duras:
- Português BR natural, tom Gabriel
- **Zero emojis**
- **Zero travessão longo (—)**
- Evitar listas com `-` em sequência; preferir parágrafos ou blocos **Label:** texto
- Abrir com gancho concreto, não "neste artigo vamos..."
- Fechar com próximo passo prático

Incluir placeholders de imagem onde fizer sentido:

```markdown
<!-- IMAGE: fig-01 | Diagrama do fluxo MCP no editor -->
```

---

## Fase 4: Polimento (obrigatório)

Reler o artigo inteiro e aplicar o checklist de [writing-guide.md](writing-guide.md#checklist-de-polimento).

Passos:
1. **Variar ritmo:** misturar frases curtas e longas
2. **Cortar enchimento:** remover frases que não acrescentam informação
3. **Humanizar:** trocar construções robóticas por fala direta
4. **Verificar facts:** cada dado externo tem fonte ou está marcado como opinião
5. **Ler em voz alta:** se soa artificial, reescrever o parágrafo

Salvar versão final em `article.md`. Opcional: `article.v1.md` como backup do rascunho.

---

## Fase 5: Imagens (OpenAI / ChatGPT)

### 5.1 Planejar

Criar `drafts/{slug}/images.json`:

```json
{
  "slug": "meu-artigo",
  "images": [
    {
      "id": "cover",
      "role": "cover",
      "alt": "Descrição acessível da capa",
      "prompt": "Prompt completo seguindo image-guide.md"
    },
    {
      "id": "fig-01",
      "role": "inline",
      "alt": "Descrição da figura",
      "prompt": "...",
      "afterHeading": "Na prática"
    }
  ]
}
```

Quantidade sugerida:
| Tamanho do artigo | Capa | Figuras inline |
|-------------------|------|----------------|
| Curto (< 1200 palavras) | 1 | 0–1 |
| Médio | 1 | 1–2 |
| Longo (> 1800 palavras) | 1 | 2–4 |

### 5.2 Gerar

```bash
.cursor/skills/segalla-article-writer/scripts/generate-image.sh \
  "PROMPT" \
  --out .cursor/skills/segalla-article-writer/drafts/{slug}/images/cover.png
```

Ou em lote:

```bash
.cursor/skills/segalla-article-writer/scripts/generate-images.sh \
  .cursor/skills/segalla-article-writer/drafts/{slug}/images.json
```

Modelo default: `gpt-image-1`. Fallback: `dall-e-3` (script trata automaticamente).

### 5.3 Upload para o blog

```bash
.cursor/skills/segalla-article-writer/scripts/upload-image.sh \
  .cursor/skills/segalla-article-writer/drafts/{slug}/images/cover.png
```

Retorna `{"url":"https://..."}`. Salvar URLs em `images-manifest.json`.

### 5.4 Inserir no markdown

Substituir placeholders por:

```markdown
![Alt text](https://url-publica-da-imagem.png)
```

Capa: usar URL em `post.json` → `coverImage`, **não** repetir no topo do body salvo pedido do usuário.

---

## Fase 6: Montar post.json

Template em [examples/post.template.json](examples/post.template.json).

```bash
# Montar payload a partir do artigo + manifest
.cursor/skills/segalla-article-writer/scripts/build-post-json.sh \
  --slug {slug} \
  --published false
```

Revisar `excerpt`, `readTime`, `category`, `tags`.

---

## Fase 7: Revisão final

Checklist antes de entregar:

- [ ] Tom natural; nenhum parágrafo "soa a IA"
- [ ] Sem emojis e sem travessão longo
- [ ] Título específico; excerpt funciona isolado
- [ ] Imagens com alt descritivo
- [ ] Links de fontes funcionam
- [ ] Código correto ou claramente ilustrativo
- [ ] `readTime` coerente (~200 palavras/min)

Entregar ao usuário:
1. Resumo do artigo (3 frases)
2. Caminho do draft
3. URLs das imagens
4. `post.json` se montado
5. Perguntar se publica ou ajusta

---

## Fase 8: Publicação (opcional)

Só se o usuário pedir explicitamente.

```bash
.cursor/skills/segalla-blog-post/scripts/post-to-blog.sh \
  .cursor/skills/segalla-article-writer/drafts/{slug}/post.json
```

Default: `published: false` para revisão no admin.

---

## Pipeline completo (3 skills)

```
segalla-blog-pipeline  →  orquestrador (recomendado)
  ├─ segalla-article-researcher  →  brief
  ├─ segalla-article-writer      →  artigo + imagens
  └─ segalla-blog-post           →  publicação
```

**Atalho:** `Rode segalla-blog-pipeline --auto --publish`

Comando mecânico: `./scripts/blog-pipeline.sh init`

---

## Erros comuns

| Problema | Solução |
|----------|---------|
| Texto genérico | Voltar ao brief; adicionar exemplo vivido da Fase 2 |
| Imagem com texto ilegível | Reprompt sem texto; ver image-guide.md |
| `OPENAI_API_KEY` ausente | Pedir ao usuário configurar no `.env` |
| Upload 401 | Checar `BLOG_ADMIN_*` |
| Artigo curto demais | Expandir seção "Na prática" e "Trade-offs" |

Detalhes de escrita: [writing-guide.md](writing-guide.md)
Detalhes de imagem: [image-guide.md](image-guide.md)
