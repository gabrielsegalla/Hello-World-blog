#!/usr/bin/env bash
# Monta post.json a partir do draft
# Uso: build-post-json.sh --slug meu-artigo [--published true|false]

set -euo pipefail

SLUG=""
PUBLISHED="false"
DRAFTS_ROOT=".cursor/skills/segalla-article-writer/drafts"

die() { echo "Erro: $*" >&2; exit 1; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --slug) SLUG="$2"; shift 2 ;;
    --published) PUBLISHED="$2"; shift 2 ;;
    --drafts-root) DRAFTS_ROOT="$2"; shift 2 ;;
    *) die "Argumento desconhecido: $1" ;;
  esac
done

[[ -n "$SLUG" ]] || die "Informe --slug"

DIR="$DRAFTS_ROOT/$SLUG"
META="$DIR/meta.json"
ARTICLE="$DIR/article.md"
MANIFEST="$DIR/images-manifest.json"
OUT="$DIR/post.json"

[[ -f "$ARTICLE" ]] || die "Artigo nao encontrado: $ARTICLE"
[[ -f "$META" ]] || die "Meta nao encontrado: $META (crie meta.json com title, subtitle, excerpt, category, tags, readTime)"

CONTENT=$(cat "$ARTICLE")
COVER="null"
if [[ -f "$MANIFEST" ]]; then
  COVER=$(jq -r '.images[] | select(.role=="cover") | .url // empty' "$MANIFEST" | head -1)
  [[ -n "$COVER" ]] || COVER="null"
fi

TITLE=$(jq -r '.title' "$META")
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

echo "Gerado: $OUT"
jq '{title, slug, category, readTime, coverImage, published, contentLength: (.content|length)}' "$OUT"
