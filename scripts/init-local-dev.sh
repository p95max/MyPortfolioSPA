#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
BACKEND_ENV="${PROJECT_ROOT}/backend/.env.dev"
BACKEND_ENV_EXAMPLE="${PROJECT_ROOT}/backend/.env.docker.dev.example"
FRONTEND_ENV="${PROJECT_ROOT}/frontend/.env"
FRONTEND_ENV_EXAMPLE="${PROJECT_ROOT}/frontend/.env.docker.dev.example"
FRONTEND_DIST="${PROJECT_ROOT}/frontend/dist"

log() {
  printf '\n[local-dev] %s\n' "$1"
}

fail() {
  printf '\n[local-dev] ERROR: %s\n' "$1" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command not found: $1"
}

set_env_value() {
  local file="$1"
  local key="$2"
  local value="$3"
  local escaped_value

  escaped_value="$(printf '%s' "$value" | sed 's/[&|]/\\&/g')"

  if grep -q "^${key}=" "$file"; then
    sed -i "s|^${key}=.*|${key}=${escaped_value}|" "$file"
  else
    printf '%s=%s\n' "$key" "$value" >> "$file"
  fi
}

ensure_env_file() {
  local destination="$1"
  local example="$2"

  if [[ -f "$destination" ]]; then
    log "Keeping existing ${destination#"${PROJECT_ROOT}/"}"
    return
  fi

  [[ -f "$example" ]] || fail "Environment template not found: $example"
  cp "$example" "$destination"
  log "Created ${destination#"${PROJECT_ROOT}/"} from its Docker development template"
}

ensure_dist_permissions() {
  mkdir -p "$FRONTEND_DIST" 2>/dev/null || true

  if [[ -d "$FRONTEND_DIST" && -w "$FRONTEND_DIST" ]]; then
    return
  fi

  if command -v sudo >/dev/null 2>&1; then
    log "Repairing ownership of frontend/dist"
    sudo chown -R "$(id -u):$(id -g)" "$FRONTEND_DIST"
    chmod -R u+rwX "$FRONTEND_DIST"
  else
    fail "frontend/dist is not writable. Change its owner to the current user and retry."
  fi
}

configure_environment() {
  # The frontend is served by Nginx, which proxies /api to Django. Same-origin
  # requests work both on localhost and through a Codespaces forwarded port.
  set_env_value "$FRONTEND_ENV" "VITE_API_URL" ""
  set_env_value "$FRONTEND_ENV" "VITE_USE_API_PROXY" "true"

  if [[ -n "${CODESPACE_NAME:-}" && -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]]; then
    local codespace_host
    local codespace_origin

    codespace_host="${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    codespace_origin="https://${codespace_host}"

    set_env_value "$BACKEND_ENV" "ALLOWED_HOST" "$codespace_host"
    set_env_value "$BACKEND_ENV" "EXTRA_ALLOWED_HOSTS" "localhost,127.0.0.1,web"
    set_env_value "$BACKEND_ENV" "CSRF_TRUSTED_ORIGINS" "$codespace_origin"
    set_env_value "$BACKEND_ENV" "CORS_ALLOWED_ORIGINS" "$codespace_origin"
    set_env_value "$BACKEND_ENV" "FRONTEND_BASE_URL" "$codespace_origin"
    set_env_value "$BACKEND_ENV" "BACKEND_BASE_URL" "$codespace_origin"

    APP_URL="${codespace_origin}/"
  else
    set_env_value "$BACKEND_ENV" "ALLOWED_HOST" "localhost"
    set_env_value "$BACKEND_ENV" "EXTRA_ALLOWED_HOSTS" "127.0.0.1,web"
    set_env_value "$BACKEND_ENV" "CSRF_TRUSTED_ORIGINS" "http://localhost:3000,http://localhost:8000"
    set_env_value "$BACKEND_ENV" "CORS_ALLOWED_ORIGINS" "http://localhost:3000,http://localhost:8000"
    set_env_value "$BACKEND_ENV" "FRONTEND_BASE_URL" "http://localhost:3000"
    set_env_value "$BACKEND_ENV" "BACKEND_BASE_URL" "http://localhost:8000"

    APP_URL="http://localhost:3000/"
  fi
}

build_frontend() {
  log "Preparing frontend dependencies"
  cd "${PROJECT_ROOT}/frontend"

  if [[ ! -d node_modules || package-lock.json -nt node_modules/.package-lock.json ]]; then
    npm ci
  else
    printf '[local-dev] Frontend dependencies are already up to date\n'
  fi

  log "Building frontend"
  npm run build
  [[ -f "${FRONTEND_DIST}/index.html" ]] || fail "Frontend build did not create dist/index.html"
}

start_stack() {
  log "Validating Docker Compose configuration"
  cd "$PROJECT_ROOT"
  docker compose config --quiet

  log "Building and starting local services"
  docker compose up -d --build

  log "Service status"
  docker compose ps
}

load_local_fixtures() {
  local load_fixtures
  local attempt

  load_fixtures="$(grep -E '^LOAD_FIXTURES=' "$BACKEND_ENV" | tail -n 1 | cut -d= -f2- | tr '[:upper:]' '[:lower:]')"

  if [[ "$load_fixtures" != "true" && "$load_fixtures" != "1" && "$load_fixtures" != "yes" ]]; then
    log "Skipping fixtures because LOAD_FIXTURES is not enabled"
    return
  fi

  log "Waiting for Django and PostgreSQL"

  for attempt in {1..30}; do
    if docker compose exec -T web poetry run python manage.py check --database default >/dev/null 2>&1; then
      break
    fi

    if [[ "$attempt" -eq 30 ]]; then
      docker compose logs web --tail=100
      fail "Django did not become ready in time"
    fi

    sleep 2
  done

  log "Loading local project fixtures"
  docker compose exec -T web \
    poetry run python manage.py loaddata api/fixtures/backup_db.json
}

main() {
  require_command docker
  require_command npm
  require_command sed
  docker compose version >/dev/null 2>&1 || fail "Docker Compose v2 is required"

  ensure_env_file "$BACKEND_ENV" "$BACKEND_ENV_EXAMPLE"
  ensure_env_file "$FRONTEND_ENV" "$FRONTEND_ENV_EXAMPLE"
  configure_environment
  ensure_dist_permissions
  build_frontend
  start_stack
  load_local_fixtures

  printf '\n[local-dev] Ready: %s\n' "$APP_URL"
  printf '[local-dev] API through frontend proxy: %sapi/\n' "$APP_URL"
  printf '[local-dev] Stop services with: docker compose down\n'
}

main "$@"
