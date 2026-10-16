<script setup lang="ts">
import { ref } from 'vue';
import AgentThoughtStream from '@/components/soc/AgentThoughtStream.vue';
import IncidentTimeline from '@/components/soc/IncidentTimeline.vue';
import ApprovalDialog from '@/components/soc/ApprovalDialog.vue';
import SeverityBadge from '@/components/soc/SeverityBadge.vue';
import IncidentBadge from '@/components/soc/IncidentBadge.vue';
import { Button } from '@/components/ui/button';
import { Bot, Clock } from '@lucide/vue';

const props = withDefaults(
    defineProps<{
        incidentId?: string;
    }>(),
    {
        incidentId: 'inc-20261016-001',
    },
);

const approvalOpen = ref(false);

const mockTimelineEvents = [
    {
        id: 'evt-1',
        timestamp: '2026-10-16 12:30:00 UTC',
        title: 'Incident Triggered',
        description:
            'Rule RULE-SSH-01 matched 42 failed attempts from 192.168.1.105',
        severity: 'CRITICAL' as const,
        status: 'NEW' as const,
        actor: 'LogEngine',
    },
    {
        id: 'evt-2',
        timestamp: '2026-10-16 12:30:02 UTC',
        title: 'AI SOC Agent Initialized',
        description:
            'Agent started autonomous investigation playbook for auth-srv-01',
        status: 'ANALYZING' as const,
        actor: 'Agent-Claude',
    },
    {
        id: 'evt-3',
        timestamp: '2026-10-16 12:30:05 UTC',
        title: 'Mitigation Approval Requested',
        description:
            'Agent requested authorization to block IP 192.168.1.105 and isolate service port',
        status: 'MITIGATING' as const,
        actor: 'Agent-Claude',
    },
];

function handleApprove() {
    alert('Mitigation action approved and executed successfully.');
}

function handleReject() {
    alert('Mitigation action rejected.');
}
</script>

<template>
    <div class="space-y-6">
        <!-- Incident Header banner -->
        <div
            class="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm backdrop-blur-xs md:flex-row md:items-center md:justify-between"
        >
            <div class="space-y-2">
                <div class="flex items-center gap-3">
                    <span
                        class="font-mono text-sm font-semibold text-muted-foreground"
                        >{{ incidentId }}</span
                    >
                    <SeverityBadge severity="CRITICAL" />
                    <IncidentBadge status="ANALYZING" />
                </div>
                <h1 class="text-xl font-bold tracking-tight text-foreground">
                    SSH Brute Force Attack on Auth Gateway
                </h1>
                <div
                    class="flex items-center gap-4 font-mono text-xs text-muted-foreground"
                >
                    <span
                        >Target:
                        <strong class="text-foreground"
                            >auth-srv-01</strong
                        ></span
                    >
                    <span
                        >Attacker IP:
                        <strong class="text-rose-600 dark:text-rose-400"
                            >192.168.1.105</strong
                        ></span
                    >
                    <span
                        >Rule ID:
                        <strong class="text-foreground"
                            >RULE-SSH-01</strong
                        ></span
                    >
                </div>
            </div>

            <div class="flex items-center gap-3">
                <Button
                    class="bg-amber-600 text-xs font-medium text-white hover:bg-amber-500"
                    @click="approvalOpen = true"
                >
                    Review Approval Action
                </Button>
            </div>
        </div>

        <!-- Two Column Layout: Agent Stream & Timeline -->
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- Left: AI Agent Thought & Tool Stream -->
            <div class="space-y-4">
                <div
                    class="flex items-center gap-2 border-b border-border pb-2"
                >
                    <Bot class="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    <h2
                        class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
                    >
                        AI Agent Execution Stream
                    </h2>
                </div>
                <div class="rounded-xl border border-border bg-card p-4">
                    <AgentThoughtStream :incident-id="incidentId" />
                </div>
            </div>

            <!-- Right: Incident Chronological Timeline -->
            <div class="space-y-4">
                <div
                    class="flex items-center gap-2 border-b border-border pb-2"
                >
                    <Clock
                        class="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                    />
                    <h2
                        class="text-xs font-medium tracking-wider text-muted-foreground uppercase"
                    >
                        Incident Timeline
                    </h2>
                </div>
                <div class="rounded-xl border border-border bg-card p-6">
                    <IncidentTimeline :events="mockTimelineEvents" />
                </div>
            </div>
        </div>

        <!-- Approval Dialog -->
        <ApprovalDialog
            v-model:open="approvalOpen"
            title="Remediation Approval Required"
            description="Agent has verified brute-force origin and requests immediate firewall block."
            actionName="iptables -A INPUT -s 192.168.1.105 -j DROP"
            @approve="handleApprove"
            @reject="handleReject"
        />
    </div>
</template>
