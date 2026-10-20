# LogIn — Setup Instructions

## 1. Prerequisites
- PHP 8.5+ & Composer
- SQLite database extension
- Python 3.10+ with `requests` library (`pip install requests`)
- UFW firewall (Linux) or `--mock` mode for non-production environments.

---

## 2. First-Time Setup
```bash
composer setup
cp .env.example .env
php artisan key:generate
sudo bash simulations/setup-firewall.sh --php-user $(whoami)   # or --mock
bash simulations/demo-reset.sh
```

---

## 3. Firewall Setup (`setup-firewall.sh`)
Installs the automated IP blocking wrapper and sudoers rule.

```bash
# Production setup (UFW)
sudo bash simulations/setup-firewall.sh --php-user www-data

# Local development setup (Mock mode & current shell user)
sudo bash simulations/setup-firewall.sh --php-user $(whoami) --mock
```

**Verification Commands:**
```bash
# Verify wrapper
sudo -u $(whoami) sudo /usr/local/bin/logIn-block-ip 1.2.3.4

# Verify UFW status (non-mock)
sudo ufw status | grep 1.2.3.4

# Verify Mock log
tail /tmp/login-block-ip.log
```

---

## 4. Demo Reset (`demo-reset.sh`)
Resets and seeds the demo environment.

```bash
# Standard reset and migration seed
bash simulations/demo-reset.sh

# Reset including firewall reset
bash simulations/demo-reset.sh --reset-firewall
```

---

## 5. Attack Simulation (`attack_simulator.py`)
Simulates security telemetry ingestion attacks.

```bash
# Install dependencies
pip install requests

# Run SSH brute-force scenario
python3 simulations/attack_simulator.py --scenario ssh-brute --count 5

# Run SQLi scenario
python3 simulations/attack_simulator.py --scenario sqli --count 2

# Run port scan scenario
python3 simulations/attack_simulator.py --scenario scan --count 50

# Run mixed scenario with concurrency
python3 simulations/attack_simulator.py --scenario mixed --count 20 --concurrent 4

# Validate payloads or dry-run
python3 simulations/attack_simulator.py --scenario mixed --validate
python3 simulations/attack_simulator.py --scenario ssh-brute --dry-run
```
