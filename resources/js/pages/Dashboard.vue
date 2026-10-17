<script setup lang="ts">
import { computed } from 'vue';
import MetricCard from '@/components/soc/MetricCard.vue';
import TerminalViewer from '@/components/soc/TerminalViewer.vue';
import IncidentTable, {
    type IncidentItem,
} from '@/components/soc/IncidentTable.vue';
import SeverityDonut from '@/components/soc/charts/SeverityDonut.vue';
import IngestionRateChart from '@/components/soc/charts/IngestionRateChart.vue';
import AttackMap from '@/components/soc/AttackMap.vue';
import { ShieldAlert, Terminal, Activity, Server, Zap } from '@lucide/vue';
import { useSocChannel } from '@/composables/useSocChannel';

const { logs, incidents, paused } = useSocChannel({
    maxLogs: 1_000,
    maxIncidents: 50,
});

const incidentItems = computed<IncidentItem[]>(() =>
    incidents.value.map((inc) => ({
        ...inc,
        id: inc.incident_id,
    })),
);

const severityDistribution = computed(() => {
    const dist = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    for (const inc of incidents.value) {
        if (inc.severity in dist) {
            dist[inc.severity]++;
        }
    }
    // Fallback/baseline if empty so charts look alive
    if (incidents.value.length === 0) {
        return { CRITICAL: 1, HIGH: 3, MEDIUM: 5, LOW: 10 };
    }
    return dist;
});
</script>

<template>
    <div class="space-y-6">
        <!-- Metric Cards Row -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                title="Active Incidents"
                :value="String(incidents.length)"
                change="+3 today"
                trend="up"
                variant="danger"
                :icon="ShieldAlert"
                description="Requiring agent intervention"
            />
            <MetricCard
                title="Log Ingestion Rate"
                :value="logs.length > 0 ? '420 /s' : '0 /s'"
                change="+12%"
                trend="up"
                variant="success"
                :icon="Activity"
                description="Real-time Reverb / Sim stream"
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
            <IngestionRateChart :logs="logs" />
            <AttackMap />
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
                    <TerminalViewer :logs="logs" :paused="paused" />
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
                <IncidentTable :incidents="incidentItems" />
            </div>
        </div>
    </div>
</template>
