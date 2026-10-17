<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual';
import { Terminal } from '@lucide/vue';
import { computed, nextTick, ref, watch } from 'vue';
import type { NormalizedLog } from '@/types/soc';
import TerminalLine from './TerminalLine.vue';

const props = defineProps<{ logs: NormalizedLog[]; paused?: boolean }>();
const parentRef = ref<HTMLElement | null>(null);

const virtualizer = useVirtualizer(
    computed(() => ({
        count: props.logs.length,
        getScrollElement: () => parentRef.value,
        estimateSize: () => 20,
        overscan: 10,
    })),
);

watch(
    () => props.logs.length,
    async () => {
        if (props.paused) return;
        await nextTick();
        const el = parentRef.value;
        if (el) el.scrollTop = el.scrollHeight;
    },
);
</script>

<template>
    <div
        ref="parentRef"
        class="h-full overflow-auto bg-soc-terminal-bg font-mono text-xs text-soc-terminal-fg"
    >
        <div
            v-if="props.logs.length === 0"
            class="flex h-full items-center justify-center"
        >
            <div class="text-center">
                <div
                    class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5"
                >
                    <Terminal class="h-6 w-6 text-soc-terminal-fg-muted" />
                </div>
                <p class="text-sm font-medium text-soc-terminal-fg">
                    Waiting for log stream
                </p>
                <p class="mt-1 text-xs text-soc-terminal-fg-muted">
                    Logs will appear here as they are ingested
                </p>
            </div>
        </div>
        <div
            v-else
            :style="{
                height: `${virtualizer.getTotalSize()}px`,
                position: 'relative',
            }"
        >
            <div
                v-for="item in virtualizer.getVirtualItems()"
                :key="String(item.key)"
                :style="{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${item.start}px)`,
                }"
            >
                <TerminalLine :log="props.logs[item.index]" />
            </div>
        </div>
    </div>
</template>
