#!/usr/bin/env bash
set -euo pipefail

# Role 5: Demo Reset Script for LogIn

RESET_FIREWALL=0

while [[ $# -gt 0 ]]; do
    case "$1" in
        --reset-firewall)
            RESET_FIREWALL=1
            shift
            ;;
        --help)
            echo "Usage: bash $0 [--reset-firewall]"
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            exit 1
            ;;
    esac
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

[[ -f artisan ]] || { echo "ERROR: artisan not found in $ROOT. Run: composer install" >&2; exit 1; }

# Preflight migration checks
MIGRATION_PATTERNS=(
    "*_create_incidents_table.php"
    "*_create_logs_table.php"
    "*_create_rules_table.php"
    "*_create_banned_ips_table.php"
)

for pattern in "${MIGRATION_PATTERNS[@]}"; do
    if ! compgen -G "database/migrations/${pattern}" >/dev/null; then
        echo "ERROR: Missing migration '${pattern}'. Requires Role 3 & Role 4 migrations. See grand-design.md §2.3." >&2
        exit 1
    fi
done

# Preflight .env warnings
if [[ -f .env ]]; then
    if ! grep -q "^APP_AGENT_SECRET=" .env; then
        echo "WARNING: .env is missing APP_AGENT_SECRET." >&2
    fi
    if ! grep -q "^BROADCAST_CONNECTION=reverb" .env; then
        echo "WARNING: .env BROADCAST_CONNECTION is not set to reverb." >&2
    fi
else
    echo "WARNING: .env not found. Copy .env.example to .env first." >&2
fi

echo "Running optimization clear..."
php artisan optimize:clear

echo "Ensuring SQLite database exists..."
mkdir -p database
touch database/database.sqlite

echo "Running migrate:fresh --seed..."
php artisan migrate:fresh --seed --force

echo "Flushing queues and restarting workers/reverb..."
php artisan queue:flush || true
php artisan queue:restart || true
php artisan reverb:restart || true

if [[ $RESET_FIREWALL -eq 1 ]]; then
    echo "Resetting firewall (UFW)..."
    sudo ufw --force reset && sudo ufw --force enable
fi

echo ""
echo "=== Demo Reset Summary ==="
echo " Database reset & seeded successfully."
echo " Caches cleared, queues flushed, queue workers & Reverb signaled."
if [[ $RESET_FIREWALL -eq 1 ]]; then
    echo " Firewall reset and enabled via UFW."
fi
echo " Reminder: If running 'php artisan reverb:start' or 'php artisan queue:work' in foreground, restart them now."
