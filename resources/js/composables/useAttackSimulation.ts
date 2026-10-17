import { ref, type Ref } from 'vue';
import { lookupSourceGeo } from '@/lib/soc/geo';
import type {
    AgentExecutionUpdatedData,
    IncidentStatus,
    IncidentTriggeredData,
    LogType,
    NormalizedLog,
    Severity,
} from '@/types/soc';

// Public interface
type LogCallback = (log: NormalizedLog) => void;
type IncidentCallback = (incident: IncidentTriggeredData) => void;
type AgentStepCallback = (step: AgentExecutionUpdatedData) => void;

export interface AttackSimulation {
    isRunning: Ref<boolean>;
    start: () => void;
    stop: () => void;
    /** Subscribe to emitted logs. Returns an unsubscribe function. */
    onLog: (cb: LogCallback) => () => void;
    /** Subscribe to fired incidents. Returns an unsubscribe function. */
    onIncident: (cb: IncidentCallback) => () => void;
    /**
     * Subscribe to ReAct steps for a given incident. Buffered steps
     * are replayed synchronously on subscribe, then live steps follow.
     */
    onAgentStep: (incidentId: string, cb: AgentStepCallback) => () => void;
}

// Tunables
const LOG_INTERVAL_MIN_MS = 100; // ~10 logs/sec
const LOG_INTERVAL_MAX_MS = 500; // ~2 logs/sec

const AUTH_FAILURE_WINDOW_MS = 60_000;
const AUTH_FAILURE_THRESHOLD = 5;

// Probability that a failed-auth log comes from the current attacker.
const ATTACKER_FAILED_AUTH_BIAS = 0.7;
// Probability that a benign log comes from an internal IP.
const INTERNAL_IP_BIAS = 0.6;

// How many completed incident histories to keep for late subscribers.
const MAX_STEP_HISTORY = 5;

// Data pools
const SERVERS = [
    'auth-srv-01',
    'auth-srv-02',
    'web-api-01',
    'web-api-02',
    'db-master-01',
    'db-replica-01',
    'sys-core-01',
    'edge-fw-01',
] as const;

const INTERNAL_IPS = [
    '10.0.0.15',
    '10.0.0.22',
    '10.0.1.5',
    '10.0.1.18',
    '10.0.2.7',
    '10.0.2.44',
] as const;

const EXTERNAL_IPS = [
    '45.33.32.156',
    '103.152.36.99',
    '89.248.165.74',
    '198.98.51.189',
    '64.62.197.100',
] as const;

const ATTACKER_IPS = [
    '192.168.1.105',
    '185.220.101.5', // Tor exit node — plausible brute-force origin
    '45.33.32.156',
    '103.152.36.99',
    '23.129.64.131',
] as const;

// Log templates
interface LogTemplateContext {
    server: string;
    ip: string;
}

interface LogTemplate {
    log_type: LogType;
    severity: Severity;
    event_type: string;
    destination_port: number;
    weight: number;
    build: (ctx: LogTemplateContext) => {
        raw_message: string;
        metadata: Record<string, unknown>;
    };
}

const LOG_TEMPLATES: LogTemplate[] = [
    {
        log_type: 'auth_log',
        severity: 'LOW',
        event_type: 'SSH_LOGIN_SUCCESS',
        destination_port: 22,
        weight: 8,
        build: ({ server, ip }) => ({
            raw_message: `Accepted publickey for deploy from ${ip} port ${randomPort()} ssh2 (${server})`,
            metadata: { protocol: 'ssh', user: 'deploy' },
        }),
    },
    {
        log_type: 'auth_log',
        severity: 'MEDIUM',
        event_type: 'SSH_LOGIN_FAILED',
        destination_port: 22,
        weight: 6,
        build: ({ ip }) => ({
            raw_message: `Failed password for root from ${ip} port ${randomPort()} ssh2`,
            metadata: { attempted_user: 'root', protocol: 'ssh' },
        }),
    },
    {
        log_type: 'auth_log',
        severity: 'LOW',
        event_type: 'SUDO_COMMAND',
        destination_port: 0,
        weight: 3,
        build: () => ({
            raw_message: `sudo: deploy : TTY=pts/0 ; PWD=/var/www ; USER=root ; COMMAND=/bin/systemctl reload nginx`,
            metadata: { user: 'deploy', via: 'sudo' },
        }),
    },
    {
        log_type: 'application_log',
        severity: 'LOW',
        event_type: 'HTTP_REQUEST',
        destination_port: 443,
        weight: 12,
        build: ({ ip }) => {
            const methods = ['GET', 'POST', 'PUT'] as const;
            const paths = [
                '/api/v1/users',
                '/api/v1/incidents',
                '/api/v1/logs',
                '/health',
            ];
            const method = pickRandom(methods);
            const path = pickRandom(paths);
            return {
                raw_message: `${method} ${path} 200 ${randomBetween(8, 240)}ms - ${ip}`,
                metadata: { method, path, status: 200 },
            };
        },
    },
    {
        log_type: 'application_log',
        severity: 'MEDIUM',
        event_type: 'HTTP_ERROR',
        destination_port: 443,
        weight: 4,
        build: ({ ip }) => {
            const statuses = [401, 403, 404, 500] as const;
            const status = pickRandom(statuses);
            return {
                raw_message: `POST /api/v1/login ${status} ${randomBetween(15, 380)}ms - ${ip}`,
                metadata: {
                    method: 'POST',
                    path: '/api/v1/login',
                    status,
                },
            };
        },
    },
    {
        log_type: 'firewall_log',
        severity: 'LOW',
        event_type: 'FW_ACCEPT',
        destination_port: 443,
        weight: 10,
        build: ({ ip }) => ({
            raw_message: `ACCEPT IN=eth0 SRC=${ip} DST=10.0.0.1 PROTO=TCP SPT=${randomPort()} DPT=443`,
            metadata: { action: 'ACCEPT', protocol: 'tcp' },
        }),
    },
    {
        log_type: 'firewall_log',
        severity: 'MEDIUM',
        event_type: 'FW_DROP',
        destination_port: 5432,
        weight: 3,
        build: ({ ip }) => ({
            raw_message: `DROP IN=eth0 SRC=${ip} DST=10.0.0.1 PROTO=TCP SPT=${randomPort()} DPT=5432`,
            metadata: { action: 'DROP', protocol: 'tcp' },
        }),
    },
    {
        log_type: 'system_log',
        severity: 'LOW',
        event_type: 'SERVICE_RELOAD',
        destination_port: 0,
        weight: 3,
        build: () => ({
            raw_message: 'systemd[1]: Reloading nginx.service...',
            metadata: { unit: 'nginx.service' },
        }),
    },
    {
        log_type: 'system_log',
        severity: 'LOW',
        event_type: 'KERNEL',
        destination_port: 0,
        weight: 2,
        build: () => ({
            raw_message:
                'kernel: TCP: request_sock_TCP: Possible SYN flooding on port 443',
            metadata: {},
        }),
    },
    {
        log_type: 'network_log',
        severity: 'LOW',
        event_type: 'CONN_ESTABLISHED',
        destination_port: 443,
        weight: 5,
        build: ({ ip }) => ({
            raw_message: `conntrack: NEW tcp ${ip}:${randomPort()} -> 10.0.0.1:443`,
            metadata: { protocol: 'tcp', state: 'NEW' },
        }),
    },
];

// Helpers
function randomBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPort(): number {
    return randomBetween(30_000, 65_000);
}

function pickRandom<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

interface Weighted<T> {
    weight: number;
    value: T;
}

function pickWeighted<T>(items: readonly Weighted<T>[]): T {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    for (const item of items) {
        roll -= item.weight;
        if (roll <= 0) return item.value;
    }
    return items[items.length - 1].value;
}

const WEIGHTED_TEMPLATES: Weighted<LogTemplate>[] = LOG_TEMPLATES.map((t) => ({
    weight: t.weight,
    value: t,
}));

function formatDateCompact(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}${m}${day}`;
}

/**
 * crypto.randomUUID() requires a secure context. Localhost counts, but
 * a LAN demo over plain HTTP would throw. RFC4122 v4 fallback for safety.
 */
function uuid(): string {
    if (
        typeof crypto !== 'undefined' &&
        typeof crypto.randomUUID === 'function'
    ) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

// Module-level state (the singleton)
const isRunning = ref(false);

const logSubscribers = new Set<LogCallback>();
const incidentSubscribers = new Set<IncidentCallback>();
const agentStepSubscribers = new Map<string, Set<AgentStepCallback>>();

// Ring of recent ReAct step histories, keyed by incident_id.
const stepHistory = new Map<string, AgentExecutionUpdatedData[]>();

interface AuthFailure {
    ip: string;
    server: string;
    timestamp: number;
}

let recentAuthFailures: AuthFailure[] = [];
let logTimer: number | null = null;
let reactTimers: number[] = [];

let currentAttacker: string = pickRandom(ATTACKER_IPS);
let activeIncidentId: string | null = null;
let incidentCounter = 0;

// Log generation
function pickSourceIp(template: LogTemplate): string {
    if (template.event_type === 'SSH_LOGIN_FAILED') {
        return Math.random() < ATTACKER_FAILED_AUTH_BIAS
            ? currentAttacker
            : pickRandom(EXTERNAL_IPS);
    }
    return Math.random() < INTERNAL_IP_BIAS
        ? pickRandom(INTERNAL_IPS)
        : pickRandom(EXTERNAL_IPS);
}

function generateLog(): NormalizedLog {
    const template = pickWeighted(WEIGHTED_TEMPLATES);
    const server = pickRandom(SERVERS);
    const ip = pickSourceIp(template);
    const { raw_message, metadata } = template.build({ server, ip });
    const geo = lookupSourceGeo(ip);

    return {
        id: uuid(),
        timestamp: new Date().toISOString(),
        source_server: server,
        log_type: template.log_type,
        severity: template.severity,
        source_ip: ip,
        destination_port: template.destination_port,
        event_type: template.event_type,
        raw_message,
        metadata: {
            ...metadata,
            geo_location: {
                country: geo.country,
                city: geo.city,
            },
        },
    };
}

// Incident detection
function pruneOldFailures(): void {
    const cutoff = Date.now() - AUTH_FAILURE_WINDOW_MS;
    recentAuthFailures = recentAuthFailures.filter(
        (f) => f.timestamp >= cutoff,
    );
}

function findTrippedIp(): { ip: string; count: number; server: string } | null {
    const counts = new Map<string, { count: number; server: string }>();

    for (const f of recentAuthFailures) {
        const existing = counts.get(f.ip);
        if (existing) {
            existing.count += 1;
        } else {
            counts.set(f.ip, { count: 1, server: f.server });
        }
    }

    let best: { ip: string; count: number; server: string } | null = null;
    for (const [ip, entry] of counts) {
        if (entry.count < AUTH_FAILURE_THRESHOLD) continue;
        if (!best || entry.count > best.count) {
            best = { ip, count: entry.count, server: entry.server };
        }
    }
    return best;
}

// ReAct replay
interface ScriptedStep {
    step: number;
    delayMs: number;
    thought: string;
    tool_called: string | null;
    tool_parameters: Record<string, unknown> | null;
    tool_result: string | null;
    status: IncidentStatus;
}

function buildReactScript(incident: IncidentTriggeredData): ScriptedStep[] {
    const {
        attacker_ip: ip,
        target_server: server,
        incident_id: id,
        log_count_in_window: count,
    } = incident;

    return [
        {
            step: 1,
            delayMs: 1500,
            thought: `Incident ${id} triggered on ${server}: ${count} failed SSH authentication attempts from ${ip} within 60 seconds. Beginning investigation.`,
            tool_called: null,
            tool_parameters: null,
            tool_result: null,
            status: 'ANALYZING',
        },
        {
            step: 2,
            delayMs: 1800,
            thought: `Querying authentication logs for ${ip} to confirm the pattern and check for any successful logins.`,
            tool_called: 'query_auth_logs',
            tool_parameters: { source_ip: ip, since: '5m' },
            tool_result: `${count} failed attempts, 0 successful logins. All targeting user 'root'.`,
            status: 'ANALYZING',
        },
        {
            step: 3,
            delayMs: 1600,
            thought: `Pattern confirmed: sustained brute-force. Checking whether ${ip} is already present in the host firewall ruleset.`,
            tool_called: 'check_firewall_rules',
            tool_parameters: { ip },
            tool_result: `No existing rule for ${ip}. Source currently permitted on port 22.`,
            status: 'ANALYZING',
        },
        {
            step: 4,
            delayMs: 1700,
            thought: `Initiating containment: blocking ${ip} at the host firewall for 1 hour.`,
            tool_called: 'block_ip',
            tool_parameters: {
                ip,
                duration_seconds: 3600,
                reason: 'ssh-bruteforce',
            },
            tool_result: `iptables rule inserted: INPUT -s ${ip} -j DROP.`,
            status: 'MITIGATING',
        },
        {
            step: 5,
            delayMs: 1500,
            thought:
                'Block confirmed. Notifying on-call and flagging the incident for post-mortem review.',
            tool_called: 'notify_oncall',
            tool_parameters: { severity: 'critical', incident_id: id },
            tool_result: 'Notification dispatched to #soc-alerts.',
            status: 'MITIGATING',
        },
        {
            step: 6,
            delayMs: 1600,
            thought:
                'Containment complete. No successful compromise detected. Incident marked mitigated; continued monitoring active.',
            tool_called: null,
            tool_parameters: null,
            tool_result: null,
            status: 'MITIGATED',
        },
    ];
}

function recordStep(step: AgentExecutionUpdatedData): void {
    const existing = stepHistory.get(step.incident_id) ?? [];
    existing.push(step);
    stepHistory.set(step.incident_id, existing);

    if (stepHistory.size > MAX_STEP_HISTORY) {
        const oldest = stepHistory.keys().next().value;
        if (oldest !== undefined) stepHistory.delete(oldest);
    }
}

function replayReactSequence(incident: IncidentTriggeredData): void {
    const script = buildReactScript(incident);
    let elapsed = 0;

    for (const step of script) {
        elapsed += step.delayMs;
        const timer = window.setTimeout(() => {
            const payload: AgentExecutionUpdatedData = {
                incident_id: incident.incident_id,
                step: step.step,
                thought: step.thought,
                tool_called: step.tool_called,
                tool_parameters: step.tool_parameters,
                tool_result: step.tool_result,
                current_status: step.status,
            };

            recordStep(payload);

            const subs = agentStepSubscribers.get(incident.incident_id);
            if (subs) {
                subs.forEach((cb) => {
                    try {
                        cb(payload);
                    } catch (err) {
                        console.error(
                            '[sim] agent-step subscriber failed',
                            err,
                        );
                    }
                });
            }

            if (step.status === 'MITIGATED') {
                activeIncidentId = null;
            }
        }, elapsed);
        reactTimers.push(timer);
    }
}

// Incident firing
function fireIncident(ip: string, count: number, server: string): void {
    incidentCounter += 1;
    const now = new Date();
    const firstSeen = new Date(now.getTime() - AUTH_FAILURE_WINDOW_MS / 2);
    const incidentId = `inc-${formatDateCompact(now)}-${String(incidentCounter).padStart(3, '0')}`;

    const incident: IncidentTriggeredData = {
        incident_id: incidentId,
        title: `SSH brute-force attack on ${server}`,
        severity: 'CRITICAL',
        status: 'NEW',
        target_server: server,
        attacker_ip: ip,
        triggered_rule_id: 'RULE-SSH-01',
        log_count_in_window: count,
        first_seen: firstSeen.toISOString(),
        last_seen: now.toISOString(),
        logs_summary: [
            `${count} failed SSH authentication attempts in 60s`,
            'Target user: root',
            `Source: ${ip}`,
        ],
    };

    activeIncidentId = incidentId;

    // Clear this IP's failures so we don't immediately re-fire on the
    // remaining entries in the window.
    recentAuthFailures = recentAuthFailures.filter((f) => f.ip !== ip);

    incidentSubscribers.forEach((cb) => {
        try {
            cb(incident);
        } catch (err) {
            console.error('[sim] incident subscriber failed', err);
        }
    });

    replayReactSequence(incident);

    // Rotate the attacker for the next cycle so consecutive incidents
    // don't look identical.
    const alternatives = ATTACKER_IPS.filter((a) => a !== currentAttacker);
    currentAttacker = alternatives.length
        ? pickRandom(alternatives)
        : pickRandom(ATTACKER_IPS);
}

// Tick loop
function scheduleNext(): void {
    if (!isRunning.value) return;
    const delay = randomBetween(LOG_INTERVAL_MIN_MS, LOG_INTERVAL_MAX_MS);
    logTimer = window.setTimeout(tick, delay);
}

function tick(): void {
    if (!isRunning.value) return;

    const log = generateLog();

    logSubscribers.forEach((cb) => {
        try {
            cb(log);
        } catch (err) {
            console.error('[sim] log subscriber failed', err);
        }
    });

    // Only run the rule engine when we're not already mid-incident.
    if (activeIncidentId === null && log.event_type === 'SSH_LOGIN_FAILED') {
        recentAuthFailures.push({
            ip: log.source_ip,
            server: log.source_server,
            timestamp: Date.now(),
        });
        pruneOldFailures();

        const tripped = findTrippedIp();
        if (tripped) {
            fireIncident(tripped.ip, tripped.count, tripped.server);
        }
    }

    scheduleNext();
}

// Lifecycle
function start(): void {
    if (isRunning.value) return;

    recentAuthFailures = [];
    reactTimers = [];
    activeIncidentId = null;
    currentAttacker = pickRandom(ATTACKER_IPS);

    isRunning.value = true;
    scheduleNext();
}

function stop(): void {
    if (!isRunning.value) return;

    isRunning.value = false;

    if (logTimer !== null) {
        window.clearTimeout(logTimer);
        logTimer = null;
    }

    for (const t of reactTimers) window.clearTimeout(t);
    reactTimers = [];

    activeIncidentId = null;
    recentAuthFailures = [];
}

// Subscriptions
function onLog(cb: LogCallback): () => void {
    logSubscribers.add(cb);
    return () => {
        logSubscribers.delete(cb);
    };
}

function onIncident(cb: IncidentCallback): () => void {
    incidentSubscribers.add(cb);
    return () => {
        incidentSubscribers.delete(cb);
    };
}

function onAgentStep(incidentId: string, cb: AgentStepCallback): () => void {
    // Replay anything we've already emitted for this incident so a late
    // subscriber (e.g. user navigates to /incidents/{id} mid-replay)
    // doesn't miss the earlier steps.
    const buffered = stepHistory.get(incidentId);
    if (buffered) {
        for (const step of buffered) {
            try {
                cb(step);
            } catch (err) {
                console.error('[sim] buffered step replay failed', err);
            }
        }
    }

    let subs = agentStepSubscribers.get(incidentId);
    if (!subs) {
        subs = new Set();
        agentStepSubscribers.set(incidentId, subs);
    }
    subs.add(cb);

    return () => {
        const set = agentStepSubscribers.get(incidentId);
        if (!set) return;
        set.delete(cb);
        if (set.size === 0) agentStepSubscribers.delete(incidentId);
    };
}

// Exported singleton
const simulation: AttackSimulation = {
    isRunning,
    start,
    stop,
    onLog,
    onIncident,
    onAgentStep,
};

export function useAttackSimulation(): AttackSimulation {
    return simulation;
}
