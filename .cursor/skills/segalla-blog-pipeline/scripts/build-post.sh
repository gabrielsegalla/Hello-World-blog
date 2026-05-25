#!/usr/bin/env bash
# Gera post.json a partir de um RUN_DIR do pipeline
# Uso: build-post.sh RUN_DIR [--published true|false]

set -euo pipefail

RUN_DIR="${1:-}"
PUBLISHED="false"

die() { echo "Erro: $*" >&2; exit 1; }

[[ -n "$RUN_DIR" && -d "$RUN_DIR" ]] || die "Uso: $0 RUN_DIR [--published true|false]"
shift || true

while [[ $# -gt 0 ]]; do
  case "$1" in
    --published) PUBLISHED="$2"; shift 2 ;;
    *) die "Argumento desconhecido: $1" ;;
  esac
done

META="$RUN_DIR/meta.json"
ARTICLE="$RUN_DIR/article.md"
MANIFEST="$RUN_DIR/images-manifest.json"
OUT="$RUN_DIR/post.json"

[[ -f "$ARTICLE" ]] || die "article.md nao encontrado"
[[ -f "$META" ]] || die "meta.json nao encontrado"

CONTENT=$(cat "$ARTICLE")
COVER="null"
if [[ -f "$MANIFEST" ]]; then
  COVER=$(jq -r '.images[] | select(.role=="cover") | .url // empty' "$MANIFEST" | head -1)
  [[ -n "$COVER" ]] || COVER="null"
fi

TITLE=$(jq -r '.title' "$META")
SLUG=$(jq -r '.slug' "$META")
SUBTITLE=$(jq -r '.subtitle // empty' "$META")
EXCERPT=$(jq -r '.excerpt' "$META")
CATEGORY=$(jq -r '.category // "Dev"' "$META")
TAGS=$(jq -r '.tags // ""' "$META")
READ_TIME=$(jq -r '.readTime // 8' "$META")

jq -nc \
  --arg title "$TITLE" \
  --arg slug "$SLUG" \
  --arg content "$CONTENT" \
  --arg subtitle "$SUBTITLE" \
  --arg excerpt "$EXCERPT" \
  --arg category "$CATEGORY" \
  --arg tags "$TAGS" \
  --argjson readTime "$READ_TIME" \
  --arg coverImage "$COVER" \
  --argjson published "$([[ "$PUBLISHED" == "true" ]] && echo true || echo false)" \
  '{
    title: $title,
    slug: $slug,
    subtitle: (if $subtitle == "" then null else $subtitle end),
    excerpt: $excerpt,
    content: $content,
    category: $category,
    tags: $tags,
    readTime: $readTime,
    coverImage: (if $coverImage == "null" or $coverImage == "" then null else $coverImage end),
    published: $published
  }' > "$OUT"

echo "post.json gerado: $OUT"
jq '{title, slug, category, readTime, published, coverImage, chars: (.content|length)}' "$OUT"
