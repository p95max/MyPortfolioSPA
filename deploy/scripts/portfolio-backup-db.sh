#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/myportfoliospa}"
ENV_FILE="${PORTFOLIO_ENV_FILE:-/etc/portfolio/portfolio.env}"
COMPOSE_FILE="${COMPOSE_FILE:-$PROJECT_DIR/docker-compose.prod.yml}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/portfolio}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
TELEGRAM_BIN="${TELEGRAM_BIN:-/usr/local/bin/portfolio-telegram.py}"

read_env() {
    local line
    line="$(grep -E "^$1=" "$ENV_FILE" | tail -n 1 || true)"
    printf '%s' "${line#*=}" | tr -d '\r' | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"
database="$(read_env POSTGRES_DB)"
username="$(read_env POSTGRES_USER)"
[ -n "$database" ] && [ -n "$username" ] || { echo "PostgreSQL settings are missing." >&2; exit 1; }

timestamp="$(date +%Y%m%d-%H%M%S)"
temporary="$(mktemp "$BACKUP_DIR/.portfolio-$timestamp.XXXXXX.sql.gz")"
final="$BACKUP_DIR/portfolio-postgres-$timestamp.sql.gz"
trap 'rm -f "$temporary"' EXIT

export PORTFOLIO_ENV_FILE="$ENV_FILE"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T db \
    pg_dump -U "$username" --format=plain --no-owner --no-privileges "$database" \
    | gzip -c > "$temporary"

[ -s "$temporary" ] && gzip -t "$temporary"
mv "$temporary" "$final"
chmod 600 "$final"
find "$BACKUP_DIR" -maxdepth 1 -type f -name 'portfolio-postgres-*.sql.gz' -mtime +"$RETENTION_DAYS" -delete
echo "Backup created: $final"
