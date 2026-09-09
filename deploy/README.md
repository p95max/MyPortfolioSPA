# Netcup VPS deployment (Docker Compose)

This directory adapts the safe operations model from Argus for Portfolio:

- Docker Compose runs the application, PostgreSQL, Redis, and frontend Nginx.
- A host-side Telegram bot accepts only allowlisted `/deploy`, `/status`, and `/health` commands.
- systemd runs deploy, backup, and health-monitor timers outside the application containers.
- Deploy commands never execute user-provided shell text.

## Netcup pico (1 GB RAM) profile

The production Compose file is tuned for the stated 1 vCPU / 1 GB VPS:

- Gunicorn uses one worker and two threads through `MEMORY_LIMIT=512`.
- Redis is limited to 64 MB with `allkeys-lru` eviction.
- PostgreSQL uses conservative memory settings: 128 MB shared buffers, 384 MB
  effective cache size, 4 MB work memory, 64 MB maintenance work memory, and
  30 connections.
- Docker JSON logs rotate at 10 MB × 3 files per container.
- Backups require at least 1 GB of free disk space before they start.

Do not set any `VITE_*` variable to a secret: Vite embeds those values in the
browser bundle.

## VPS bootstrap

Run these steps from the Netcup web console or an existing root SSH session.
First add an SSH key for normal administration, verify it in a second terminal,
then disable password authentication; do not risk closing the only working SSH
session before verification.

Commit and push the `prod` branch before downloading the bootstrap script.
On the fresh VPS, run:

```bash
curl -fsSLO https://raw.githubusercontent.com/p95max/MyPortfolioSPA/prod/deploy/bootstrap-vps.sh
chmod 700 bootstrap-vps.sh
./bootstrap-vps.sh
rm bootstrap-vps.sh
```

It installs Docker Engine and Compose v2, Nginx, Certbot, UFW, a 2 GB swap
file, a 100 MB persistent journal cap, the `portfolio` deployment user, and
the required directories. It permits only SSH, HTTP, and HTTPS in UFW.
For an SSH port other than 22, run `SSH_PORT=2222 ./bootstrap-vps.sh` so that
the active SSH port is permitted before UFW is enabled.

Clone the production branch as the deployment user:

```bash
sudo -u portfolio git clone -b prod https://github.com/p95max/MyPortfolioSPA.git /opt/myportfoliospa
cd /opt/myportfoliospa
git branch --show-current
```

## Initial VPS bootstrap

1. Create a non-root deployment account and add it to Docker's group:

   ```bash
   sudo adduser --system --group --home /opt/myportfoliospa portfolio
   sudo usermod -aG docker portfolio
   sudo install -d -o root -g portfolio -m 0750 /etc/portfolio
   sudo install -d -o portfolio -g portfolio -m 0700 /var/backups/portfolio
   ```

2. Clone this repository as the `portfolio` user into `/opt/myportfoliospa` and install
   the env template as a root-owned file that the service group can only read:

   ```bash
   sudo install -o root -g portfolio -m 0640 \
     deploy/.env.production.example /etc/portfolio/portfolio.env
   sudoedit /etc/portfolio/portfolio.env
   ```

   Keep all production secrets only in that host file.

3. Put a TLS reverse proxy (for example Nginx with Certbot) in front of
   `127.0.0.1:8080`. Do not expose ports 8000, 8080, PostgreSQL, or Redis publicly.
   The proxy must forward `Host` and `X-Forwarded-Proto`.

4. Start the stack once:

   ```bash
   cd /opt/myportfoliospa
   export PORTFOLIO_ENV_FILE=/etc/portfolio/portfolio.env
   docker compose --env-file "$PORTFOLIO_ENV_FILE" -f docker-compose.prod.yml up -d --build
   ```

5. Install the host operations files:

   ```bash
   cd /opt/myportfoliospa
   bash deploy/install-ops.sh
   ```

## Weekly off-site Neon backup

Set `NEON_BACKUP_DATABASE_URL` in `/etc/portfolio/portfolio.env` to a dedicated
Neon backup database. `portfolio-backup-neon.timer` runs each Sunday at 04:15,
replaces that database atomically with a fresh local snapshot, and verifies
principal table counts. The Neon target must not be used by the live app.

## Telegram security

Set every Telegram variable in `/etc/portfolio/portfolio.env` before starting the bot:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_DEFAULT_CHAT_ID`
- `TELEGRAM_ALLOWED_CHAT_IDS`
- `TELEGRAM_ALLOWED_USER_IDS`

The bot ignores non-allowlisted chats/users. `/deploy` only starts the fixed
`portfolio-auto-deploy.service` through a narrowly scoped sudoers rule; it cannot run
arbitrary commands.

## Database migration from Render

Schedule a maintenance window. Take a `pg_dump` from Render, restore it into the Netcup
PostgreSQL container before switching DNS, run `python manage.py migrate`, then verify
`/api/health/`, `/api/projects/`, the contact form, and Django Admin. Keep Render live
until the Netcup backup and rollback path have been tested.

Use a custom-format dump so restoration is deterministic:

```bash
pg_dump --format=custom --no-owner --no-acl "$RENDER_DATABASE_URL" > portfolio-render.dump
docker cp portfolio-render.dump "$(docker compose -f docker-compose.prod.yml ps -q db)":/tmp/portfolio-render.dump
docker compose --env-file /etc/portfolio/portfolio.env -f docker-compose.prod.yml exec -T db \
  pg_restore -U portfolio_user -d portfolio_db --clean --if-exists --no-owner /tmp/portfolio-render.dump
docker compose --env-file /etc/portfolio/portfolio.env -f docker-compose.prod.yml exec -T web \
  python manage.py migrate --noinput
```

Before DNS cutover, check projects, certificates, contacts, analytics, admin
users, and recent events — not only the health endpoint. Keep the Render stack
available for rollback for several days.

## Host Nginx and TLS

After cloning, create the host Nginx configuration with the supplied template:

```bash
cd /opt/myportfoliospa
sudo deploy/configure-host-nginx.sh p95max.dev www.p95max.dev
```

It exposes only host Nginx and proxies it to `127.0.0.1:8080`; Docker ports
8000, 8080, PostgreSQL, and Redis remain private. Once DNS points at the VPS,
obtain and verify the certificate:

```bash
sudo certbot --nginx -d p95max.dev -d www.p95max.dev
sudo certbot renew --dry-run
```

The internal frontend Nginx preserves the host proxy's `X-Forwarded-For` and
`X-Forwarded-Proto` headers. Keep `DRF_NUM_PROXIES=1` in the production env.
If Cloudflare proxies the origin, configure trusted Cloudflare IP ranges with
Nginx `real_ip` directives before relying on client-IP throttling or analytics.

## Operations

```bash
systemctl status portfolio-telegram-bot.service
systemctl list-timers --all | grep portfolio
journalctl -u portfolio-auto-deploy.service -n 100 --no-pager
/usr/local/bin/portfolio-status.sh
/usr/local/bin/portfolio-doctor.sh
```
