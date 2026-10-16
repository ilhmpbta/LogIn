<script setup lang="ts">
import { computed } from 'vue';
import type { NormalizedLog } from '@/types/soc';
import SeverityBadge from './SeverityBadge.vue';

const props = defineProps<{
    log: NormalizedLog;
}>();

const formattedTime = computed(() => {
    if (!props.log.timestamp) return '';
    try {
        const date = new Date(props.log.timestamp);
        return (
            date.toISOString().split('T')[1]?.slice(0, 8) || props.log.timestamp
        );
    } catch {
        return props.log.timestamp;
    }
});

const logTypeBadgeClass = computed(() => {
    switch (props.log.log_type) {
        case 'auth_log':
            return 'text-blue-300 bg-blue-500/15 border-blue-500/30';
        case 'network_log':
            return 'text-purple-300 bg-purple-500/15 border-purple-500/30';
        case 'firewall_log':
            return 'text-orange-300 bg-orange-500/15 border-orange-500/30';
        case 'system_log':
            return 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30';
        case 'application_log':
            return 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30';
        default:
            return 'text-zinc-400 bg-zinc-500/15 border-zinc-500/30';
    }
});
</script>

<template>
    <div
        class="flex items-center gap-2 border-b border-soc-terminal-border px-3 py-1 font-mono text-xs text-soc-terminal-fg transition-colors select-text hover:bg-zinc-800/50"
    >
        <span class="shrink-0 text-zinc-500">{{ formattedTime }}</span>

        <SeverityBadge :severity="log.severity" size="sm" :show-icon="false" />

        <span
            class="shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-semibold"
            :class="logTypeBadgeClass"
        >
            {{ log.log_type }}
        </span>

        <span class="shrink-0 font-semibold text-zinc-400">{{
            log.source_server
        }}</span>

        <span class="shrink-0 text-zinc-300"
            >[{{ log.source_ip }}:{{ log.destination_port }}]</span
        >

        <span class="flex-1 truncate text-zinc-200" :title="log.raw_message">
            <span class="mr-1.5 font-semibold text-zinc-400"
                >{{ log.event_type }}:</span
            >
            {{ log.raw_message }}
        </span>
    </div>
</template>
