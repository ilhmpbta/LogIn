<script setup lang="ts">
import { ref, computed } from 'vue';
import TerminalViewer from '@/components/soc/TerminalViewer.vue';
import { Search, Terminal, Pause, Play } from '@lucide/vue';
import { useSocChannel } from '@/composables/useSocChannel';

const { logs, paused, togglePause } = useSocChannel({ maxLogs: 2_000 });

const searchQuery = ref('');
const selectedLogType = ref<string>('ALL');

const filteredLogs = computed(() => {
    return logs.value.filter((log) => {
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
                    @click="togglePause"
                >
                    <Pause v-if="!paused" class="h-3.5 w-3.5 text-amber-500" />
                    <Play v-else class="h-3.5 w-3.5 text-emerald-500" />
                    <span>{{ paused ? 'Resume Stream' : 'Pause Stream' }}</span>
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
                <TerminalViewer :logs="filteredLogs" :paused="paused" />
            </div>
        </div>
    </div>
</template>
