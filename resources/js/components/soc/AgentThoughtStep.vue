<script setup lang="ts">
import { computed } from 'vue';
import { Bot, Wrench } from '@lucide/vue';
import type { AgentStep } from '@/composables/useIncidentStream';
import type { AgentExecutionUpdatedData } from '@/types/soc';

const props = defineProps<{
    step: AgentStep | AgentExecutionUpdatedData;
    index: number;
    isLast: boolean;
}>();

const toolCalled = computed(() => {
    return 'toolCalled' in props.step
        ? props.step.toolCalled
        : props.step.tool_called;
});

const toolParameters = computed(() => {
    return 'toolParameters' in props.step
        ? props.step.toolParameters
        : props.step.tool_parameters;
});

const toolResult = computed(() => {
    return 'toolResult' in props.step
        ? props.step.toolResult
        : props.step.tool_result;
});

const currentStatus = computed(() => {
    return 'status' in props.step
        ? props.step.status
        : props.step.current_status;
});

const hasTool = computed(() => !!toolCalled.value);
</script>

<template>
    <div
        class="relative border-l border-border pb-6 pl-6 last:border-l-0 last:pb-0"
    >
        <!-- Timeline Node Bullet -->
        <div
            class="absolute top-0 -left-3 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm"
        >
            <Bot v-if="!hasTool" class="h-3.5 w-3.5 text-violet-400" />
            <Wrench v-else class="h-3.5 w-3.5 text-amber-400" />
        </div>

        <div
            class="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm backdrop-blur-xs"
        >
            <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2">
                    <span class="font-mono font-semibold text-muted-foreground"
                        >Step #{{ step.step }}</span
                    >
                    <span
                        class="rounded-full border px-2 py-0.5 text-[10px] font-medium"
                        :class="{
                            'border-violet-500/30 bg-violet-500/15 text-violet-300':
                                !hasTool,
                            'border-amber-500/30 bg-amber-500/15 text-amber-300':
                                hasTool,
                        }"
                    >
                        {{ hasTool ? 'Tool Execution' : 'Reasoning' }}
                    </span>
                </div>
                <span class="font-mono text-[11px] text-muted-foreground">{{
                    currentStatus
                }}</span>
            </div>

            <!-- Thought Content -->
            <div class="font-sans text-sm leading-relaxed text-foreground">
                {{ step.thought }}
            </div>

            <!-- Tool Call Details -->
            <div
                v-if="hasTool"
                class="space-y-2 rounded-lg border border-neutral-800 bg-neutral-950/80 p-3 font-mono text-xs"
            >
                <div
                    class="flex items-center gap-1.5 font-semibold text-amber-400"
                >
                    <Wrench class="h-3.5 w-3.5" />
                    <span>{{ toolCalled }}</span>
                </div>

                <div v-if="toolParameters" class="text-[11px] text-neutral-400">
                    <span
                        class="mb-1 block tracking-wider text-neutral-500 uppercase"
                        >Parameters:</span
                    >
                    <pre
                        class="overflow-x-auto rounded border border-neutral-800 bg-neutral-900 p-2 text-neutral-300"
                        >{{ JSON.stringify(toolParameters, null, 2) }}</pre>
                </div>

                <div
                    v-if="toolResult !== null"
                    class="text-[11px] text-neutral-300"
                >
                    <span
                        class="mb-1 block tracking-wider text-neutral-500 uppercase"
                        >Result:</span
                    >
                    <pre
                        class="overflow-x-auto rounded border border-neutral-800 bg-neutral-900 p-2 text-emerald-300"
                        >{{ toolResult }}</pre>
                </div>
            </div>
        </div>
    </div>
</template>
