#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/myportfoliospa}"
SYSTEMD_DIR="/etc/systemd/system"
BIN_DIR="/usr/local/bin"
SUDOERS_FILE="/etc/sudoers.d/portfolio-ops"

cd "$PROJECT_DIR"
id portfolio >/dev/null 2>&1 || {
    echo "Create the dedicated 'portfolio' system user before installing operations files." >&2
    exit 1
}

sudo install -m 0644 deploy/systemd/portfolio-*.service deploy/systemd/portfolio-*.timer "$SYSTEMD_DIR/"
sudo install -o root -g portfolio -m 0750 deploy/scripts/portfolio-* "$BIN_DIR/"
sudo install -o root -g root -m 0440 deploy/sudoers/portfolio-ops "$SUDOERS_FILE"
sudo visudo -cf "$SUDOERS_FILE"
sudo systemctl daemon-reload
sudo systemctl enable --now portfolio-telegram-bot.service
sudo systemctl enable --now portfolio-auto-deploy.timer portfolio-backup-db.timer portfolio-health-monitor.timer

echo "Portfolio operations installed. Check: systemctl list-timers --all | grep portfolio"
