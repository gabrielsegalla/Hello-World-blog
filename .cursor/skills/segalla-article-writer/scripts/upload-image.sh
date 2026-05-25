#!/usr/bin/env bash
# Upload de imagem para o blog (Supabase via API)
# Uso: upload-image.sh path/to/image.png

set -euo pipefail

FILE="${1:-}"
COOKIE_JAR="$(mktemp /tmp/segalla-upload.XXXXXX)"
trap 'rm -f "$COOKIE_JAR"' EXIT

die() { echo "Erro: $*" >&2; exit 1; }

load_env() {
  if [[ -f .env ]]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
  fi
  BLOG_URL="${BLOG_URL:-https://hello-world-blog-xi.vercel.app}"
  EMAIL="${BLOG_ADMIN_EMAIL:-${ADMIN_EMAIL:-}}"
  PASSWORD="${BLOG_ADMIN_PASSWORD:-${ADMIN_PASSWORD:-}}"
  [[ -n "$EMAIL" ]] || die "Defina BLOG_ADMIN_EMAIL"
  [[ -n "$PASSWORD" ]] || die "Defina BLOG_ADMIN_PASSWORD"
}

[[ -n "$FILE" && -f "$FILE" ]] || die "Uso: $0 path/to/image.png"

load_env

# Login
HTTP=$(curl -s -w "%{http_code}" -o /tmp/upload-login.json -c "$COOKIE_JAR" \
  -X POST "$BLOG_URL/api/auth" \
  -H "Content-Type: application/json" \
  -d "$(jq -nc --arg e "$EMAIL" --arg p "$PASSWORD" '{email:$e,password:$p}')")
[[ "$HTTP" == "200" ]] || die "Login falhou ($HTTP): $(cat /tmp/upload-login.json)"

# Upload
HTTP=$(curl -s -w "%{http_code}" -o /tmp/upload-res.json -b "$COOKIE_JAR" \
  -X POST "$BLOG_URL/api/upload" \
  -F "file=@${FILE}")
[[ "$HTTP" == "200" ]] || die "Upload falhou ($HTTP): $(cat /tmp/upload-res.json)"

cat /tmp/upload-res.json | jq .
