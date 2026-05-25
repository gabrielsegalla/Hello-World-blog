# Pipeline — referência técnica

## Scripts

| Script | Função |
|--------|--------|
| `run-pipeline.sh check` | Valida `.env` |
| `run-pipeline.sh init` | Cria RUN_DIR + trends.json |
| `run-pipeline.sh status RUN phase state` | Atualiza status.json |
| `run-pipeline.sh post RUN [--publish]` | Publica post.json |
| `build-post.sh RUN [--published true\|false]` | Gera post.json |

## status.json

```json
{
  "runId": "20260525-143000-a1b2",
  "createdAt": "2026-05-25T14:30:00Z",
  "phases": {
    "init": "done",
    "research": "done",
    "write": "in_progress",
    "publish": "pending"
  },
  "slug": null,
  "postUrl": null
}
```

## brief.json → meta.json

O redator copia do brief:

| brief | meta |
|-------|------|
| `workingTitle` | `title` |
| `slug` | `slug` |
| `subtitle` | `subtitle` |
| `excerpt` (gerar se ausente) | `excerpt` |
| `category` | `category` |
| `tags` | `tags` |
| `estimatedReadTime` | `readTime` |

## Imagens no RUN_DIR

`images.json` usa paths relativos ao RUN_DIR:

```json
{
  "slug": "meu-artigo",
  "runDir": true,
  "images": [
    {
      "id": "cover",
      "role": "cover",
      "alt": "...",
      "prompt": "...",
      "size": "1536x1024"
    }
  ]
}
```

Scripts de imagem detectam `runDir: true` e gravam em `{RUN_DIR}/images/`.

## Tempo estimado (modo auto)

| Config | Tempo aprox. |
|--------|----------------|
| `--no-images --draft` | 8–15 min agente |
| Com capa + 1 figura | 15–25 min |
| `--publish` + pesquisa profunda | 20–35 min |

## Integração com skills filhas

Esta skill **substitui** a necessidade de invocar as três separadamente. Ainda pode usar skills individuais para tarefas parciais:

- Só ideias → `segalla-article-researcher` (para no brief)
- Só reescrever → `segalla-article-writer` com brief existente
- Só publicar → `segalla-blog-post`
