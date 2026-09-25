#!/usr/bin/env bash
# Executado NO SERVIDOR (via SSH, pelo workflow de deploy) depois que o rsync já colocou os
# arquivos estáticos da release em $1. É só uma virada de symlink — nada para reiniciar.
set -euo pipefail

RELEASE_DIR="$1"
APP_ROOT="/var/www/app.lrpa.com.br"

if [ ! -d "$RELEASE_DIR" ]; then
  echo "Release dir $RELEASE_DIR não existe" >&2
  exit 1
fi

ln -sfn "$RELEASE_DIR" "$APP_ROOT/current"

# Mantém as 5 releases mais recentes — nunca apaga a que está ativa agora em "current", mesmo
# que ela seja mais antiga por causa de um rollback manual anterior.
cd "$APP_ROOT/releases"
ACTIVE=$(basename "$(readlink -f "$APP_ROOT/current" 2>/dev/null || true)")
for dir in $(ls -1t | tail -n +6); do
  [ "$dir" = "$ACTIVE" ] || rm -rf "$dir"
done

echo "Deploy OK: $RELEASE_DIR"
