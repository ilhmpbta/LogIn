<script setup lang="ts">
import { computed } from 'vue';
import type { Severity } from '@/types/soc';
import { severityStyle } from '@/lib/soc/severity';

const props = withDefaults(
    defineProps<{
        severity: Severity;
        size?: 'sm' | 'md' | 'lg';
        showIcon?: boolean;
    }>(),
    {
        size: 'md',
        showIcon: true,
    },
);

const style = computed(() => severityStyle(props.severity));
const IconComponent = computed(() => style.value.icon);

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'px-1.5 py-0.5 text-[10px] gap-1';
        case 'lg':
            return 'px-3 py-1 text-sm gap-2';
        case 'md':
        default:
            return 'px-2 py-0.5 text-xs gap-1.5';
    }
});

const iconSize = computed(() => {
    switch (props.size) {
        case 'sm':
            return 12;
        case 'lg':
            return 18;
        case 'md':
        default:
            return 14;
    }
});
</script>

<template>
    <span
        class="inline-flex items-center rounded-full border font-medium shadow-xs transition-colors"
        :class="[style.text, style.bg, style.border, sizeClasses]"
    >
        <component
            :is="IconComponent"
            v-if="showIcon"
            :size="iconSize"
            class="shrink-0"
        />
        <span>{{ style.label }}</span>
    </span>
</template>
