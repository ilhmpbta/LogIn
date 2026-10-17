<script setup lang="ts">
import type { LucideIcon } from '@lucide/vue';
import { computed } from 'vue';
import { Skeleton } from '@/components/ui/skeleton';

const props = withDefaults(
    defineProps<{
        title: string;
        value: string | number;
        change?: string | number;
        trend?: 'up' | 'down' | 'neutral';
        icon?: LucideIcon;
        description?: string;
        variant?: 'default' | 'danger' | 'warning' | 'success';
        loading?: boolean;
    }>(),
    {
        trend: 'neutral',
        variant: 'default',
        loading: false,
    },
);

const variantClasses = computed(() => {
    switch (props.variant) {
        case 'danger':
            return 'border-rose-500/30 bg-rose-500/5 text-rose-700 dark:text-rose-300';
        case 'warning':
            return 'border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300';
        case 'success':
            return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300';
        case 'default':
        default:
            return 'border-border bg-card text-card-foreground';
    }
});
</script>

<template>
    <div
        class="flex flex-col justify-between rounded-xl border p-4 shadow-sm backdrop-blur-xs transition-all hover:border-muted-foreground/30"
        :class="variantClasses"
    >
        <div
            class="mb-2 flex items-center justify-between text-muted-foreground"
        >
            <span class="text-xs font-medium tracking-wider uppercase">{{
                title
            }}</span>
            <component :is="icon" v-if="icon" class="h-4 w-4 opacity-75" />
        </div>
        <div class="flex items-baseline justify-between">
            <Skeleton v-if="loading" class="h-7 w-20" />
            <div
                v-else
                class="text-2xl font-bold tracking-tight text-foreground"
            >
                {{ value }}
            </div>
            <div
                v-if="!loading && change !== undefined"
                class="flex items-center text-xs font-semibold"
                :class="{
                    'text-emerald-600 dark:text-emerald-400':
                        trend === 'up' && variant !== 'danger',
                    'text-rose-600 dark:text-rose-400':
                        trend === 'down' || variant === 'danger',
                    'text-muted-foreground': trend === 'neutral',
                }"
            >
                <span>{{ change }}</span>
            </div>
        </div>
        <div v-if="description" class="mt-1 text-[11px] text-muted-foreground">
            {{ description }}
        </div>
    </div>
</template>
