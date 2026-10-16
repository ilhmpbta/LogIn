<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import {
    Shield,
    Terminal,
    Zap,
    Cpu,
    ArrowRight,
    Lock,
    CheckCircle2,
    Activity,
} from '@lucide/vue';

defineProps<{
    canLogin?: boolean;
    canRegister?: boolean;
    auth?: { user?: any };
}>();
</script>

<template>
    <Head title="Welcome - Autonomous SOC Analyst" />

    <div
        class="flex min-h-screen flex-col bg-background font-sans text-foreground selection:bg-emerald-500/20 selection:text-emerald-500"
    >
        <!-- Header -->
        <header
            class="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-border bg-card/50 px-8 backdrop-blur-md"
        >
            <div class="flex items-center gap-3">
                <div
                    class="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 shadow-sm dark:text-emerald-400"
                >
                    <Shield class="h-6 w-6" />
                </div>
                <div>
                    <span class="block text-lg font-bold tracking-tight"
                        >LogIn SOC</span
                    >
                    <span
                        class="block font-mono text-[10px] tracking-wider text-emerald-600 uppercase dark:text-emerald-400"
                        >Agentic AI SIEM</span
                    >
                </div>
            </div>

            <nav class="flex items-center gap-4">
                <template v-if="auth?.user">
                    <Link
                        href="/dashboard"
                        class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-500"
                    >
                        <span>Go to Dashboard</span>
                        <ArrowRight class="h-4 w-4" />
                    </Link>
                </template>
                <template v-else>
                    <Link
                        href="/login"
                        class="rounded-xl px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Log In
                    </Link>
                    <Link
                        href="/register"
                        class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-emerald-500"
                    >
                        <span>Get Started</span>
                        <ArrowRight class="h-4 w-4" />
                    </Link>
                </template>
            </nav>
        </header>

        <!-- Main Content -->
        <main
            class="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center space-y-24 px-6 py-16"
        >
            <!-- Hero Section -->
            <div class="max-w-3xl space-y-6 text-center">
                <div
                    class="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-medium text-emerald-600 dark:text-emerald-400"
                >
                    <span
                        class="h-2 w-2 animate-pulse rounded-full bg-emerald-500"
                    />
                    Autonomous Threat Intelligence & Response
                </div>
                <h1
                    class="text-4xl leading-tight font-extrabold tracking-tight sm:text-6xl"
                >
                    Autonomous SOC Analyst powered by
                    <span class="text-emerald-600 dark:text-emerald-400"
                        >Agentic AI</span
                    >.
                </h1>
                <p
                    class="text-base leading-relaxed text-muted-foreground sm:text-lg"
                >
                    LogIn ingests, correlates, and autonomously mitigates
                    infrastructure threats in real-time using deterministic rule
                    engines and ReAct AI agents.
                </p>
                <div class="flex items-center justify-center gap-4 pt-4">
                    <Link
                        v-if="auth?.user"
                        href="/dashboard"
                        class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-emerald-500"
                    >
                        <span>Open SOC Command Center</span>
                        <ArrowRight class="h-4 w-4" />
                    </Link>
                    <Link
                        v-else
                        href="/login"
                        class="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-emerald-500"
                    >
                        <span>Access SOC Command Center</span>
                        <ArrowRight class="h-4 w-4" />
                    </Link>
                    <a
                        href="https://github.com/ilhmpbta/LogIn"
                        target="_blank"
                        rel="noreferrer"
                        class="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted"
                    >
                        View on GitHub
                    </a>
                </div>
            </div>

            <!-- Feature Grid -->
            <div
                class="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
            >
                <div
                    class="flex flex-col justify-between space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                    <div
                        class="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    >
                        <Activity class="h-5 w-5" />
                    </div>
                    <div class="space-y-1">
                        <h3 class="text-base font-bold text-foreground">
                            Real-time Ingestion
                        </h3>
                        <p
                            class="text-xs leading-relaxed text-muted-foreground"
                        >
                            High-throughput normalized log streaming and
                            virtualized terminal viewing via Laravel Reverb
                            WebSockets.
                        </p>
                    </div>
                </div>

                <div
                    class="flex flex-col justify-between space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                    <div
                        class="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    >
                        <Shield class="h-5 w-5" />
                    </div>
                    <div class="space-y-1">
                        <h3 class="text-base font-bold text-foreground">
                            Deterministic Rules
                        </h3>
                        <p
                            class="text-xs leading-relaxed text-muted-foreground"
                        >
                            Instant threshold-based and heuristic rule
                            correlation to flag brute-force, SQLi, and port
                            scans.
                        </p>
                    </div>
                </div>

                <div
                    class="flex flex-col justify-between space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                    <div
                        class="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/15 text-violet-600 dark:text-violet-400"
                    >
                        <Cpu class="h-5 w-5" />
                    </div>
                    <div class="space-y-1">
                        <h3 class="text-base font-bold text-foreground">
                            ReAct AI Agents
                        </h3>
                        <p
                            class="text-xs leading-relaxed text-muted-foreground"
                        >
                            Autonomous reasoning loops inspecting server state,
                            querying tools, and proposing verified remediation
                            playbooks.
                        </p>
                    </div>
                </div>

                <div
                    class="flex flex-col justify-between space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                    <div
                        class="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    >
                        <Zap class="h-5 w-5" />
                    </div>
                    <div class="space-y-1">
                        <h3 class="text-base font-bold text-foreground">
                            Autonomous Mitigation
                        </h3>
                        <p
                            class="text-xs leading-relaxed text-muted-foreground"
                        >
                            One-click or fully automated firewall blocking
                            (`iptables`), IP isolation, and service safeguards.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Architecture / Data Flow Diagram Block -->
            <div
                class="w-full space-y-6 rounded-2xl border border-border bg-card p-8 shadow-sm"
            >
                <div class="space-y-2 text-center">
                    <h2
                        class="font-mono text-sm font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400"
                    >
                        Architecture & Data Flow
                    </h2>
                    <p class="text-xl font-bold text-foreground">
                        How LogIn Processes Threats in Milliseconds
                    </p>
                </div>
                <div class="grid grid-cols-1 gap-4 pt-4 md:grid-cols-5">
                    <div
                        class="space-y-2 rounded-xl border border-border bg-background p-4 text-center"
                    >
                        <div
                            class="font-mono text-xs font-bold text-muted-foreground"
                        >
                            01
                        </div>
                        <div class="text-sm font-semibold">Server Logs</div>
                        <p class="text-[11px] text-muted-foreground">
                            Syslog, Auth, Nginx & DB streams
                        </p>
                    </div>
                    <div
                        class="space-y-2 rounded-xl border border-border bg-background p-4 text-center"
                    >
                        <div
                            class="font-mono text-xs font-bold text-muted-foreground"
                        >
                            02
                        </div>
                        <div class="text-sm font-semibold">
                            Normalization Pipeline
                        </div>
                        <p class="text-[11px] text-muted-foreground">
                            Parsed into structured DTOs
                        </p>
                    </div>
                    <div
                        class="space-y-2 rounded-xl border border-border bg-background p-4 text-center"
                    >
                        <div
                            class="font-mono text-xs font-bold text-muted-foreground"
                        >
                            03
                        </div>
                        <div class="text-sm font-semibold">Rule Engine</div>
                        <p class="text-[11px] text-muted-foreground">
                            Deterministic anomaly triggers
                        </p>
                    </div>
                    <div
                        class="space-y-2 rounded-xl border border-border bg-background p-4 text-center"
                    >
                        <div
                            class="font-mono text-xs font-bold text-muted-foreground"
                        >
                            04
                        </div>
                        <div class="text-sm font-semibold">AI ReAct Agent</div>
                        <p class="text-[11px] text-muted-foreground">
                            Autonomous tool execution
                        </p>
                    </div>
                    <div
                        class="space-y-2 rounded-xl border border-border bg-background p-4 text-center"
                    >
                        <div
                            class="font-mono text-xs font-bold text-muted-foreground"
                        >
                            05
                        </div>
                        <div class="text-sm font-semibold">
                            Reverb Dashboard
                        </div>
                        <p class="text-[11px] text-muted-foreground">
                            Real-time operator command
                        </p>
                    </div>
                </div>
            </div>
        </main>

        <!-- Footer -->
        <footer
            class="flex h-16 items-center justify-between border-t border-border bg-card/50 px-8 text-xs text-muted-foreground backdrop-blur-md"
        >
            <div>&copy; 2026 LogIn SOC. All rights reserved.</div>
            <div class="flex items-center gap-4">
                <span class="font-mono text-[11px]"
                    >System Status: Operational</span
                >
            </div>
        </footer>
    </div>
</template>
