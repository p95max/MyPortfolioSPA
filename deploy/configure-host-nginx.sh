#!/usr/bin/env bash
# Run as root after DNS resolves to the VPS. Example:
# sudo deploy/configure-host-nginx.sh p95max.dev www.p95max.dev

set -Eeuo pipefail

primary_domain="${1:?Usage: $0 PRIMARY_DOMAIN [ADDITIONAL_DOMAIN ...]}"
shift
additional_domains="$*"
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
target="/etc/nginx/sites-available/portfolio"

case "$primary_domain $additional_domains" in
    *[!A-Za-z0-9.\ -]*)
        echo "Only hostnames separated by spaces are allowed." >&2
        exit 1
        ;;
esac

sed \
    -e "s/__PRIMARY_DOMAIN__/${primary_domain}/g" \
    -e "s/__ADDITIONAL_DOMAINS__/${additional_domains}/g" \
    "$script_dir/nginx/portfolio.conf.template" > "$target"
ln -sfn "$target" /etc/nginx/sites-enabled/portfolio
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "HTTP proxy configured. Obtain TLS after DNS is live:"
echo "certbot --nginx -d ${primary_domain} $(for domain in $additional_domains; do printf -- '-d %s ' "$domain"; done)"
