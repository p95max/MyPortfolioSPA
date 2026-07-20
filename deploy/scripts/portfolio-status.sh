#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/myportfoliospa}"
ENV_FILE="${PORTFOLIO_ENV_FILE:-/etc/portfolio/portfolio.env}"
COMPOSE_FILE="${COMPOSE_FILE:-$PROJECT_DIR/docker-compose.prod.yml}"

export PORTFOLIO_ENV_FILE="$ENV_FILE"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps

if curl --fail --silent --show-error --max-time 8 http://127.0.0.1:8000/api/health/ >/dev/null; then
    echo "API health: OK"
else
    echo "API health: FAILED"
    exit 1
fi
