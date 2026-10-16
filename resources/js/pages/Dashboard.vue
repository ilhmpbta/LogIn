<script setup lang="ts">
import { ref } from 'vue';
import MetricCard from '@/components/soc/MetricCard.vue';
import TerminalViewer from '@/components/soc/TerminalViewer.vue';
import IncidentTable, {
    type IncidentItem,
} from '@/components/soc/IncidentTable.vue';
import SeverityDonut from '@/components/soc/charts/SeverityDonut.vue';
import IngestionRateChart from '@/components/soc/charts/IngestionRateChart.vue';
import IncidentTimelineChart from '@/components/soc/charts/IncidentTimelineChart.vue';
import { ShieldAlert, Terminal, Activity, Server, Zap } from '@lucide/vue';
import type { NormalizedLog } from '@/types/soc';

const mockLogs = ref<NormalizedLog[]>([
    {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        source_server: 'auth-srv-01',
        log_type: 'auth_log',
        severity: 'HIGH',
        source_ip: '192.168.1.105',
        destination_port: 22,
        event_type: 'SSH_BRUTE_FORCE',
        raw_message:
            'Multiple failed SSH login attempts for root user from 192.168.1.105',
        metadata: { attempted_user: 'root' },
    },
    {
        id: 'log-2',
        timestamp: new Date(Date.now() - 1000).toISOString(),
        source_server: 'web-api-02',
        log_type: 'application_log',
        severity: 'MEDIUM',
        source_ip: '45.33.32.156',
        destination_port: 443,
        event_type: 'SQL_INJECTION_ATTEMPT',
        raw_message:
            'Suspicious SQL payload detected in query parameter: UNION SELECT...',
        metadata: {},
    },
    {
        id: 'log-3',
        timestamp: new Date(Date.now() - 2000).toISOString(),
        source_server: 'db-master-01',
        log_type: 'firewall_log',
        severity: 'CRITICAL',
        source_ip: '185.220.101.5',
        destination_port: 5432,
        event_type: 'UNAUTHORIZED_PORT_SCAN',
        raw_message:
            'Port scanning detected on sensitive database port 5432 from Tor exit node',
        metadata: {},
    },
]);

const mockIncidents = ref<IncidentItem[]>([
    {
        id: 'inc-001',
        incident_id: 'inc-20261016-001',
        title: 'SSH Brute Force Attack on Auth Gateway',
        severity: 'CRITICAL',
        status: 'ANALYZING',
        target_server: 'auth-srv-01',
        attacker_ip: '192.168.1.105',
        triggered_rule_id: 'RULE-SSH-01',
        log_count_in_window: 42,
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        logs_summary: ['Failed SSH login', 'Brute force signature matched'],
    },
    {
        id: 'inc-002',
        incident_id: 'inc-20261016-002',
        title: 'SQL Injection on Production API Endpoint',
        severity: 'HIGH',
        status: 'MITIGATING',
        target_server: 'web-api-02',
        attacker_ip: '45.33.32.156',
        triggered_rule_id: 'RULE-SQLI-04',
        log_count_in_window: 15,
        first_seen: new Date(Date.now() - 300000).toISOString(),
        last_seen: new Date().toISOString(),
        logs_summary: ['SQL injection payload detected'],
    },
]);

const severityDistribution = {
    CRITICAL: 3,
    HIGH: 8,
    MEDIUM: 14,
    LOW: 25,
};
</script>

<template>
    <div class="space-y-6">
        <!-- Metric Cards Row -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                title="Active Incidents"
                value="11"
                change="+3 today"
                trend="up"
                variant="danger"
                :icon="ShieldAlert"
                description="Requiring agent intervention"
            />
            <MetricCard
                title="Log Ingestion Rate"
                value="1,420 /s"
                change="+12%"
                trend="up"
                variant="success"
                :icon="Activity"
                description="Real-time Reverb stream"
            />
            <MetricCard
                title="Protected Servers"
                value="36 / 36"
                change="100%"
                trend="neutral"
                variant="default"
                :icon="Server"
                description="All nodes reporting healthy"
            />
            <MetricCard
                title="AI Agent Mitigations"
                value="28"
                change="98.2% success"
                trend="up"
                variant="default"
                :icon="Zap"
                description="Automated playbook execution"
            />
        </div>

        <!-- Charts & Terminal Row -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <SeverityDonut :data="severityDistribution" />
            <IngestionRateChart :logs="mockLogs" />
            <IncidentTimelineChart />
        </div>

        <!-- Live Terminal & Incidents Table -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <!-- Terminal Viewer (Span 1) -->
            <div
                class="flex h-96 flex-col rounded-xl border border-border bg-card p-4 shadow-sm backdrop-blur-xs"
            >
                <div
                    class="mb-3 flex items-center justify-between border-b border-border pb-2"
                >
                    <div class="flex items-center gap-2">
                        <Terminal class="h-4 w-4 text-emerald-500" />
                        <span
                            class="text-xs font-medium tracking-wider text-foreground uppercase"
                            >Live Log Stream</span
                        >
                    </div>
                    <span
                        class="h-2 w-2 animate-ping rounded-full bg-emerald-500"
                    />
                </div>
                <div
                    class="flex-1 overflow-hidden rounded-lg border border-soc-terminal-border bg-soc-terminal-bg"
                >
                    <TerminalViewer :logs="mockLogs" />
                </div>
            </div>

            <!-- Incidents Table (Span 2) -->
            <div class="flex flex-col lg:col-span-2">
                <div class="mb-3 flex items-center justify-between">
                    <h2
                        class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
                    >
                        Recent Security Incidents
                    </h2>
                </div>
                <IncidentTable :incidents="mockIncidents" />
            </div>
        </div>
    </div>
</template>
