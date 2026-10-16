<script setup lang="ts">
import { computed } from 'vue';
import { Clock, ShieldAlert } from '@lucide/vue';
import type { IncidentStatus, Severity } from '@/types/soc';
import IncidentBadge from './IncidentBadge.vue';
import SeverityBadge from './SeverityBadge.vue';

export interface TimelineEvent {
    id: string;
    timestamp: string;
    title: string;
    description: string;
    severity?: Severity;
    status?: IncidentStatus;
    actor?: string;
}

const props = defineProps<{
    events: TimelineEvent[];
}>();
</script>

<template>
    <div class="relative space-y-4 border-l border-border pl-6">
        <div
            v-for="(event, index) in events"
            :key="event.id || index"
            class="group relative"
        >
            <!-- Timeline dot -->
            <div
                class="absolute top-1 -left-[31px] flex h-4 w-4 items-center justify-center rounded-full border border-border bg-card transition-colors group-hover:border-emerald-500"
            >
                <div
                    class="h-1.5 w-1.5 rounded-full bg-muted-foreground group-hover:bg-emerald-400"
                />
            </div>

            <div
                class="space-y-2 rounded-xl border border-border bg-card p-4 shadow-sm backdrop-blur-xs"
            >
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-semibold text-foreground">{{
                            event.title
                        }}</span>
                        <SeverityBadge
                            v-if="event.severity"
                            :severity="event.severity"
                            size="sm"
                        />
                        <IncidentBadge
                            v-if="event.status"
                            :status="event.status"
                            size="sm"
                        />
                    </div>
                    <div
                        class="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
                    >
                        <Clock class="h-3 w-3" />
                        <span>{{ event.timestamp }}</span>
                    </div>
                </div>

                <p class="text-xs leading-relaxed text-foreground">
                    {{ event.description }}
                </p>

                <div
                    v-if="event.actor"
                    class="pt-1 font-mono text-[11px] text-muted-foreground"
                >
                    Actor:
                    <span class="text-foreground">{{ event.actor }}</span>
                </div>
            </div>
        </div>
    </div>
</template>
