#!/usr/bin/env bash
# Run once as root on a fresh Debian VPS before cloning the application.
# The script intentionally does not configure DNS, TLS, or restore database data.

set -Eeuo pipefail

PROJECT_USER="${PROJECT_USER:-portfolio}"
PROJECT_DIR="${PROJECT_DIR:-/opt/myportfoliospa}"
SWAP_SIZE="${SWAP_SIZE:-2G}"
SSH_PORT="${SSH_PORT:-22}"

[ "${EUID}" -eq 0 ] || {
    echo "Run this script as root." >&2
    exit 1
}

. /etc/os-release
[ "${ID}" = "debian" ] || {
    echo "This bootstrap script supports Debian only (detected: ${ID})." >&2
    exit 1
}

apt-get update
DEBIAN_FRONTEND=noninteractive apt-get full-upgrade -y
DEBIAN_FRONTEND=noninteractive apt-get install -y \
    ca-certificates \
    certbot \
    curl \
    git \
    gnupg \
    nginx \
    python3-certbot-nginx \
    ufw

install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
printf '%s\n' \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/debian ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list
apt-get update
DEBIAN_FRONTEND=noninteractive apt-get install -y \
    docker-buildx-plugin \
    docker-ce \
    docker-ce-cli \
    docker-compose-plugin \
    containerd.io
systemctl enable --now docker nginx

if ! swapon --noheadings --show=NAME | grep -qx /swapfile; then
    [ ! -e /swapfile ] || {
        echo "/swapfile exists but is not active; inspect it before retrying." >&2
        exit 1
    }
    fallocate -l "$SWAP_SIZE" /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
fi
grep -qsE '^/swapfile[[:space:]]' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
printf '%s\n' 'vm.swappiness=10' > /etc/sysctl.d/99-portfolio-swap.conf
sysctl --system >/dev/null

install -d -m 0755 /etc/systemd/journald.conf.d
printf '%s\n' \
    '[Journal]' \
    'SystemMaxUse=100M' \
    'RuntimeMaxUse=50M' \
    > /etc/systemd/journald.conf.d/portfolio.conf
systemctl restart systemd-journald

id "$PROJECT_USER" >/dev/null 2>&1 || \
    adduser --system --group --home "$PROJECT_DIR" "$PROJECT_USER"
usermod -aG docker "$PROJECT_USER"
install -d -o root -g "$PROJECT_USER" -m 0750 /etc/portfolio
install -d -o "$PROJECT_USER" -g "$PROJECT_USER" -m 0700 /var/backups/portfolio

ufw allow "${SSH_PORT}/tcp"
ufw allow 'Nginx Full'
ufw --force enable

echo "Bootstrap complete."
echo "Docker: $(docker --version)"
echo "Compose: $(docker compose version)"
free -h
ufw status verbose
echo "Next: clone the repository, create /etc/portfolio/portfolio.env, then configure host Nginx and TLS."
