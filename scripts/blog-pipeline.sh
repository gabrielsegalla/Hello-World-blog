#!/usr/bin/env bash
# Atalho na raiz do projeto para o pipeline editorial
exec "$(dirname "$0")/../.cursor/skills/segalla-blog-pipeline/scripts/run-pipeline.sh" "$@"
