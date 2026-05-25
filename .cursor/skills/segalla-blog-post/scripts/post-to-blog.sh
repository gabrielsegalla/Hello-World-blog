#!/usr/bin/env bash
# Publica artigo no segalla-blog via API.
# Uso: post-to-blog.sh post.json
#   ou: post-to-blog.sh --title "..." --slug "..." --content-file article.md [--published true]

set -euo pipefail

BLOG_URL="${BLOG_URL:-https://hello-world-blog-xi.vercel.app}"
EMAIL="${BLOG_ADMIN_EMAIL:-${ADMIN_EMAIL:-}}"
PASSWORD="${BLOG_ADMIN_PASSWORD:-${ADMIN_PASSWORD:-}}"
COOKIE_JAR="$(mktemp /tmp/segalla-cookies.XXXXXX)"

cleanup() { rm -f "$COOKIE_JAR"; }
trap cleanup EXIT

die() { echo "❌ $*" >&2; exit 1; }

require_env() {
  [[ -n "$EMAIL" ]] || die "Defina BLOG_ADMIN_EMAIL ou ADMIN_EMAIL"
  [[ -n "$PASSWORD" ]] || die "Defina BLOG_ADMIN_PASSWORD ou ADMIN_PASSWORD"
}

slugify() {
  node -e "
    const s = process.argv[1] || '';
    console.log(
      s.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\\s-]/g, '')
        .replace(/\\s+/g, '-')
        .replace(/^-+|-+\$/g, '')
        .slice(0, 80)
    );
  " "$1"
}

login() {
  local res http_code
  res=$(curl -s -w "\n%{http_code}" -c "$COOKIE_JAR" -X POST "$BLOG_URL/api/auth" \
    -H "Content-Type: application/json" \
    -d "$(jq -nc --arg e "$EMAIL" --arg p "$PASSWORD" '{email:$e,password:$p}')")
  http_code=$(echo "$res" | tail -n1)
  body=$(echo "$res" | sed '$d')
  [[ "$http_code" == "200" ]] || die "Login falhou ($http_code): $body"
  echo "✅ Login ok"
}

post_json() {
  local payload="$1"
  local res http_code body
  res=$(curl -s -w "\n%{http_code}" -b "$COOKIE_JAR" -X POST "$BLOG_URL/api/posts" \
    -H "Content-Type: application/json" \
    -d "$payload")
  http_code=$(echo "$res" | tail -n1)
  body=$(echo "$res" | sed '$d')
  if [[ "$http_code" == "201" ]]; then
    echo "$body" | jq .
    local slug published
    slug=$(echo "$body" | jq -r '.slug')
    published=$(echo "$body" | jq -r '.published')
    echo "✅ Post criado (id=$(echo "$body" | jq -r '.id'))"
    if [[ "$published" == "true" ]]; then
      echo "🔗 $BLOG_URL/posts/$slug"
    else
      echo "📝 Rascunho — publique em $BLOG_URL/admin/posts"
    fi
  else
    die "Criar post falhou ($http_code): $body"
  fi
}

# --- CLI ---
require_env
login

if [[ $# -eq 1 && -f "$1" && "$1" == *.json ]]; then
  post_json "$(cat "$1")"
  exit 0
fi

TITLE=""
SLUG=""
CONTENT=""
CONTENT_FILE=""
CATEGORY="Dev"
EXCERPT=""
SUBTITLE=""
TAGS=""
READ_TIME=5
COVER_IMAGE=""
PUBLISHED="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --title) TITLE="$2"; shift 2 ;;
    --slug) SLUG="$2"; shift 2 ;;
    --content) CONTENT="$2"; shift 2 ;;
    --content-file) CONTENT_FILE="$2"; shift 2 ;;
    --category) CATEGORY="$2"; shift 2 ;;
    --excerpt) EXCERPT="$2"; shift 2 ;;
    --subtitle) SUBTITLE="$2"; shift 2 ;;
    --tags) TAGS="$2"; shift 2 ;;
    --read-time) READ_TIME="$2"; shift 2 ;;
    --cover-image) COVER_IMAGE="$2"; shift 2 ;;
    --published) PUBLISHED="$2"; shift 2 ;;
    *) die "Argumento desconhecido: $1" ;;
  esac
done

[[ -n "$CONTENT_FILE" ]] && CONTENT="$(cat "$CONTENT_FILE")"
[[ -n "$TITLE" ]] || die "Informe --title ou passe um arquivo .json"
[[ -n "$CONTENT" ]] || die "Informe --content ou --content-file"
[[ -n "$SLUG" ]] || SLUG="$(slugify "$TITLE")"

PAYLOAD=$(jq -nc \
  --arg title "$TITLE" \
  --arg slug "$SLUG" \
  --arg content "$CONTENT" \
  --arg category "$CATEGORY" \
  --arg excerpt "$EXCERPT" \
  --arg subtitle "$SUBTITLE" \
  --arg tags "$TAGS" \
  --argjson readTime "$READ_TIME" \
  --argjson published "$([[ "$PUBLISHED" == "true" ]] && echo true || echo false)" \
  --arg coverImage "$COVER_IMAGE" \
  '{
    title: $title,
    slug: $slug,
    content: $content,
    category: $category,
    excerpt: (if $excerpt == "" then null else $excerpt end),
    subtitle: (if $subtitle == "" then null else $subtitle end),
    tags: $tags,
    readTime: $readTime,
    coverImage: (if $coverImage == "" then null else $coverImage end),
    published: $published
  }')

post_json "$PAYLOAD"
