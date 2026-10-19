# LogIn — Role 5: DevOps & Attack Simulation

## 1. Overview
Role 5 owns DevOps tooling, configuration audits, firewall mitigation wrappers, and attack simulation harnesses for the **LogIn** security operations center (SOC) capstone project.
- **Role positioning**: Grand Design §2.1
- **Firewall wrapper**: Grand Design §10.4 (`/usr/local/bin/logIn-block-ip`)
- **Telemetry smoke test**: Grand Design §12 (`/api/telemetry/logs`)

---

## 2. Prerequisites
- PHP 8.5+ & Composer
- SQLite database extension
- Python 3.10+ with `requests` library (`pip install requests`)
- UFW firewall (Linux) or `--mock` mode for non-production development environments.

---

## 3. First-Time Setup
```bash
composer setup
sudo bash simulations/setup-firewall.sh --php-user $(whoami)   # or --mock
bash simulations/demo-reset.sh
```

---

## 4. setup-firewall.sh
Installs the automated IP blocking wrapper and sudoers rule.
- **Flags**:
  - `--php-user <name>`: Specifies the PHP process user (default: `www-data`). Note: `php artisan serve` runs as your shell user, so use `--php-user $(whoami)` for local development.
  - `--mock`: Bypasses UFW and logs blocked IPs to `/tmp/login-block-ip.log` for testing on non-Linux or sandbox environments.
- **Verification Commands**:
  - Verify wrapper: `sudo -u <PHP_USER> sudo /usr/local/bin/logIn-block-ip 1.2.3.4`
  - Verify UFW: `sudo ufw status | grep 1.2.3.4`
  - Verify Mock: `tail /tmp/login-block-ip.log`

---

## 5. demo-reset.sh
Resets and seeds the demo environment for testing and demonstrations.
- **Flags**:
  - `--reset-firewall`: Opt-in flag to reset and re-enable UFW (`sudo ufw --force reset && sudo ufw --force enable`).
- **Behavior**:
  - Performs preflight checks for Role 3 & 4 migration files (`incidents`, `logs`, `rules`, `banned_ips`). On a fresh clone before Roles 3 & 4 ship their migrations, exits with an explicit actionable error.
  - Clears artisan caches, resets SQLite database, runs migrations/seeders, and restarts queues and Reverb.

---

## 6. attack_simulator.py
Simulates security telemetry ingestion attacks against `/api/telemetry/logs`.
- **CLI Reference & Scenarios**:
  - `--scenario ssh-brute | sqli | scan | mixed` (default: `ssh-brute`)
  - `--count <N>`: Number of logs to post
  - `--delay <seconds>`: Delay between requests (default: `0.3s`)
  - `--concurrent <N>`: ThreadPoolExecutor concurrency (prints p50/p95 latency summary)
  - `--dry-run`: Prints generated JSON payloads without POSTing
  - `--validate`: Performs local schema check (host, source, payload present, ASCII-printable)
- **Note**: Coordinate with Role 3 regarding ingest parser contracts before the Week 3 checkpoint.

---

## 7. Week 1–4 Checkpoint Table

| Week | Deliverable / Milestone | Dependencies | Status |
| :--- | :--- | :--- | :--- |
| **W1** | `.env.example` sync & Reverb/Broadcasting audit | None | ✅ Complete |
| **W2** | `setup-firewall.sh` & `demo-reset.sh` scripts | Roles 3 & 4 migrations | ✅ Complete |
| **W3** | `attack_simulator.py` & dry-run / validate | Role 3 API ingestion | ✅ Complete |
| **W4** | Concurrency, live end-to-end DoD verification | Roles 2, 3, 4 fully integrated | ⏸ Ready for integration |

---

## 8. Troubleshooting

| Error Code / Symptom | Root Cause & Action |
| :--- | :--- |
| **401 Unauthorized** | `APP_AGENT_SECRET` in `.env` does not match `X-Agent-Token` header. Check Grand Design §12. |
| **404 Not Found** | `/api/telemetry/logs` route not registered. Verify `bootstrap/app.php` includes `api:` (Role 3). |
| **422 Unprocessable** | Ingestion payload validation failed. Coordinate with Role 3 (`IngestLogController`). |
| **5xx Server Error** | Internal exception. Check `storage/logs/laravel.log`. |
| **Timeout / Connection Refused** | Laravel server not running on `--base-url`. Start with `php artisan serve`. |
| **Sudoers / Permission Error** | PHP process user mismatch. Ensure `--php-user` matches your running process user. |

---

## 9. Audit Log
- **2026-10-19**: Audited `config/reverb.php` and `config/broadcasting.php`. Verified both are environment-driven via `BROADCAST_CONNECTION` and `REVERB_*` per Grand Design §3 and §10. No changes required.
