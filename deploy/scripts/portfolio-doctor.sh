#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/myportfoliospa}"
ENV_FILE="${PORTFOLIO_ENV_FILE:-/etc/portfolio/portfolio.env}"
COMPOSE_FILE="${COMPOSE_FILE:-$PROJECT_DIR/docker-compose.prod.yml}"

cd "$PROJECT_DIR"
export PORTFOLIO_ENV_FILE="$ENV_FILE"

echo "== Git =="
git status --short
git log -1 --oneline

echo "== Compose configuration =="
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config --quiet

echo "== Runtime =="
/usr/local/bin/portfolio-status.sh

echo "== Operations timers =="
systemctl list-timers --all | grep portfolio || true

echo "Doctor completed successfully."
