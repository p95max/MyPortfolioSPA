#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/myportfoliospa}"
ENV_FILE="${PORTFOLIO_ENV_FILE:-/etc/portfolio/portfolio.env}"
COMPOSE_FILE="${COMPOSE_FILE:-$PROJECT_DIR/docker-compose.prod.yml}"

read_env() {
    local line
    line="$(grep -E "^$1=" "$ENV_FILE" | tail -n 1 || true)"
    printf '%s' "${line#*=}" | tr -d '\r' | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//"
}

database="$(read_env POSTGRES_DB)"
username="$(read_env POSTGRES_USER)"
neon_url="$(read_env NEON_BACKUP_DATABASE_URL)"

[ -n "$database" ] && [ -n "$username" ] || {
    echo "PostgreSQL settings are missing." >&2
    exit 1
}
[ -n "$neon_url" ] || {
    echo "NEON_BACKUP_DATABASE_URL is missing." >&2
    exit 1
}

# A typo here must never turn the local production database into the target.
case "$neon_url" in
    postgresql://*.neon.tech/*|postgres://*.neon.tech/*) ;;
    *) echo "NEON_BACKUP_DATABASE_URL must point to a neon.tech PostgreSQL host." >&2; exit 1 ;;
esac

umask 077
work_dir="$(mktemp -d /tmp/portfolio-neon-backup.XXXXXX)"
dump_file="$work_dir/portfolio.sql.gz"
trap 'rm -rf "$work_dir"' EXIT

export PORTFOLIO_ENV_FILE="$ENV_FILE"

# A plain, ownership-free dump can be restored by the managed Neon role.
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T db \
    pg_dump -U "$username" --format=plain --clean --if-exists --no-owner --no-privileges "$database" \
    | gzip -c > "$dump_file"

[ -s "$dump_file" ] && gzip -t "$dump_file"

# --single-transaction makes a failed remote restore leave the preceding Neon
# snapshot intact. The URL is injected only into this one container process and
# is never printed to the journal.
gzip -dc "$dump_file" | docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T \
    -e "NEON_BACKUP_DATABASE_URL=$neon_url" db \
    sh -ec 'PGCONNECT_TIMEOUT=30 psql "$NEON_BACKUP_DATABASE_URL" --quiet --set ON_ERROR_STOP=1 --single-transaction'

# Confirm that the restored schema and the principal portfolio data match.
verify_query="SELECT (SELECT count(*) FROM django_migrations), (SELECT count(*) FROM api_project), (SELECT count(*) FROM api_credential), (SELECT count(*) FROM api_analyticsevent);"
source_counts="$(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T db psql -U "$username" -d "$database" -Atqc "$verify_query")"
target_counts="$(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T \
    -e "NEON_BACKUP_DATABASE_URL=$neon_url" db \
    sh -ec 'psql "$NEON_BACKUP_DATABASE_URL" -Atqc "$1"' sh "$verify_query")"
[ "$source_counts" = "$target_counts" ] || {
    echo "Neon verification counts do not match the local database." >&2
    exit 1
}

echo "Neon backup completed and verified: $source_counts"
