#!/usr/bin/env bash
# Scan de tendências IA/Dev para o agente editorial segalla.dev
# Uso: research-trends.sh [--days 7] [--json]

set -euo pipefail

DAYS=7
JSON=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --days) DAYS="$2"; shift 2 ;;
    --json) JSON=true; shift ;;
    *) echo "Uso: $0 [--days N] [--json]" >&2; exit 1 ;;
  esac
done

require() {
  command -v "$1" >/dev/null 2>&1 || { echo "❌ Requer: $1" >&2; exit 1; }
}

require curl
require jq
require date

SINCE=$(($(date +%s) - DAYS * 86400))

KEYWORDS='ai|artificial.intelligence|llm|gpt|claude|cursor|copilot|agent|mcp|rag|embedding|typescript|react|next\.?js|cypress|testing|devops|kubernetes|vercel|open.?source|programming|software.engineer|machine.learning|neural|transformer|api|framework|javascript|python|rust|go(lang)?'

section() {
  if [[ "$JSON" == true ]]; then return; fi
  echo ""
  echo "=== $1 ==="
  echo ""
}

fetch_hn_algolia() {
  local query="$1"
  curl -sG "https://hn.algolia.com/api/v1/search" \
    --data-urlencode "query=${query}" \
    --data-urlencode "tags=story" \
    --data-urlencode "numericFilters=created_at_i>${SINCE}" \
    --data-urlencode "hitsPerPage=15" \
    | jq -r '.hits[] | [.title, .url, (.points // 0), (.num_comments // 0), .created_at] | @tsv'
}

fetch_hn_top_filtered() {
  curl -s "https://hacker-news.firebaseio.com/v0/topstories.json" \
    | jq -r '.[0:40][]' \
    | while read -r id; do
        curl -s "https://hacker-news.firebaseio.com/v0/item/${id}.json" \
          | jq -r --arg kw "$KEYWORDS" '
              select(.title != null)
              | select(.title | test($kw; "i"))
              | [.title, (.url // ("https://news.ycombinator.com/item?id=" + (.id|tostring))), (.score // 0), (.descendants // 0), (.time | todate)] | @tsv
            '
      done
}

fetch_devto() {
  local tag="$1"
  curl -s "https://dev.to/api/articles?tag=${tag}&top=${DAYS}&per_page=12" \
    | jq -r '.[] | [.title, .url, (.positive_reactions_count // 0), (.comments_count // 0), .published_at] | @tsv'
}

if [[ "$JSON" == true ]]; then
  HN_AI=$(fetch_hn_algolia "AI" | jq -R -s -c 'split("\n") | map(select(length>0) | split("\t")) | map({title:.[0], url:.[1], points:(.[2]|tonumber), comments:(.[3]|tonumber), date:.[4]})')
  HN_DEV=$(fetch_hn_algolia "programming" | jq -R -s -c 'split("\n") | map(select(length>0) | split("\t")) | map({title:.[0], url:.[1], points:(.[2]|tonumber), comments:(.[3]|tonumber), date:.[4]})')
  DEVTO_AI=$(fetch_devto "ai" | jq -R -s -c 'split("\n") | map(select(length>0) | split("\t")) | map({title:.[0], url:.[1], reactions:(.[2]|tonumber), comments:(.[3]|tonumber), date:.[4]})')
  DEVTO_WEB=$(fetch_devto "webdev" | jq -R -s -c 'split("\n") | map(select(length>0) | split("\t")) | map({title:.[0], url:.[1], reactions:(.[2]|tonumber), comments:(.[3]|tonumber), date:.[4]})')
  jq -n \
    --argjson hn_ai "$HN_AI" \
    --argjson hn_dev "$HN_DEV" \
    --argjson devto_ai "$DEVTO_AI" \
    --argjson devto_web "$DEVTO_WEB" \
    --arg scanned_at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --argjson days "$DAYS" \
    '{scannedAt: $scanned_at, days: $days, hackerNews: {ai: $hn_ai, programming: $hn_dev}, devTo: {ai: $devto_ai, webdev: $devto_web}}'
  exit 0
fi

echo "Trend scan segalla.dev — últimos ${DAYS} dias"
echo "Gerado em: $(date -u +%Y-%m-%dT%H:%M:%SZ)"

section "Hacker News — busca: AI"
printf "TÍTULO\tURL\tPOINTS\tCOMMENTS\tDATA\n"
fetch_hn_algolia "AI" || true

section "Hacker News — busca: programming"
printf "TÍTULO\tURL\tPOINTS\tCOMMENTS\tDATA\n"
fetch_hn_algolia "programming" || true

section "Hacker News — top stories filtradas (IA/Dev)"
printf "TÍTULO\tURL\tSCORE\tCOMMENTS\tDATA\n"
fetch_hn_top_filtered 2>/dev/null | head -20 || true

section "Dev.to — tag: ai"
printf "TÍTULO\tURL\tREACTIONS\tCOMMENTS\tDATA\n"
fetch_devto "ai" || true

section "Dev.to — tag: webdev"
printf "TÍTULO\tURL\tREACTIONS\tCOMMENTS\tDATA\n"
fetch_devto "webdev" || true

section "Próximo passo do agente"
cat <<'EOF'
1. Cruzar candidatos acima com 4+ WebSearch
2. Ler as 6+ fontes mais promissoras com WebFetch
3. Pontuar top 3 tópicos (ver SKILL.md Fase 2)
4. Montar brief antes de escrever
EOF
