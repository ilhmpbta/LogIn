#!/usr/bin/env bash
set -euo pipefail

# Role 5: Firewall Setup Script for LogIn
# Installs /usr/local/bin/logIn-block-ip and sudoers rule.

[[ $EUID -eq 0 ]] || { echo "Run as root: sudo bash $0" >&2; exit 1; }

PHP_USER="www-data"
MOCK=0

while [[ $# -gt 0 ]]; do
    case "$1" in
        --php-user)
            PHP_USER="$2"
            shift 2
            ;;
        --mock)
            MOCK=1
            shift
            ;;
        --help)
            echo "Usage: sudo bash $0 [--php-user <name>] [--mock]"
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

WRAPPER_PATH="/usr/local/bin/logIn-block-ip"
SUDOERS_FILE="/etc/sudoers.d/logIn"

if [[ $MOCK -eq 1 ]]; then
    echo "Installing MOCK firewall wrapper..."
    cat << 'EOF' > "$WRAPPER_PATH"
#!/usr/bin/env bash
set -euo pipefail

IP="$1"

# IPv4 with octet-range validation
if [[ "$IP" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
    IFS='.' read -r -a octets <<< "$IP"
    for octet in "${octets[@]}"; do
        if (( octet > 255 )); then
            echo "Invalid IPv4 octet: $octet" >&2
            exit 1
        fi
    done
# IPv6 (loose syntax check — ufw validates strictly)
elif [[ "$IP" =~ ^[0-9a-fA-F:]+$ ]] && [[ "$IP" == *:* ]]; then
    :
else
    echo "Invalid IP format" >&2
    exit 1
fi

MOCK_LOG="/tmp/login-block-ip.log"
echo "$(date -Iseconds) $IP" >> "$MOCK_LOG"
exit 0
EOF
else
    echo "Installing PRODUCTION firewall wrapper (UFW)..."
    cat << 'EOF' > "$WRAPPER_PATH"
#!/usr/bin/env bash
set -euo pipefail

IP="$1"

# IPv4 with octet-range validation
if [[ "$IP" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then
    IFS='.' read -r -a octets <<< "$IP"
    for octet in "${octets[@]}"; do
        if (( octet > 255 )); then
            echo "Invalid IPv4 octet: $octet" >&2
            exit 1
        fi
    done
# IPv6 (loose syntax check — ufw validates strictly)
elif [[ "$IP" =~ ^[0-9a-fA-F:]+$ ]] && [[ "$IP" == *:* ]]; then
    :
else
    echo "Invalid IP format" >&2
    exit 1
fi

exec /usr/sbin/ufw deny from "$IP" to any
EOF
fi

chown root:root "$WRAPPER_PATH"
chmod 0755 "$WRAPPER_PATH"

echo "Installing sudoers rule for user: $PHP_USER..."
echo "$PHP_USER ALL=(ALL) NOPASSWD: $WRAPPER_PATH" > "$SUDOERS_FILE"
chown root:root "$SUDOERS_FILE"
chmod 0440 "$SUDOERS_FILE"

visudo -c -f "$SUDOERS_FILE" || { echo "Sudoers validation failed!" >&2; exit 1; }

echo "Firewall setup completed successfully."
echo ""
echo "Verification commands:"
echo "  → Verify wrapper: sudo -u $PHP_USER sudo $WRAPPER_PATH 1.2.3.4"
if [[ $MOCK -eq 1 ]]; then
  echo "  → Verify mock: tail /tmp/login-block-ip.log"
else
  echo "  → Verify ufw: sudo ufw status | grep 1.2.3.4"
fi
echo "  → Note: php artisan serve runs as your shell user, not www-data; for dev use --php-user \$(whoami)."
