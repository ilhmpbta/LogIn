export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus =
    | 'NEW'
    | 'ANALYZING'
    | 'MITIGATING'
    | 'MITIGATED'
    | 'RESOLVED'
    | 'FALSE_POSITIVE';
export type LogType =
    | 'auth_log'
    | 'network_log'
    | 'system_log'
    | 'application_log'
    | 'firewall_log'
    | 'unknown';
export type AgentExecutionStatus =
    | 'PENDING'
    | 'RUNNING'
    | 'SUCCESS'
    | 'FAILED'
    | 'MITIGATED'
    | 'COMPLETED';

// Normalized Log Object
// Internal DTO used by Core Backend, Incident Manager & Frontend)
export interface GeoLocation {
    country: string;
    city: string;
}

export interface LogMetadata {
    attempted_user?: string;
    protocol?: string;
    geo_location?: GeoLocation;

    [key: string]: unknown; // Allow additional log-specific metadata.
}

export interface NormalizedLog {
    id: string;
    timestamp: string; // ISO 8601 UTC timestamp
    source_server: string;
    log_type: LogType;
    severity: Severity;
    source_ip: string;
    destination_port: number;
    event_type: string;
    raw_message: string;
    metadata: LogMetadata;
}

// Incident Triggered Event
// Published by Incident Manager via Reverb then Consumed by AI Agent & Frontend
export interface IncidentTriggeredData {
    incident_id: string;
    title: string;
    severity: Severity;
    status: IncidentStatus;
    target_server: string;
    attacker_ip: string;
    triggered_rule_id: string;
    log_count_in_window: number;
    first_seen: string; // ISO 8601 UTC timestamp
    last_seen: string; // ISO 8601 UTC timestamp
    logs_summary: string[];
}

export interface IncidentTriggeredEvent {
    event: 'IncidentTriggered';
    channel: 'soc-incidents';
    data: IncidentTriggeredData;
}

// Agent Execution  & Tool Call Stream
// Streamed by Agent to Frontend via WebSocket
export interface AgentToolParameters {
    [key: string]: unknown;
}

export interface AgentExecutionUpdatedData {
    incident_id: string;
    step: number;
    thought: string;
    tool_called: string | null;
    tool_parameters: AgentToolParameters | null;
    tool_result: string | null;
    current_status: IncidentStatus;
}

export interface AgentExecutionUpdatedEvent {
    event: 'AgentExecutionUpdated';
    channel: string; // e.g. "incident.inc-20261009-0089"
    data: AgentExecutionUpdatedData;
}

// Union OF SOC EVENTS for event dispatching and WebSocket handlers
export type SOCEvent = IncidentTriggeredEvent | AgentExecutionUpdatedEvent;

// 6. OPTIONAL: SOC API / WEBSOCKET MESSAGE HELPERS
export type ISO8601Timestamp = string;

export interface SOCWebSocketMessage<T = unknown> {
    event: string;
    channel: string;
    data: T;
}
