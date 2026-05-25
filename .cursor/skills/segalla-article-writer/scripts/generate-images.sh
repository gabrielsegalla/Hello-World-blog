#!/usr/bin/env bash
# Gera imagens em lote a partir de images.json
# Uso: generate-images.sh path/to/images.json

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="${1:-}"

die() { echo "Erro: $*" >&2; exit 1; }

[[ -n "$MANIFEST" && -f "$MANIFEST" ]] || die "Uso: $0 path/to/images.json"

SLUG=$(jq -r '.slug' "$MANIFEST")
BASE_DIR="$(dirname "$MANIFEST")"

echo "Gerando imagens para: $SLUG"

jq -c '.images[]' "$MANIFEST" | while read -r item; do
  id=$(echo "$item" | jq -r '.id')
  role=$(echo "$item" | jq -r '.role')
  prompt=$(echo "$item" | jq -r '.prompt')
  size=$(echo "$item" | jq -r '.size // "1536x1024"')
  out="$BASE_DIR/images/${id}.png"

  echo ""
  echo "[$id] role=$role"

  "$SCRIPT_DIR/generate-image.sh" "$prompt" --out "$out" --size "$size"
done

echo ""
echo "Concluido. Proximo passo: upload-images.sh $MANIFEST"
