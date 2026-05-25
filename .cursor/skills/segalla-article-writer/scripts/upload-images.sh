#!/usr/bin/env bash
# Upload em lote e gera images-manifest.json com URLs publicas
# Uso: upload-images.sh path/to/images.json

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="${1:-}"

die() { echo "Erro: $*" >&2; exit 1; }

[[ -n "$MANIFEST" && -f "$MANIFEST" ]] || die "Uso: $0 path/to/images.json"

BASE_DIR="$(dirname "$MANIFEST")"
SLUG=$(jq -r '.slug' "$MANIFEST")
OUT_MANIFEST="$BASE_DIR/images-manifest.json"
TMP="$(mktemp)"

upload_one() {
  local id="$1" role="$2" alt="$3" file="$4"
  echo "Upload: $id" >&2
  local url
  url=$("$SCRIPT_DIR/upload-image.sh" "$file" | jq -r '.url')
  jq -nc \
    --arg id "$id" \
    --arg role "$role" \
    --arg alt "$alt" \
    --arg url "$url" \
    --arg file "$file" \
    '{id:$id, role:$role, alt:$alt, url:$url, localFile:$file}'
}

: > "$TMP"
while IFS= read -r item; do
  id=$(echo "$item" | jq -r '.id')
  role=$(echo "$item" | jq -r '.role')
  alt=$(echo "$item" | jq -r '.alt')
  file="$BASE_DIR/images/${id}.png"
  [[ -f "$file" ]] || die "Arquivo nao encontrado: $file"
  upload_one "$id" "$role" "$alt" "$file" >> "$TMP"
done < <(jq -c '.images[]' "$MANIFEST")

jq -s --arg slug "$SLUG" '{slug: $slug, images: .}' "$TMP" > "$OUT_MANIFEST"
rm -f "$TMP"

jq . "$OUT_MANIFEST"
echo "Manifest: $OUT_MANIFEST"
