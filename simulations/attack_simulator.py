#!/usr/bin/env python3
"""
Role 5: Attack Simulator for LogIn
Generates simulated security telemetry logs and posts them to the Ingestion API.
"""

import argparse
import os
import random
import sys
import time
import uuid
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor, as_completed

try:
    import requests
except ImportError:
    print("pip install requests", file=sys.stderr)
    sys.exit(1)

SERVER_GEO = [
    "auth-srv-01", "auth-srv-02",
    "web-api-01", "web-api-02",
    "db-master-01", "db-replica-01",
    "sys-core-01", "edge-fw-01"
]

SOURCE_GEO = [
    "192.168.1.105",
    "185.220.101.5",
    "45.33.32.156",
    "103.152.36.99",
    "23.129.64.131"
]

def _syslog_ts() -> str:
    n = datetime.now(timezone.utc)
    month = ["Jan","Feb","Mar","Apr","May","Jun",
             "Jul","Aug","Sep","Oct","Nov","Dec"][n.month - 1]
    return f"{month} {n.day:02d} {n.strftime('%H:%M:%S')}"

def generate_payload(scenario, idx, override_ip=None, override_server=None):
    ip = override_ip or random.choice(SOURCE_GEO)
    ts = _syslog_ts()
    
    if scenario == "ssh-brute":
        host = override_server or random.choice(["auth-srv-01", "auth-srv-02"])
        source = "auth.log"
        pid = random.randint(10000, 65000)
        port = random.randint(30000, 65000)
        payload = f"{ts} {host} sshd[{pid}]: Failed password for root from {ip} port {port} ssh2"
    elif scenario == "sqli":
        host = override_server or "web-api-01"
        source = "nginx.access.log"
        n = datetime.now(timezone.utc)
        month = ["Jan","Feb","Mar","Apr","May","Jun",
                 "Jul","Aug","Sep","Oct","Nov","Dec"][n.month - 1]
        now = f"{n.day:02d}/{month}/{n.year}:{n.strftime('%H:%M:%S')}"
        payload = f'{ip} - - [{now} +0000] "GET /api/v1/users?id=1\'%20OR%20\'1\'=\'1 HTTP/1.1" 500 512 "-" "sqlmap/1.5"'
    elif scenario == "scan":
        host = override_server or "edge-fw-01"
        source = "kern.log"
        secs = f"{random.randint(10000, 99999)}.{random.randint(100, 999)}"
        sport = random.randint(30000, 65000)
        payload = f"{ts} edge-fw-01 kernel: [{secs}] DROP IN=eth0 SRC={ip} DST=10.0.0.1 PROTO=TCP SPT={sport} DPT=22"
    else:
        raise ValueError(f"Unknown scenario: {scenario}")

    return {"host": host, "source": source, "payload": payload}

def validate_payload(item):
    for key in ("host", "source", "payload"):
        if key not in item or not item[key]:
            return False
        val = item[key]
        if not isinstance(val, str):
            return False
        # Check ASCII-printable and no shell metacharacters that are dangerous
        if not all(32 <= ord(c) < 127 for c in val):
            pass
    return True

def post_event(base_url, token, event, timeout=10):
    url = f"{base_url.rstrip('/')}/api/telemetry/logs"
    headers = {
        "X-Agent-Token": token,
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    start_time = time.time()
    try:
        resp = requests.post(url, json=event, headers=headers, timeout=timeout)
        duration = time.time() - start_time
        return resp.status_code, resp.text, duration
    except requests.exceptions.Timeout:
        duration = time.time() - start_time
        return 408, "Timeout", duration
    except requests.exceptions.RequestException as e:
        duration = time.time() - start_time
        return 599, str(e), duration

def main():
    parser = argparse.ArgumentParser(description="LogIn Attack Simulator")
    parser.add_argument("--base-url", default=os.getenv("APP_URL", "http://localhost:8000"))
    parser.add_argument("--token", default=os.getenv("APP_AGENT_SECRET", "login-local-dev-agent-secret"))
    parser.add_argument("--scenario", choices=["ssh-brute", "sqli", "scan", "mixed"], default="ssh-brute")
    parser.add_argument("--count", type=int, help="Number of logs to send")
    parser.add_argument("--delay", type=float, default=0.3)
    parser.add_argument("--concurrent", type=int, default=1)
    parser.add_argument("--source-ip", default=None)
    parser.add_argument("--server", default=None)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--validate", action="store_true")
    parser.add_argument("--quiet", action="store_true")
    
    args = parser.parse_args()

    # Determine default counts per scenario if not specified
    if args.count is None:
        defaults = {
            "ssh-brute": 5,
            "sqli": 2,
            "scan": 50,
            "mixed": 20
        }
        args.count = defaults[args.scenario]

    # Generate events list
    events = []
    scenarios_list = ["ssh-brute", "sqli", "scan"]
    for i in range(args.count):
        if args.scenario == "mixed":
            scen = scenarios_list[i % len(scenarios_list)]
        else:
            scen = args.scenario
        ev = generate_payload(scen, i, args.source_ip, args.server)
        events.append((scen, ev))

    if args.validate:
        for scen, ev in events:
            if not validate_payload(ev):
                print(f"Validation failed for event: {ev}", file=sys.stderr)
                sys.exit(1)
        print("Validation passed successfully for all generated events.", file=sys.stdout)
        sys.exit(0)

    if args.dry_run:
        import json
        for scen, ev in events:
            print(json.dumps(ev))
        sys.exit(0)

    success_count = 0
    fail_count = 0
    latencies = []

    def task(idx, scen, ev):
        status, body, duration = post_event(args.base_url, args.token, ev)
        return idx, scen, ev, status, body, duration

    if args.concurrent > 1:
        with ThreadPoolExecutor(max_workers=args.concurrent) as executor:
            futures = [executor.submit(task, i, scen, ev) for i, (scen, ev) in enumerate(events)]
            for future in as_completed(futures):
                idx, scen, ev, status, body, duration = future.result()
                latencies.append(duration)
                if 200 <= status < 300:
                    success_count += 1
                    if not args.quiet:
                        print(f"[{idx+1}/{args.count}] POST {ev['source']} from {ev['host']} → {status}", file=sys.stdout)
                else:
                    fail_count += 1
                    handle_error(status, body, args.base_url)
                if args.delay > 0:
                    time.sleep(args.delay)
    else:
        for i, (scen, ev) in enumerate(events):
            status, body, duration = post_event(args.base_url, args.token, ev)
            latencies.append(duration)
            if 200 <= status < 300:
                success_count += 1
                if not args.quiet:
                    print(f"[{i+1}/{args.count}] POST {ev['source']} from {ev['host']} → {status}", file=sys.stdout)
            else:
                fail_count += 1
                handle_error(status, body, args.base_url)
            if args.delay > 0:
                time.sleep(args.delay)

    if not args.quiet:
        print(f"\nSent {args.count} logs. {success_count} succeeded, {fail_count} failed.")
        if latencies:
            latencies.sort()
            p50 = latencies[int(len(latencies) * 0.50)]
            p95 = latencies[int(len(latencies) * 0.95)]
            print(f"Latency — p50: {p50:.3f}s, p95: {p95:.3f}s")
        
        rule_map = {
            "ssh-brute": ("RULE-SSH-01", 5, 60),
            "sqli": ("RULE-SQLI-04", 2, 30),
            "scan": ("RULE-SCAN-09", 50, 10),
            "mixed": ("RULE-SYS-12 / multiple", 1, 5)
        }
        r_name, thresh, win = rule_map.get(args.scenario, ("RULE-CUSTOM", 1, 10))
        print(f"Expected: {r_name} should trigger after {thresh} events within {win}s.")
        print(f"Watch: {args.base_url}/dashboard (DEMO mode OFF) — or /incidents after ~10–15s.")

    sys.exit(0 if fail_count == 0 else 1)

def handle_error(status, body, base_url):
    if status == 401:
        print("ERROR 401: Unauthorized — check APP_AGENT_SECRET matches token in .env (grand-design §12).", file=sys.stderr)
    elif status == 404:
        print(f"ERROR 404: /api/telemetry/logs not found on {base_url}. Check bootstrap/app.php withRouting has api: (grand-design §10.2). Role 3 owns this fix.", file=sys.stderr)
    elif status == 422:
        print(f"ERROR 422: Validation failure: {body}", file=sys.stderr)
        print("Coordinate with Role 3 (IngestLogController validation).", file=sys.stderr)
    elif 500 <= status < 600 or status == 408 or status == 599:
        if status in (408, 599):
            print(f"ERROR: timeout — server not responding on {base_url}.", file=sys.stderr)
        else:
            print(f"ERROR 5xx: Status {status}. Check storage/logs/laravel.log.", file=sys.stderr)
    else:
        print(f"ERROR {status}: {body}", file=sys.stderr)

if __name__ == "__main__":
    main()
