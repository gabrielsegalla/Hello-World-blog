#!/usr/bin/env bash
# Gera imagem via OpenAI (ChatGPT) API
# Uso: generate-image.sh "prompt" --out path.png [--size 1536x1024] [--model gpt-image-1]

set -euo pipefail

PROMPT=""
OUT=""
SIZE="1536x1024"
MODEL="gpt-image-1"

die() { echo "Erro: $*" >&2; exit 1; }

load_env() {
  if [[ -f .env ]]; then
    set -a
    # shellcheck disable=SC1091
    source .env
    set +a
  elif [[ -f "$(cd "$(dirname "$0")/../../../.." && pwd)/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "$(cd "$(dirname "$0")/../../../.." && pwd)/.env"
    set +a
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --out) OUT="$2"; shift 2 ;;
    --size) SIZE="$2"; shift 2 ;;
    --model) MODEL="$2"; shift 2 ;;
    -*) die "Flag desconhecida: $1" ;;
    *)
      if [[ -z "$PROMPT" ]]; then
        PROMPT="$1"
      else
        PROMPT="$PROMPT $1"
      fi
      shift
      ;;
  esac
done

[[ -n "$PROMPT" ]] || die "Informe o prompt"
[[ -n "$OUT" ]] || die "Informe --out caminho/arquivo.png"

load_env
mkdir -p "$(dirname "$OUT")"

if [[ "${IMAGE_PROVIDER:-openai-api}" == "chatgpt-web" ]]; then
  PROJECT_ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
  node "$PROJECT_ROOT/scripts/chatgpt-web/generate-image.mjs" "$PROMPT" "$OUT"
  exit 0
fi

[[ -n "${OPENAI_API_KEY:-}" ]] || die "Defina OPENAI_API_KEY ou IMAGE_PROVIDER=chatgpt-web"

request_image() {
  local model="$1"
  curl -sS https://api.openai.com/v1/images/generations \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$(jq -nc \
      --arg model "$model" \
      --arg prompt "$PROMPT" \
      --arg size "$SIZE" \
      '{
        model: $model,
        prompt: $prompt,
        size: $size,
        n: 1
      } + (if $model == "dall-e-3" then {quality: "hd", response_format: "b64_json"} else {quality: "high"} end)')"
}

parse_and_save() {
  local resp="$1"
  local err
  err=$(echo "$resp" | jq -r '.error.message // empty')
  [[ -z "$err" ]] || return 1

  local b64 url
  b64=$(echo "$resp" | jq -r '.data[0].b64_json // empty')
  url=$(echo "$resp" | jq -r '.data[0].url // empty')

  if [[ -n "$b64" ]]; then
    if base64 --help 2>&1 | grep -q '\--decode'; then
      echo "$b64" | base64 --decode > "$OUT"
    else
      echo "$b64" | base64 -D > "$OUT"
    fi
    return 0
  fi
  if [[ -n "$url" ]]; then
    curl -sSL "$url" -o "$OUT"
    return 0
  fi
  return 1
}

RESP=$(request_image "$MODEL" || true)

if ! parse_and_save "$RESP"; then
  if [[ "$MODEL" != "dall-e-3" ]]; then
    echo "Tentando fallback dall-e-3..." >&2
    RESP=$(request_image "dall-e-3")
    parse_and_save "$RESP" || die "Falha ao gerar imagem: $(echo "$RESP" | jq -r '.error.message // .')"
  else
    die "Falha ao gerar imagem: $(echo "$RESP" | jq -r '.error.message // .')"
  fi
fi

BYTES=$(wc -c < "$OUT" | tr -d ' ')
echo "Imagem salva: $OUT (${BYTES} bytes)"
echo "Modelo: $MODEL | Tamanho: $SIZE"
