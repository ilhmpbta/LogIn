<script setup lang="ts">
import { Sun, Moon, Monitor, Search, Menu as MenuIcon } from '@lucide/vue';
import { computed, ref } from 'vue';
import { useAppearance } from '@/composables/useAppearance';
import { demoMode } from '@/composables/useDemoMode';
import { useIncidentAlerts } from '@/composables/useIncidentAlerts';
import { isCollapsed } from '@/composables/useSidebarCollapse';
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts';
import CommandPalette from '@/components/soc/CommandPalette.vue';
import SocSidebarContent from '@/components/soc/SocSidebarContent.vue';
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';

// Call useIncidentAlerts once at setup scope
useIncidentAlerts();
const { paletteOpen } = useKeyboardShortcuts();

const { appearance, updateAppearance } = useAppearance();

const mobileMenuOpen = ref(false);
</script>

<template>
    <div
        class="flex h-screen bg-background font-sans text-foreground antialiased transition-colors"
    >
        <a
            href="#main-content"
            class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
            >Skip to content</a
        >

        <CommandPalette v-model:open="paletteOpen" />

        <Sheet v-model:open="mobileMenuOpen">
            <SheetContent
                side="left"
                class="flex w-64 flex-col justify-between gap-0 border-r border-border bg-card p-0 sm:max-w-xs"
            >
                <SheetTitle class="sr-only">Navigation</SheetTitle>
                <SheetDescription class="sr-only"
                    >Main navigation menu</SheetDescription
                >
                <SocSidebarContent
                    :collapsed="false"
                    :show-collapse-toggle="false"
                    @navigate="mobileMenuOpen = false"
                />
            </SheetContent>
        </Sheet>

        <!-- Sidebar -->
        <aside
            class="hidden shrink-0 flex-col justify-between border-r border-border bg-card/80 backdrop-blur-md transition-all duration-300 md:flex"
            :class="isCollapsed ? 'w-20' : 'w-64'"
        >
            <SocSidebarContent :collapsed="isCollapsed" />
        </aside>

        <!-- Main Content Shell -->
        <div class="flex min-w-0 flex-1 flex-col">
            <!-- Header -->
            <header
                class="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/60 px-6 backdrop-blur-md"
            >
                <div class="flex items-center gap-4">
                    <button
                        class="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
                        type="button"
                        aria-label="Open navigation menu"
                        :aria-expanded="mobileMenuOpen"
                        @click="mobileMenuOpen = true"
                    >
                        <MenuIcon class="h-5 w-5" />
                    </button>
                    <h1
                        class="text-sm font-semibold tracking-wide text-foreground"
                    >
                        Security Operations Center
                    </h1>
                </div>
                <div class="flex items-center gap-3">
                    <!-- DEMO Mode Badge -->
                    <div
                        v-if="demoMode"
                        class="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400"
                    >
                        <div
                            class="h-2 w-2 animate-pulse rounded-full bg-amber-500 motion-reduce:animate-none"
                        />
                        <span class="font-mono">DEMO</span>
                    </div>

                    <!-- Threat Level Indicator -->
                    <div
                        class="hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground sm:flex"
                    >
                        <div class="h-2 w-2 rounded-full bg-emerald-500" />
                        <span class="font-mono"
                            >Threat Level:
                            <strong
                                class="text-emerald-600 dark:text-emerald-400"
                                >NORMAL</strong
                            ></span
                        >
                    </div>

                    <!-- Theme Toggle Buttons -->
                    <div
                        class="flex items-center rounded-lg border border-border bg-background p-0.5"
                    >
                        <button
                            class="rounded-md p-1.5 transition-colors"
                            :class="
                                appearance === 'light'
                                    ? 'bg-muted font-bold text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            "
                            title="Light Mode"
                            aria-label="Switch to light theme"
                            @click="updateAppearance('light')"
                        >
                            <Sun class="h-3.5 w-3.5" />
                        </button>
                        <button
                            class="rounded-md p-1.5 transition-colors"
                            :class="
                                appearance === 'dark'
                                    ? 'bg-muted font-bold text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            "
                            title="Dark Mode"
                            aria-label="Switch to dark theme"
                            @click="updateAppearance('dark')"
                        >
                            <Moon class="h-3.5 w-3.5" />
                        </button>
                        <button
                            class="rounded-md p-1.5 transition-colors"
                            :class="
                                appearance === 'system'
                                    ? 'bg-muted font-bold text-foreground'
                                    : 'text-muted-foreground hover:text-foreground'
                            "
                            title="System Appearance"
                            aria-label="Switch to system theme"
                            @click="updateAppearance('system')"
                        >
                            <Monitor class="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </header>

            <!-- Page Content View -->
            <main
                id="main-content"
                tabindex="-1"
                class="flex-1 overflow-y-auto bg-background p-6 focus:outline-none"
            >
                <slot />
            </main>
        </div>
    </div>
</template>
