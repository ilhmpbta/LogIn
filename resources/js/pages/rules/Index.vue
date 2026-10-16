<script setup lang="ts">
import { ref } from 'vue';
import SeverityBadge from '@/components/soc/SeverityBadge.vue';
import { Plus } from '@lucide/vue';
import { Button } from '@/components/ui/button';

interface DetectionRule {
    id: string;
    rule_id: string;
    name: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    log_type: string;
    threshold: number;
    window_seconds: number;
    is_active: boolean;
}

const mockRules = ref<DetectionRule[]>([
    {
        id: '1',
        rule_id: 'RULE-SSH-01',
        name: 'SSH Brute Force Detection',
        severity: 'CRITICAL',
        log_type: 'auth_log',
        threshold: 5,
        window_seconds: 60,
        is_active: true,
    },
    {
        id: '2',
        rule_id: 'RULE-SQLI-04',
        name: 'SQL Injection Payload Heuristic',
        severity: 'HIGH',
        log_type: 'application_log',
        threshold: 2,
        window_seconds: 30,
        is_active: true,
    },
    {
        id: '3',
        rule_id: 'RULE-SCAN-09',
        name: 'Port Scanning & Reconnaissance',
        severity: 'MEDIUM',
        log_type: 'firewall_log',
        threshold: 50,
        window_seconds: 10,
        is_active: true,
    },
    {
        id: '4',
        rule_id: 'RULE-SYS-12',
        name: 'Privilege Escalation Alert (sudo)',
        severity: 'HIGH',
        log_type: 'system_log',
        threshold: 1,
        window_seconds: 5,
        is_active: false,
    },
]);

function toggleRule(rule: DetectionRule) {
    rule.is_active = !rule.is_active;
}
</script>

<template>
    <div class="space-y-6">
        <div
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
            <div>
                <h2 class="text-lg font-bold tracking-tight text-foreground">
                    Detection Rules
                </h2>
                <p class="mt-0.5 text-xs text-muted-foreground">
                    Configure security rules, thresholds, and automated
                    detection heuristics.
                </p>
            </div>
            <div>
                <Button
                    class="bg-emerald-600 text-xs text-white hover:bg-emerald-500"
                >
                    <Plus class="mr-1.5 h-4 w-4" />
                    Create New Rule
                </Button>
            </div>
        </div>

        <!-- Rules Table -->
        <div
            class="overflow-hidden rounded-xl border border-border bg-card shadow-sm backdrop-blur-xs"
        >
            <table class="w-full border-collapse text-left">
                <thead>
                    <tr
                        class="border-b border-border bg-muted/60 text-[11px] tracking-wider text-muted-foreground uppercase"
                    >
                        <th class="px-4 py-3 font-semibold">Rule ID</th>
                        <th class="px-4 py-3 font-semibold">Rule Name</th>
                        <th class="px-4 py-3 font-semibold">Severity</th>
                        <th class="px-4 py-3 font-semibold">Log Type</th>
                        <th class="px-4 py-3 font-semibold">
                            Threshold / Window
                        </th>
                        <th class="px-4 py-3 font-semibold">Status</th>
                        <th class="px-4 py-3 text-right font-semibold">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border text-xs">
                    <tr
                        v-for="rule in mockRules"
                        :key="rule.id"
                        class="transition-colors hover:bg-muted/50"
                    >
                        <td
                            class="px-4 py-3 font-mono font-semibold text-foreground"
                        >
                            {{ rule.rule_id }}
                        </td>
                        <td class="px-4 py-3 font-medium text-foreground">
                            {{ rule.name }}
                        </td>
                        <td class="px-4 py-3">
                            <SeverityBadge
                                :severity="rule.severity"
                                size="sm"
                            />
                        </td>
                        <td class="px-4 py-3 font-mono text-foreground">
                            {{ rule.log_type }}
                        </td>
                        <td class="px-4 py-3 font-mono text-muted-foreground">
                            {{ rule.threshold }} events /
                            {{ rule.window_seconds }}s
                        </td>
                        <td class="px-4 py-3">
                            <span
                                class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                                :class="{
                                    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300':
                                        rule.is_active,
                                    'border-border bg-muted text-muted-foreground':
                                        !rule.is_active,
                                }"
                            >
                                <span
                                    class="h-1.5 w-1.5 rounded-full"
                                    :class="
                                        rule.is_active
                                            ? 'bg-emerald-400'
                                            : 'bg-neutral-500'
                                    "
                                />
                                {{ rule.is_active ? 'Active' : 'Disabled' }}
                            </span>
                        </td>
                        <td class="px-4 py-3 text-right">
                            <button
                                class="rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground transition-colors hover:bg-muted"
                                @click="toggleRule(rule)"
                            >
                                {{ rule.is_active ? 'Disable' : 'Enable' }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
