<script setup lang="ts">
import { ref, computed } from 'vue';
import IncidentTable, {
    type IncidentItem,
} from '@/components/soc/IncidentTable.vue';
import { Search } from '@lucide/vue';
import { useSocChannel } from '@/composables/useSocChannel';

const { incidents } = useSocChannel({ maxIncidents: 100 });

const searchQuery = ref('');
const selectedSeverity = ref<string>('ALL');
const selectedStatus = ref<string>('ALL');

const incidentItems = computed<IncidentItem[]>(() =>
    incidents.value.map((inc) => ({
        ...inc,
        id: inc.incident_id,
    })),
);

const filteredIncidents = computed(() => {
    return incidentItems.value.filter((inc) => {
        const matchesSearch =
            inc.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            inc.incident_id
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase()) ||
            inc.attacker_ip.includes(searchQuery.value) ||
            inc.target_server
                .toLowerCase()
                .includes(searchQuery.value.toLowerCase());

        const matchesSeverity =
            selectedSeverity.value === 'ALL' ||
            inc.severity === selectedSeverity.value;
        const matchesStatus =
            selectedStatus.value === 'ALL' ||
            inc.status === selectedStatus.value;

        return matchesSearch && matchesSeverity && matchesStatus;
    });
});
</script>

<template>
    <div class="space-y-6">
        <div
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
            <div>
                <h2 class="text-lg font-bold tracking-tight text-foreground">
                    Security Incidents
                </h2>
                <p class="mt-0.5 text-xs text-muted-foreground">
                    Monitor and manage automated threat responses and security
                    alerts.
                </p>
            </div>
        </div>

        <!-- Filters Bar -->
        <div
            class="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm backdrop-blur-xs md:flex-row"
        >
            <div class="relative w-full flex-1">
                <Search
                    class="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground"
                />
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search by title, ID, IP or server..."
                    class="w-full rounded-lg border border-input bg-background py-2 pr-4 pl-9 text-xs text-foreground transition-colors placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none"
                />
            </div>

            <div class="flex w-full items-center gap-3 md:w-auto">
                <select
                    v-model="selectedSeverity"
                    class="rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground transition-colors focus:border-emerald-500 focus:outline-none"
                >
                    <option value="ALL">All Severities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                </select>

                <select
                    v-model="selectedStatus"
                    class="rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground transition-colors focus:border-emerald-500 focus:outline-none"
                >
                    <option value="ALL">All Statuses</option>
                    <option value="NEW">New</option>
                    <option value="ANALYZING">Analyzing</option>
                    <option value="MITIGATING">Mitigating</option>
                    <option value="MITIGATED">Mitigated</option>
                    <option value="RESOLVED">Resolved</option>
                </select>
            </div>
        </div>

        <!-- Incidents Table -->
        <IncidentTable :incidents="filteredIncidents" />
    </div>
</template>
