<script setup lang="ts">
import { ref, computed } from 'vue';
import AgentThoughtStream from '@/components/soc/AgentThoughtStream.vue';
import IncidentTimeline from '@/components/soc/IncidentTimeline.vue';
import ApprovalDialog from '@/components/soc/ApprovalDialog.vue';
import SeverityBadge from '@/components/soc/SeverityBadge.vue';
import IncidentBadge from '@/components/soc/IncidentBadge.vue';
import { Button } from '@/components/ui/button';
import { Bot, Clock } from '@lucide/vue';
import { useSocChannel } from '@/composables/useSocChannel';
import { useIncidentStream } from '@/composables/useIncidentStream';

const props = withDefaults(
    defineProps<{
        incidentId?: string;
    }>(),
    {
        incidentId: 'inc-20261016-001',
    },
);

const approvalOpen = ref(false);

const { incidents } = useSocChannel();
const { status: streamStatus } = useIncidentStream(props.incidentId);

const matchedIncident = computed(() =>
    incidents.value.find(
        (inc) =>
            inc.incident_id === props.incidentId
    ),
);

const incidentTitle = computed(
    () =>
        matchedIncident.value?.title ||
        'SSH Brute Force Attack on Auth Gateway',
);
const incidentSeverity = computed(
    () => matchedIncident.value?.severity || 'CRITICAL',
);
const incidentStatus = computed(
    () => streamStatus.value || matchedIncident.value?.status || 'ANALYZING',
);
const targetServer = computed(
    () => matchedIncident.value?.target_server || 'auth-srv-01',
);
const attackerIp = computed(
    () => matchedIncident.value?.attacker_ip || '192.168.1.105',
);
const ruleId = computed(
    () => matchedIncident.value?.triggered_rule_id || 'RULE-SSH-01',
);
const firstSeen = computed(
    () => matchedIncident.value?.first_seen || new Date().toISOString(),
);

const timelineEvents = computed(() => [
    {
        id: 'evt-1',
        timestamp: firstSeen.value.replace('T', ' ').slice(0, 19) + ' UTC',
        title: 'Incident Triggered',
        description: `Rule ${ruleId.value} matched anomalous activity from ${attackerIp.value}`,
        severity: incidentSeverity.value,
        status: 'NEW' as const,
        actor: 'LogEngine',
    },
    {
        id: 'evt-2',
        timestamp:
            new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        title: 'AI SOC Agent Initialized',
        description: `Agent started autonomous investigation playbook for ${targetServer.value}`,
        status: incidentStatus.value,
        actor: 'Agent-Claude',
    },
]);

function handleApprove() {
    alert('Mitigation action approved and executed successfully.');
    approvalOpen.value = false;
}

function handleReject() {
    alert('Mitigation action rejected.');
    approvalOpen.value = false;
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
                    <SeverityBadge :severity="incidentSeverity" />
                    <IncidentBadge :status="incidentStatus" />
                </div>
                <h1 class="text-xl font-bold tracking-tight text-foreground">
                    {{ incidentTitle }}
                </h1>
                <div
                    class="flex items-center gap-4 font-mono text-xs text-muted-foreground"
                >
                    <span
                        >Target:
                        <strong class="text-foreground">{{
                            targetServer
                        }}</strong></span
                    >
                    <span
                        >Attacker IP:
                        <strong class="text-rose-600 dark:text-rose-400">{{
                            attackerIp
                        }}</strong></span
                    >
                    <span
                        >Rule ID:
                        <strong class="text-foreground">{{
                            ruleId
                        }}</strong></span
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
                    <IncidentTimeline :events="timelineEvents" />
                </div>
            </div>
        </div>

        <!-- Approval Dialog -->
        <ApprovalDialog
            v-model:open="approvalOpen"
            title="Remediation Approval Required"
            description="Agent has verified brute-force origin and requests immediate firewall block."
            :actionName="`iptables -A INPUT -s ${attackerIp} -j DROP`"
            @approve="handleApprove"
            @reject="handleReject"
        />
    </div>
</template>
