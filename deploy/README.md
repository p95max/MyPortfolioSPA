# Netcup VPS deployment (Docker Compose)

This directory adapts the safe operations model from Argus for Portfolio:

- Docker Compose runs the application, PostgreSQL, Redis, and frontend Nginx.
- A host-side Telegram bot accepts only allowlisted `/deploy`, `/status`, and `/health` commands.
- systemd runs deploy, backup, and health-monitor timers outside the application containers.
- Deploy commands never execute user-provided shell text.

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

## Operations

```bash
systemctl status portfolio-telegram-bot.service
systemctl list-timers --all | grep portfolio
journalctl -u portfolio-auto-deploy.service -n 100 --no-pager
/usr/local/bin/portfolio-status.sh
/usr/local/bin/portfolio-doctor.sh
```
