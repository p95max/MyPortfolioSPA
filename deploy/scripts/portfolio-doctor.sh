#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/myportfoliospa}"
ENV_FILE="${PORTFOLIO_ENV_FILE:-/etc/portfolio/portfolio.env}"
COMPOSE_FILE="${COMPOSE_FILE:-$PROJECT_DIR/docker-compose.prod.yml}"

cd "$PROJECT_DIR"
export PORTFOLIO_ENV_FILE="$ENV_FILE"

read_env() {
    local line
    line="$(grep -E "^$1=" "$ENV_FILE" | tail -n 1 || true)"
    printf '%s' "${line#*=}" | tr -d '\r' | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

echo "== Git =="
git status --short
git log -1 --oneline

echo "== Compose configuration =="
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config --quiet

echo "== Runtime =="
/usr/local/bin/portfolio-status.sh

echo "== Storage =="
df -h / /var/backups/portfolio
docker system df

echo "== Database and Redis limits =="
database="$(read_env POSTGRES_DB)"
username="$(read_env POSTGRES_USER)"
[ -n "$database" ] && [ -n "$username" ] || {
    echo "PostgreSQL settings are missing from $ENV_FILE." >&2
    exit 1
}
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T db \
    psql -U "$username" -d "$database" \
    -Atc "SHOW shared_buffers; SHOW effective_cache_size; SHOW work_mem; SHOW maintenance_work_mem; SHOW max_connections;"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T redis \
    redis-cli CONFIG GET maxmemory maxmemory-policy

echo "== Operations timers =="
systemctl list-timers --all | grep portfolio || true

echo "Doctor completed successfully."
