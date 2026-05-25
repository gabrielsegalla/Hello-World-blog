#!/usr/bin/env bash
# Orquestrador mecânico do pipeline segalla.dev
# Uso:
#   run-pipeline.sh check
#   run-pipeline.sh init [--days 7]
#   run-pipeline.sh status RUN_DIR phase done|in_progress|pending|failed
#   run-pipeline.sh post RUN_DIR [--publish]
#   run-pipeline.sh latest

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
PIPELINE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNS_DIR="$PIPELINE_DIR/runs"
RESEARCH_SCRIPT="$PROJECT_ROOT/.cursor/skills/segalla-article-researcher/scripts/research-trends.sh"
POST_SCRIPT="$PROJECT_ROOT/.cursor/skills/segalla-blog-post/scripts/post-to-blog.sh"
BUILD_SCRIPT="$PIPELINE_DIR/scripts/build-post.sh"
WRITER_DIR="$PROJECT_ROOT/.cursor/skills/segalla-article-writer"

die() { echo "Erro: $*" >&2; exit 1; }
info() { echo "$*"; }

load_env() {
  local envfile="$PROJECT_ROOT/.env"
  if [[ -f "$envfile" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "$envfile"
    set +a
  fi
}

cmd_check() {
  load_env
  local ok=true
  [[ -n "${BLOG_ADMIN_EMAIL:-}" ]] || { echo "Falta BLOG_ADMIN_EMAIL"; ok=false; }
  [[ -n "${BLOG_ADMIN_PASSWORD:-}" ]] || { echo "Falta BLOG_ADMIN_PASSWORD"; ok=false; }
  [[ -x "$RESEARCH_SCRIPT" ]] || { echo "Script pesquisa nao encontrado: $RESEARCH_SCRIPT"; ok=false; }
  [[ -x "$POST_SCRIPT" ]] || { echo "Script post nao encontrado"; ok=false; }
  command -v jq >/dev/null || { echo "Falta jq"; ok=false; }
  command -v curl >/dev/null || { echo "Falta curl"; ok=false; }
  if [[ "$ok" == true ]]; then
    info "OK — pipeline pronto (OPENAI_API_KEY opcional se --no-images)"
    return 0
  fi
  return 1
}

cmd_init() {
  local days=7
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --days) days="$2"; shift 2 ;;
      *) die "Uso: init [--days N]" ;;
    esac
  done

  cmd_check || exit 1

  local run_id run_dir
  run_id="$(date -u +%Y%m%d-%H%M%S)-$(openssl rand -hex 2 2>/dev/null || echo "$RANDOM")"
  run_dir="$RUNS_DIR/$run_id"
  mkdir -p "$run_dir/images"

  info "Coletando tendencias..."
  "$RESEARCH_SCRIPT" --days "$days" --json > "$run_dir/trends.json"

  jq -n \
    --arg runId "$run_id" \
    --arg createdAt "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg runDir "$run_dir" \
    '{
      runId: $runId,
      createdAt: $createdAt,
      runDir: $runDir,
      phases: { init: "done", research: "pending", write: "pending", publish: "pending" },
      slug: null,
      postUrl: null
    }' > "$run_dir/status.json"

  info ""
  info "Pipeline iniciado"
  info "RUN_DIR=$run_dir"
  info ""
  info "Agente: continue com segalla-blog-pipeline (--auto recomendado)"
}

cmd_status() {
  local run_dir="${1:-}" phase="${2:-}" state="${3:-}"
  [[ -n "$run_dir" && -d "$run_dir" ]] || die "RUN_DIR invalido"
  [[ -n "$phase" && -n "$state" ]] || die "Uso: status RUN_DIR phase done|in_progress|pending|failed"

  local tmp
  tmp="$(mktemp)"
  jq --arg p "$phase" --arg s "$state" '.phases[$p] = $s' "$run_dir/status.json" > "$tmp"
  mv "$tmp" "$run_dir/status.json"

  if [[ -f "$run_dir/meta.json" ]]; then
    local slug
    slug=$(jq -r '.slug' "$run_dir/meta.json")
    tmp="$(mktemp)"
    jq --arg slug "$slug" '.slug = $slug' "$run_dir/status.json" > "$tmp"
    mv "$tmp" "$run_dir/status.json"
  fi
}

cmd_post() {
  local run_dir="${1:-}"
  local publish=false
  shift || true
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --publish) publish=true; shift ;;
      *) die "Flag desconhecida: $1" ;;
    esac
  done

  [[ -n "$run_dir" && -d "$run_dir" ]] || die "Uso: post RUN_DIR [--publish]"
  [[ -f "$run_dir/article.md" ]] || die "article.md nao encontrado em $run_dir"

  load_env

  if [[ ! -f "$run_dir/post.json" ]]; then
    [[ -f "$run_dir/meta.json" ]] || die "meta.json nao encontrado"
    "$BUILD_SCRIPT" "$run_dir" --published "$publish"
  elif [[ "$publish" == true ]]; then
    local tmp
    tmp="$(mktemp)"
    jq '.published = true' "$run_dir/post.json" > "$tmp"
    mv "$tmp" "$run_dir/post.json"
  fi

  info "Publicando..."
  local out
  out=$("$POST_SCRIPT" "$run_dir/post.json" 2>&1) || die "$out"
  echo "$out"

  local slug url tmp
  slug=$(jq -r '.slug' "$run_dir/post.json")
  BLOG_URL="${BLOG_URL:-https://hello-world-blog-xi.vercel.app}"
  if [[ "$(jq -r '.published' "$run_dir/post.json")" == "true" ]]; then
    url="$BLOG_URL/posts/$slug"
  else
    url="$BLOG_URL/admin/posts"
  fi

  tmp="$(mktemp)"
  jq --arg url "$url" '.phases.publish = "done" | .postUrl = $url' "$run_dir/status.json" > "$tmp"
  mv "$tmp" "$run_dir/status.json"

  info "POST_URL=$url"
}

cmd_images() {
  local run_dir="${1:-}"
  [[ -n "$run_dir" && -f "$run_dir/images.json" ]] || die "Uso: images RUN_DIR (requer images.json)"
  cd "$PROJECT_ROOT"
  "$WRITER_DIR/scripts/generate-images.sh" "$run_dir/images.json"
  "$WRITER_DIR/scripts/upload-images.sh" "$run_dir/images.json"
}

cmd_latest() {
  local latest
  latest=$(ls -td "$RUNS_DIR"/*/ 2>/dev/null | head -1 || true)
  [[ -n "$latest" ]] || die "Nenhuma execucao encontrada"
  info "RUN_DIR=${latest%/}"
  jq . "${latest}status.json" 2>/dev/null || true
}

mkdir -p "$RUNS_DIR"

case "${1:-}" in
  check) shift; cmd_check "$@" || exit 1 ;;
  init) shift; cmd_init "$@" ;;
  status) shift; cmd_status "$@" ;;
  post) shift; cmd_post "$@" ;;
  images) shift; cmd_images "$@" ;;
  latest) shift; cmd_latest "$@" ;;
  *)
    echo "Pipeline segalla.dev"
    echo ""
    echo "  $0 check                 Valida .env"
    echo "  $0 init [--days 7]       Cria RUN_DIR + trends.json"
    echo "  $0 status RUN PHASE ST   Atualiza fase"
    echo "  $0 images RUN            Gera + upload imagens"
    echo "  $0 post RUN [--publish]  Publica post.json"
    echo "  $0 latest                Ultima execucao"
    echo ""
    echo "Atalho no chat: Rode segalla-blog-pipeline --auto --publish"
    ;;
esac
