<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useThrottleFn } from '@vueuse/core';
import VueApexCharts from 'vue3-apexcharts';
import { Activity } from '@lucide/vue';
import type { NormalizedLog } from '@/types/soc';
import { useAppearance } from '@/composables/useAppearance';

const props = defineProps<{
    logs: NormalizedLog[];
}>();

const throttledLogs = ref<NormalizedLog[]>(props.logs);

const updateThrottledLogs = useThrottleFn((next: NormalizedLog[]) => {
    throttledLogs.value = next;
}, 500);

watch(
    () => props.logs,
    (next) => updateThrottledLogs(next),
    { deep: false },
);

const { resolvedAppearance } = useAppearance();
const isDark = computed(() => resolvedAppearance.value === 'dark');

const chartData = computed(() => {
    const counts: Record<string, number> = {};
    for (const log of throttledLogs.value) {
        if (!log.timestamp) continue;
        const timeKey = log.timestamp.slice(0, 19);
        counts[timeKey] = (counts[timeKey] || 0) + 1;
    }

    const sortedKeys = Object.keys(counts).sort().slice(-30);
    const data = sortedKeys.map((k) => counts[k]);
    const categories = sortedKeys.map((k) => k.split('T')[1] || k);

    return {
        categories,
        seriesData: data,
    };
});

const series = computed(() => [
    {
        name: 'Logs/sec',
        data: chartData.value.seriesData,
    },
]);

const chartOptions = computed(
    () =>
        ({
            chart: {
                type: 'area',
                background: 'transparent',
                toolbar: { show: false },
                animations: { enabled: false },
            },
            dataLabels: { enabled: false },
            stroke: { curve: 'smooth', width: 2, colors: ['#34d399'] },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.4,
                    opacityTo: 0.05,
                    stops: [0, 100],
                },
            },
            colors: ['#34d399'],
            xaxis: {
                categories: chartData.value.categories,
                labels: {
                    style: {
                        colors: isDark.value ? '#737373' : '#525252',
                        fontSize: '10px',
                    },
                },
                axisBorder: { show: false },
                axisTicks: { show: false },
            },
            yaxis: {
                labels: {
                    style: {
                        colors: isDark.value ? '#737373' : '#525252',
                        fontSize: '10px',
                    },
                },
            },
            grid: {
                borderColor: isDark.value ? '#262626' : '#e5e7eb',
                strokeDashArray: 4,
            },
            theme: { mode: isDark.value ? 'dark' : 'light' },
        }) as any,
);
</script>

<template>
    <div
        class="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm backdrop-blur-xs"
    >
        <div class="mb-2 flex w-full items-center justify-between">
            <span
                class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
                >Log Ingestion Rate</span
            >
            <span
                class="font-mono text-xs text-emerald-600 dark:text-emerald-400"
                >Live</span
            >
        </div>
        <div class="flex h-64 w-full items-center justify-center">
            <div v-if="props.logs.length === 0" class="text-center">
                <div
                    class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted"
                >
                    <Activity class="h-6 w-6 text-muted-foreground" />
                </div>
                <p class="text-sm font-medium text-foreground">
                    Waiting for log data
                </p>
                <p class="mt-1 text-xs text-muted-foreground">
                    Ingestion metrics will populate as logs flow in
                </p>
            </div>
            <VueApexCharts
                v-else
                type="area"
                height="240"
                :options="chartOptions"
                :series="series"
            />
        </div>
    </div>
</template>
