<script setup lang="ts">
import { computed } from 'vue';
import VueApexCharts from 'vue3-apexcharts';
import { ShieldCheck } from '@lucide/vue';
import { SEVERITY_STYLES } from '@/lib/soc/severity';
import type { Severity } from '@/types/soc';
import { useAppearance } from '@/composables/useAppearance';

const props = defineProps<{
    data: Record<Severity, number>;
}>();

const { resolvedAppearance } = useAppearance();
const isDark = computed(() => resolvedAppearance.value === 'dark');

const total = computed(
    () =>
        (props.data.CRITICAL || 0) +
        (props.data.HIGH || 0) +
        (props.data.MEDIUM || 0) +
        (props.data.LOW || 0),
);

const series = computed(() => [
    props.data.CRITICAL || 0,
    props.data.HIGH || 0,
    props.data.MEDIUM || 0,
    props.data.LOW || 0,
]);

const chartOptions = computed(
    () =>
        ({
            chart: {
                type: 'donut',
                background: 'transparent',
            },
            labels: ['Critical', 'High', 'Medium', 'Low'],
            colors: [
                SEVERITY_STYLES.CRITICAL.hex,
                SEVERITY_STYLES.HIGH.hex,
                SEVERITY_STYLES.MEDIUM.hex,
                SEVERITY_STYLES.LOW.hex,
            ],
            stroke: {
                show: true,
                colors: [isDark.value ? '#171717' : '#ffffff'],
                width: 2,
            },
            dataLabels: {
                enabled: false,
            },
            legend: {
                position: 'bottom',
                labels: {
                    colors: isDark.value ? '#a3a3a3' : '#525252',
                },
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '70%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                label: 'Total',
                                color: isDark.value ? '#a3a3a3' : '#525252',
                                formatter: (w: any) => {
                                    return w.globals.seriesTotals.reduce(
                                        (a: number, b: number) => a + b,
                                        0,
                                    );
                                },
                            },
                        },
                    },
                },
            },
            theme: {
                mode: isDark.value ? 'dark' : 'light',
            },
        }) as any,
);
</script>

<template>
    <div
        class="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-4 shadow-sm backdrop-blur-xs"
    >
        <div class="mb-2 flex w-full items-center justify-between">
            <span
                class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
                >Severity Distribution</span
            >
        </div>
        <div class="flex h-64 w-full items-center justify-center">
            <div v-if="total === 0" class="text-center">
                <div
                    class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted"
                >
                    <ShieldCheck class="h-6 w-6 text-muted-foreground" />
                </div>
                <p class="text-sm font-medium text-foreground">
                    No incidents detected
                </p>
                <p class="mt-1 text-xs text-muted-foreground">
                    Severity distribution will appear as threats are identified
                </p>
            </div>
            <VueApexCharts
                v-else
                type="donut"
                height="240"
                :options="chartOptions"
                :series="series"
            />
        </div>
    </div>
</template>
