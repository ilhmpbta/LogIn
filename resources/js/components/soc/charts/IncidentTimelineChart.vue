<script setup lang="ts">
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { useAppearance } from '@/composables/useAppearance';

const props = withDefaults(
    defineProps<{
        data?: { time: string; count: number }[];
    }>(),
    {
        data: () => [
            { time: '00:00', count: 2 },
            { time: '02:00', count: 1 },
            { time: '04:00', count: 0 },
            { time: '06:00', count: 3 },
            { time: '08:00', count: 7 },
            { time: '10:00', count: 12 },
            { time: '12:00', count: 9 },
            { time: '14:00', count: 15 },
            { time: '16:00', count: 8 },
            { time: '18:00', count: 4 },
            { time: '20:00', count: 3 },
            { time: '22:00', count: 2 },
        ],
    },
);

const { resolvedAppearance } = useAppearance();
const isDark = computed(() => resolvedAppearance.value === 'dark');

const series = computed(() => [
    {
        name: 'Incidents',
        data: props.data.map((d) => d.count),
    },
]);

const chartOptions = computed(
    () =>
        ({
            chart: {
                type: 'bar',
                background: 'transparent',
                toolbar: { show: false },
            },
            plotOptions: {
                bar: {
                    borderRadius: 4,
                    columnWidth: '60%',
                },
            },
            dataLabels: { enabled: false },
            colors: ['#f43f5e'],
            xaxis: {
                categories: props.data.map((d) => d.time),
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
                >Incidents per Hour</span
            >
        </div>
        <div class="h-64 w-full">
            <VueApexCharts
                type="bar"
                height="240"
                :options="chartOptions"
                :series="series"
            />
        </div>
    </div>
</template>
