#!/usr/bin/env bash
# Wrapper: escolhe API ou ChatGPT web (Playwright)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
exec node "$ROOT/scripts/chatgpt-web/generate-image.mjs" "$@"
