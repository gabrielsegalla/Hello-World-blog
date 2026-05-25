---
name: segalla-blog-pipeline
description: >-
  Orquestra o pipeline completo do blog segalla.dev em uma única execução:
  pesquisa tópicos em alta (segalla-article-researcher), redige artigo com
  imagens (segalla-article-writer) e publica (segalla-blog-post). Use quando o
  usuário pedir pipeline, rodar tudo, gerar e publicar artigo automaticamente,
  ou fluxo rápido de conteúdo IA/Dev para o blog.
---

# Pipeline editorial segalla.dev

Um agente, três fases, **sem parar entre elas** (salvo modo interativo).

```
PESQUISADOR → REDATOR → PUBLICADOR
     ↓            ↓           ↓
 brief.json   article.md   post live
```

## Comando rápido (usuário)

Diga ao agente:

> **Rode segalla-blog-pipeline**

Ou com opções:

> Rode segalla-blog-pipeline --auto --publish
> Rode segalla-blog-pipeline --topic "MCP no Cursor"
> Rode segalla-blog-pipeline --no-images --draft

## Início mecânico (agente executa primeiro)

```bash
.cursor/skills/segalla-blog-pipeline/scripts/run-pipeline.sh init
```

Isso cria a pasta da execução e imprime `RUN_DIR=...`. **Use esse RUN_DIR em todas as fases.**

Para publicar ao final (se `post.json` existir):

```bash
.cursor/skills/segalla-blog-pipeline/scripts/run-pipeline.sh post "$RUN_DIR" [--publish]
```

---

## Opções

| Flag | Default | Efeito |
|------|---------|--------|
| `--auto` | on | Escolhe o tópico #1 ranqueado sem perguntar |
| `--interactive` | off | Pausa após top 3 para o usuário escolher |
| `--topic "..."` | — | Pula descoberta; pesquisa só esse tema |
| `--publish` | off | `published: true` no post final |
| `--draft` | on se sem `--publish` | Rascunho no admin |
| `--no-images` | off | Pula geração OpenAI (mais rápido) |
| `--images N` | capa + 1 inline | Quantidade de figuras inline |

---

## Regras do orquestrador

1. **Não pare entre fases** no modo `--auto`
2. **Não peça confirmação** a menos que `--interactive`
3. **Handoff explícito:** cada fase lê/escreve arquivos em `RUN_DIR`
4. **Paralelizar:** WebSearch e WebFetch em batch na Fase 1
5. **Atualizar** `RUN_DIR/status.json` ao concluir cada fase
6. **Entregar** URL do post + resumo de 3 frases no final

---

## Fase 1 — Pesquisador (automático)

**Skill de referência:** [segalla-article-researcher](../segalla-article-researcher/SKILL.md)

**Entrada:** `RUN_DIR/trends.json` (gerado pelo script init)

**Executar:**

1. Ler `trends.json`
2. Se `--topic`: pular curadoria e usar o tópico informado
3. Senão: 4+ WebSearch + 6+ WebFetch em paralelo
4. Ranquear candidatos (critérios do researcher)
5. Modo `--auto`: selecionar #1. Modo `--interactive`: mostrar top 3 e aguardar
6. Pesquisa profunda: ≥8 fontes, ≥3 primárias
7. Salvar **`RUN_DIR/brief.json`** (schema em [brief.schema.json](brief.schema.json))

**Atualizar status:**

```bash
.cursor/skills/segalla-blog-pipeline/scripts/run-pipeline.sh status "$RUN_DIR" research done
```

**Handoff para redator:** `brief.json` completo. Não resumir; o redator lê o arquivo inteiro.

---

## Fase 2 — Redator (automático)

**Skill de referência:** [segalla-article-writer](../segalla-article-writer/SKILL.md)

**Entrada:** `RUN_DIR/brief.json`

**Executar sem pausa:**

1. Ler brief + [writing-guide.md](../segalla-article-writer/writing-guide.md) + [voice.md](../segalla-article-researcher/voice.md)
2. Escrever `RUN_DIR/outline.md` (rápido, 5 min mental)
3. Escrever e polir **`RUN_DIR/article.md`** (≥1800 palavras se tutorial/análise)
4. Criar **`RUN_DIR/meta.json`** a partir do brief
5. Se imagens habilitadas:
   - `RUN_DIR/images.json`
   - `generate-images.sh RUN_DIR/images.json` (salvar PNGs em `RUN_DIR/images/`)
   - `upload-images.sh RUN_DIR/images.json` → `RUN_DIR/images-manifest.json`
   - Inserir `![alt](url)` no article.md
6. Montar post:

```bash
.cursor/skills/segalla-blog-pipeline/scripts/build-post.sh "$RUN_DIR" \
  --published false
```

(Ajustar `published` na Fase 3 se `--publish`.)

**Atualizar status:**

```bash
.cursor/skills/segalla-blog-pipeline/scripts/run-pipeline.sh status "$RUN_DIR" write done
```

---

## Fase 3 — Publicador (automático)

**Skill de referência:** [segalla-blog-post](../segalla-blog-post/SKILL.md)

```bash
# Rascunho (default)
.cursor/skills/segalla-blog-pipeline/scripts/run-pipeline.sh post "$RUN_DIR"

# Live
.cursor/skills/segalla-blog-pipeline/scripts/run-pipeline.sh post "$RUN_DIR" --publish
```

**Atualizar status:** `publish done`

---

## Entrega final ao usuário

```markdown
## Pipeline concluído

**Título:** ...
**Slug:** ...
**URL:** https://hello-world-blog-xi.vercel.app/posts/{slug}
**Modo:** rascunho | publicado
**Run:** {RUN_DIR}

### Resumo
[3 frases]

### Arquivos
- brief.json
- article.md
- post.json
```

---

## Estrutura RUN_DIR

```
runs/20260525-143000-a1b2/
├── status.json
├── trends.json
├── brief.json
├── outline.md
├── article.md
├── meta.json
├── images.json
├── images-manifest.json
├── images/
│   ├── cover.png
│   └── fig-01.png
└── post.json
```

---

## Pré-requisitos (.env)

| Variável | Fase |
|----------|------|
| `BLOG_ADMIN_EMAIL` | upload + publish |
| `BLOG_ADMIN_PASSWORD` | upload + publish |
| `OPENAI_API_KEY` | imagens (pular com `--no-images`) |
| `BLOG_URL` | opcional |

Validar:

```bash
.cursor/skills/segalla-blog-pipeline/scripts/run-pipeline.sh check
```

---

## Atalho copy-paste

**Pipeline completo automático com publicação:**

```
Rode segalla-blog-pipeline: init, pesquise em auto, escreva com capa e 1 figura, publique live.
```

**Mais rápido (sem imagens, rascunho):**

```
Rode segalla-blog-pipeline --auto --no-images --draft
```

---

## Erros

| Falha | Ação |
|-------|------|
| `check` falhou | Completar `.env` |
| Slug 409 | Regenerar slug no meta.json e rebuild |
| OPENAI falhou | `--no-images` ou retry |
| Artigo curto | Expandir Fase 2 antes de post |

## Fase 4 (opcional) — Instagram

**Skill:** [segalla-instagram-carousel](../segalla-instagram-carousel/SKILL.md)

Após publicar o artigo, gerar carrossel a partir do `postId` retornado. Revisão em `/admin/instagram/{id}`.

Detalhes: [reference.md](reference.md)
