<script setup lang="ts">
import { computed } from 'vue';
import type { IncidentStatus } from '@/types/soc';
import { statusStyle } from '@/lib/soc/severity';

const props = withDefaults(
    defineProps<{
        status: IncidentStatus;
        size?: 'sm' | 'md' | 'lg';
    }>(),
    {
        size: 'md',
    },
);

const style = computed(() => statusStyle(props.status));

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'px-1.5 py-0.5 text-[10px]';
        case 'lg':
            return 'px-3 py-1 text-sm';
        case 'md':
        default:
            return 'px-2 py-0.5 text-xs';
    }
});
</script>

<template>
    <span
        class="inline-flex items-center gap-1.5 rounded-full border font-medium shadow-xs transition-colors"
        :class="[style.text, style.bg, style.border, sizeClasses]"
    >
        <span v-if="style.pulse" class="relative flex h-2 w-2">
            <span
                class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                :class="style.text.replace('text-', 'bg-')"
            />
            <span
                class="relative inline-flex h-2 w-2 rounded-full"
                :class="style.text.replace('text-', 'bg-')"
            />
        </span>
        <span>{{ style.label }}</span>
    </span>
</template>
