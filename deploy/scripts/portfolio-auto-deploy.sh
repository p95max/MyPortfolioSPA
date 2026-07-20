#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/myportfoliospa}"
ENV_FILE="${PORTFOLIO_ENV_FILE:-/etc/portfolio/portfolio.env}"
COMPOSE_FILE="${COMPOSE_FILE:-$PROJECT_DIR/docker-compose.prod.yml}"
REMOTE_NAME="${REMOTE_NAME:-origin}"
DEPLOY_BRANCH="${PORTFOLIO_DEPLOY_BRANCH:-prod}"
TELEGRAM_BIN="${TELEGRAM_BIN:-/usr/local/bin/portfolio-telegram.py}"
RESULT="failed"

log() { printf '[%s] %s\n' "$(date -Is)" "$*"; }
notify() { [ -x "$TELEGRAM_BIN" ] && "$TELEGRAM_BIN" send --message "$1" || true; }

finish() {
    status=$?
    trap - EXIT
    if [ "$status" -eq 0 ]; then
        notify "[${PORTFOLIO_ENV_LABEL:-PROD}] deploy ${RESULT}: $(git -C "$PROJECT_DIR" rev-parse --short HEAD)"
    else
        notify "[${PORTFOLIO_ENV_LABEL:-PROD}] deploy FAILED (exit ${status}). Inspect: journalctl -u portfolio-auto-deploy.service"
    fi
    exit "$status"
}
trap finish EXIT

cd "$PROJECT_DIR"
export PORTFOLIO_ENV_FILE="$ENV_FILE"

git diff --quiet && git diff --cached --quiet || {
    git status --short
    echo "Refusing deploy: working tree is dirty." >&2
    exit 1
}

current_branch="$(git branch --show-current)"
[ "$current_branch" = "$DEPLOY_BRANCH" ] || {
    echo "Refusing deploy: expected branch $DEPLOY_BRANCH, got $current_branch." >&2
    exit 1
}

old_revision="$(git rev-parse HEAD)"
git fetch --prune "$REMOTE_NAME" "$DEPLOY_BRANCH"
new_revision="$(git rev-parse "$REMOTE_NAME/$DEPLOY_BRANCH")"

if [ "$old_revision" = "$new_revision" ]; then
    RESULT="up to date"
    log "Already up to date: $old_revision"
    exit 0
fi

git merge --ff-only "$REMOTE_NAME/$DEPLOY_BRANCH"
log "Building and starting $new_revision"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build --remove-orphans

log "Applying migrations and deployment checks"
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T web python manage.py migrate --noinput
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T web python manage.py check --deploy --fail-level ERROR

if ! curl --fail --silent --show-error --max-time 15 http://127.0.0.1:8000/api/health/ >/dev/null; then
    echo "API health check failed after deploy." >&2
    exit 1
fi

RESULT="updated"
log "Deploy completed: $old_revision -> $new_revision"
