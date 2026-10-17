<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3';
import {
    LayoutDashboard,
    ShieldAlert,
    Terminal,
    Sliders,
    Shield,
    Sun,
    Moon,
    Monitor,
    ChevronLeft,
    ChevronRight,
    User,
    Settings,
    LogOut,
    ShieldCheck,
    Radio,
    Volume2,
    VolumeX,
} from '@lucide/vue';
import { computed, ref, onMounted } from 'vue';
import { useAppearance } from '@/composables/useAppearance';
import { demoMode, toggleDemoMode } from '@/composables/useDemoMode';
import { useTypedPage } from '@/composables/useTypedPage';
import { useIncidentAlerts } from '@/composables/useIncidentAlerts';
import { useAlertSound } from '@/composables/useAlertSound';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { edit as editProfile } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { edit as editAppearance } from '@/routes/appearance';
import { logout } from '@/routes';

// Call useIncidentAlerts once at setup scope
useIncidentAlerts();

const { isMuted, toggleMute } = useAlertSound();

const page = useTypedPage();
const currentUrl = computed(() => page.url);
const authUser = computed(() => page.props.auth.user);

const { appearance, updateAppearance } = useAppearance();

const isCollapsed = ref(false);

onMounted(() => {
    const stored = localStorage.getItem('soc-sidebar-collapsed');
    if (stored !== null) {
        isCollapsed.value = stored === 'true';
    }
});

function toggleSidebar() {
    isCollapsed.value = !isCollapsed.value;
    localStorage.setItem('soc-sidebar-collapsed', String(isCollapsed.value));
}

const navItems = [
    { label: 'SOC Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Incidents', href: '/incidents', icon: ShieldAlert },
    { label: 'Live Logs', href: '/logs', icon: Terminal },
    { label: 'Detection Rules', href: '/rules', icon: Sliders },
];

function handleLogout() {
    router.post(logout());
}
</script>

<template>
    <div
        class="flex h-screen bg-background font-sans text-foreground antialiased transition-colors"
    >
        <!-- Sidebar -->
        <aside
            class="flex shrink-0 flex-col justify-between border-r border-border bg-card/80 backdrop-blur-md transition-all duration-300"
            :class="isCollapsed ? 'w-20' : 'w-64'"
        >
            <div>
                <!-- Brand / Logo -->
                <div
                    class="flex h-16 items-center border-b border-border transition-all"
                    :class="
                        isCollapsed
                            ? 'justify-center px-3'
                            : 'justify-between px-5'
                    "
                >
                    <div class="flex items-center gap-3 overflow-hidden">
                        <div
                            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 shadow-xs dark:text-emerald-400"
                        >
                            <Shield class="h-5 w-5" />
                        </div>
                        <div v-if="!isCollapsed" class="truncate">
                            <span
                                class="block text-base font-bold tracking-tight"
                                >LogIn SOC</span
                            >
                            <span
                                class="block font-mono text-[10px] tracking-wider text-emerald-600 uppercase dark:text-emerald-400"
                                >AGENTIC AI SIEM</span
                            >
                        </div>
                    </div>
                    <button
                        v-if="!isCollapsed"
                        class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Collapse Sidebar"
                        @click="toggleSidebar"
                    >
                        <ChevronLeft class="h-4 w-4" />
                    </button>
                </div>

                <!-- Collapse Toggle when collapsed -->
                <div
                    v-if="isCollapsed"
                    class="flex justify-center border-b border-border/50 py-2"
                >
                    <button
                        class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Expand Sidebar"
                        @click="toggleSidebar"
                    >
                        <ChevronRight class="h-4 w-4" />
                    </button>
                </div>

                <!-- Navigation Links -->
                <nav class="space-y-1 p-3">
                    <Link
                        v-for="item in navItems"
                        :key="item.href"
                        :href="item.href"
                        class="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors"
                        :class="[
                            currentUrl === item.href ||
                            (item.href !== '/dashboard' &&
                                currentUrl.startsWith(item.href))
                                ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 shadow-xs dark:text-emerald-300'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        ]"
                        :title="isCollapsed ? item.label : undefined"
                    >
                        <component
                            :is="item.icon"
                            class="h-4 w-4 shrink-0 transition-colors"
                        />
                        <span v-if="!isCollapsed" class="truncate">{{
                            item.label
                        }}</span>
                    </Link>
                </nav>
            </div>

            <!-- Footer / System status & User Profile -->
            <div class="space-y-3 border-t border-border p-3">
                <div
                    v-if="!isCollapsed"
                    class="flex items-center justify-between px-2 text-xs text-muted-foreground"
                >
                    <span class="flex items-center gap-1.5 font-mono">
                        <span
                            class="h-2 w-2 animate-pulse rounded-full"
                            :class="
                                demoMode ? 'bg-amber-500' : 'bg-emerald-500'
                            "
                        />
                        {{ demoMode ? 'Demo Sim' : 'Reverb WS' }}
                    </span>
                    <span
                        class="rounded border px-1.5 py-0.5 font-mono text-[10px]"
                        :class="
                            demoMode
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        "
                        >{{ demoMode ? 'SIMULATING' : 'CONNECTED' }}</span
                    >
                </div>

                <!-- User Profile Dropdown in Sidebar Footer -->
                <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                        <button
                            class="group flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-muted"
                        >
                            <Avatar
                                class="h-8 w-8 shrink-0 border border-border"
                            >
                                <AvatarImage
                                    v-if="authUser?.avatar"
                                    :src="authUser?.avatar"
                                    :alt="authUser?.name"
                                />
                                <AvatarFallback
                                    class="bg-emerald-500/15 text-xs font-semibold text-emerald-600 dark:text-emerald-300"
                                >
                                    {{
                                        authUser?.name
                                            ? authUser.name
                                                  .slice(0, 2)
                                                  .toUpperCase()
                                            : 'SO'
                                    }}
                                </AvatarFallback>
                            </Avatar>
                            <div v-if="!isCollapsed" class="flex-1 truncate">
                                <div
                                    class="truncate text-xs font-semibold text-foreground"
                                >
                                    {{ authUser?.name || 'SOC Operator' }}
                                </div>
                                <div
                                    class="truncate text-[10px] text-muted-foreground"
                                >
                                    {{ authUser?.email || 'soc@login.test' }}
                                </div>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent class="w-56" align="end" side="right">
                        <DropdownMenuLabel class="font-normal">
                            <div class="flex flex-col space-y-1">
                                <p class="text-sm leading-none font-medium">
                                    {{ authUser?.name || 'SOC Operator' }}
                                </p>
                                <p
                                    class="text-xs leading-none text-muted-foreground"
                                >
                                    {{ authUser?.email || 'soc@login.test' }}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem as-child>
                                <Link
                                    :href="editProfile()"
                                    class="flex w-full cursor-pointer items-center"
                                >
                                    <User class="mr-2 h-4 w-4" />
                                    Profile Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem as-child>
                                <Link
                                    :href="editSecurity()"
                                    class="flex w-full cursor-pointer items-center"
                                >
                                    <ShieldCheck class="mr-2 h-4 w-4" />
                                    Security & 2FA
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem as-child>
                                <Link
                                    :href="editAppearance()"
                                    class="flex w-full cursor-pointer items-center"
                                >
                                    <Settings class="mr-2 h-4 w-4" />
                                    Appearance
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                class="cursor-pointer"
                                @click="toggleDemoMode"
                            >
                                <Radio
                                    class="mr-2 h-4 w-4 text-muted-foreground"
                                />
                                <span>Toggle Demo Mode</span>
                                <span
                                    class="ml-auto font-mono text-[10px] font-bold uppercase"
                                    :class="
                                        demoMode
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : 'text-muted-foreground'
                                    "
                                >
                                    {{ demoMode ? 'ON' : 'OFF' }}
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                class="cursor-pointer"
                                @click="toggleMute"
                            >
                                <component
                                    :is="isMuted ? VolumeX : Volume2"
                                    class="mr-2 h-4 w-4 text-muted-foreground"
                                />
                                <span>Mute Alerts</span>
                                <span
                                    class="ml-auto font-mono text-[10px] font-bold uppercase"
                                    :class="
                                        isMuted
                                            ? 'text-amber-600 dark:text-amber-400'
                                            : 'text-muted-foreground'
                                    "
                                >
                                    {{ isMuted ? 'MUTED' : 'ON' }}
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            @click="handleLogout"
                            class="cursor-pointer text-rose-500 focus:text-rose-500"
                        >
                            <LogOut class="mr-2 h-4 w-4" />
                            Log Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>

        <!-- Main Content Shell -->
        <div class="flex min-w-0 flex-1 flex-col">
            <!-- Header -->
            <header
                class="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/60 px-6 backdrop-blur-md"
            >
                <div class="flex items-center gap-4">
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
                            class="h-2 w-2 animate-pulse rounded-full bg-amber-500"
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
                            @click="updateAppearance('system')"
                        >
                            <Monitor class="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </header>

            <!-- Page Content View -->
            <main class="flex-1 overflow-y-auto bg-background p-6">
                <slot />
            </main>
        </div>
    </div>
</template>
