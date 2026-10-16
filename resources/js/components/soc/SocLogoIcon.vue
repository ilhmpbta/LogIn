<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { Shield } from '@lucide/vue';
import { home } from '@/routes';

defineProps<{ title?: string; description?: string }>();
</script>

<template>
    <div
        class="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10"
    >
        <div class="w-full max-w-sm">
            <div class="flex flex-col gap-8">
                <div class="flex flex-col items-center gap-4">
                    <Link
                        :href="home()"
                        class="flex flex-col items-center gap-2 font-medium"
                    >
                        <div
                            class="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 shadow-sm dark:text-emerald-400"
                        >
                            <Shield class="h-7 w-7" />
                        </div>
                        <!-- <span
                            class="text-lg font-bold tracking-tight text-foreground"
                            >LogIn</span
                        > -->
                        <!-- <span
                            class="font-mono text-[10px] tracking-wider text-emerald-600 uppercase dark:text-emerald-400"
                            >Agentic AI SIEM</span
                        > -->
                    </Link>
                    <div class="space-y-2 text-center">
                        <h1 class="text-xl font-medium">{{ title }}</h1>
                        <p class="text-center text-sm text-muted-foreground">
                            {{ description }}
                        </p>
                    </div>
                </div>
                <slot />
            </div>
        </div>
    </div>
</template>
