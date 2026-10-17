<script setup lang="ts">
import { useIncidentStream } from '@/composables/useIncidentStream';
import AgentThoughtStep from './AgentThoughtStep.vue';

const props = defineProps<{ incidentId: string }>();
const { steps, status } = useIncidentStream(props.incidentId);
</script>

<template>
    <div class="space-y-2">
        <AgentThoughtStep
            v-for="(step, i) in steps"
            :key="i"
            :step="step"
            :index="i"
            :is-last="i === steps.length - 1"
        />
        <div
            v-if="status === 'ANALYZING'"
            class="animate-pulse text-emerald-400 motion-reduce:animate-none"
        >
            ● Agent thinking...
        </div>
    </div>
</template>
