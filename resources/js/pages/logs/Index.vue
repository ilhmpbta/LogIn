<script setup lang="ts">
import { ref, computed } from 'vue';
import TerminalViewer from '@/components/soc/TerminalViewer.vue';
import { Search, Terminal, Pause, Play } from '@lucide/vue';
import type { NormalizedLog } from '@/types/soc';

const searchQuery = ref('');
const selectedLogType = ref<string>('ALL');
const isPaused = ref(false);

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
    {
        id: 'log-4',
        timestamp: new Date(Date.now() - 3000).toISOString(),
        source_server: 'sys-core-01',
        log_type: 'system_log',
        severity: 'LOW',
        source_ip: '10.0.0.15',
        destination_port: 80,
        event_type: 'SERVICE_RESTART',
        raw_message: 'Nginx web server process gracefully reloaded by systemd',
        metadata: {},
    },
]);

const filteredLogs = computed(() => {
    return mockLogs.value.filter((log) => {
        const matchesSearch =
            log.raw_message
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase()) ||
            log.source_ip.includes(searchQuery.value) ||
            log.source_server
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase()) ||
            log.event_type
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase());

        const matchesType =
            selectedLogType.value === 'ALL' ||
            log.log_type === selectedLogType.value;
        return matchesSearch && matchesType;
    });
});
</script>

<template>
    <div class="flex h-[calc(100vh-8rem)] flex-col space-y-6">
        <div
            class="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
            <div>
                <h2 class="text-lg font-bold tracking-tight text-foreground">
                    Live Log Stream
                </h2>
                <p class="mt-0.5 text-xs text-muted-foreground">
                    Real-time normalized log ingestion and terminal streaming.
                </p>
            </div>
            <div class="flex items-center gap-3">
                <button
                    class="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-muted"
                    @click="isPaused = !isPaused"
                >
                    <Pause
                        v-if="!isPaused"
                        class="h-3.5 w-3.5 text-amber-500"
                    />
                    <Play v-else class="h-3.5 w-3.5 text-emerald-500" />
                    <span>{{
                        isPaused ? 'Resume Stream' : 'Pause Stream'
                    }}</span>
                </button>
            </div>
        </div>

        <!-- Filters Bar -->
        <div
            class="flex shrink-0 flex-col items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm backdrop-blur-xs md:flex-row"
        >
            <div class="relative w-full flex-1">
                <Search
                    class="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground"
                />
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Filter logs by message, IP, server or event type..."
                    class="w-full rounded-lg border border-input bg-background py-2 pr-4 pl-9 text-xs text-foreground transition-colors placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none"
                />
            </div>

            <div class="flex w-full items-center gap-3 md:w-auto">
                <select
                    v-model="selectedLogType"
                    class="rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground transition-colors focus:border-emerald-500 focus:outline-none"
                >
                    <option value="ALL">All Log Types</option>
                    <option value="auth_log">auth_log</option>
                    <option value="network_log">network_log</option>
                    <option value="system_log">system_log</option>
                    <option value="application_log">application_log</option>
                    <option value="firewall_log">firewall_log</option>
                </select>
            </div>
        </div>

        <!-- Full-Page Terminal Viewer -->
        <div
            class="flex flex-1 flex-col overflow-hidden rounded-xl border border-soc-terminal-border bg-soc-terminal-bg p-4 shadow-inner"
        >
            <div
                class="mb-2 flex items-center justify-between border-b border-soc-terminal-border pb-3 font-mono text-xs text-soc-terminal-fg-muted"
            >
                <div class="flex items-center gap-2">
                    <Terminal class="h-4 w-4 text-emerald-400" />
                    <span>soc-cluster-ingest.log</span>
                </div>
                <span class="text-[11px] text-emerald-400"
                    >{{ filteredLogs.length }} events displayed</span
                >
            </div>
            <div class="flex-1 overflow-hidden">
                <TerminalViewer :logs="filteredLogs" :paused="isPaused" />
            </div>
        </div>
    </div>
</template>
