<script setup lang="ts">
import { Link, router } from '@inertiajs/vue3';
import {
    LayoutDashboard,
    ShieldAlert,
    Terminal,
    Sliders,
    Shield,
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
import { computed } from 'vue';
import { demoMode, toggleDemoMode } from '@/composables/useDemoMode';
import { useTypedPage } from '@/composables/useTypedPage';
import { useAlertSound } from '@/composables/useAlertSound';
import { toggleSidebar } from '@/composables/useSidebarCollapse';
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

withDefaults(
    defineProps<{
        collapsed: boolean;
        showCollapseToggle?: boolean;
    }>(),
    {
        showCollapseToggle: true,
    },
);

const emit = defineEmits<{
    (e: 'navigate'): void;
}>();

const { isMuted, toggleMute } = useAlertSound();

const page = useTypedPage();
const currentUrl = computed(() => page.url);
const authUser = computed(() => page.props.auth.user);

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
    <div>
        <!-- Brand / Logo -->
        <div
            class="flex h-16 items-center border-b border-border transition-all"
            :class="collapsed ? 'justify-center px-3' : 'justify-between px-5'"
        >
            <div class="flex items-center gap-3 overflow-hidden">
                <div
                    class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-600 shadow-xs dark:text-emerald-400"
                >
                    <Shield class="h-5 w-5" />
                </div>
                <div v-if="!collapsed" class="truncate">
                    <span class="block text-base font-bold tracking-tight"
                        >LogIn SOC</span
                    >
                    <span
                        class="block font-mono text-[10px] tracking-wider text-emerald-600 uppercase dark:text-emerald-400"
                        >AGENTIC AI SIEM</span
                    >
                </div>
            </div>
            <template v-if="showCollapseToggle">
                <button
                    v-if="!collapsed"
                    class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Collapse Sidebar"
                    aria-label="Collapse sidebar"
                    @click="toggleSidebar()"
                >
                    <ChevronLeft class="h-4 w-4" />
                </button>
            </template>
        </div>

        <!-- Collapse Toggle when collapsed -->
        <template v-if="showCollapseToggle">
            <div
                v-if="collapsed"
                class="flex justify-center border-b border-border/50 py-2"
            >
                <button
                    class="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    title="Expand Sidebar"
                    aria-label="Expand sidebar"
                    @click="toggleSidebar()"
                >
                    <ChevronRight class="h-4 w-4" />
                </button>
            </div>
        </template>

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
                :aria-current="currentUrl === item.href ? 'page' : undefined"
                :title="collapsed ? item.label : undefined"
                @click="emit('navigate')"
            >
                <component
                    :is="item.icon"
                    class="h-4 w-4 shrink-0 transition-colors"
                />
                <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
            </Link>
        </nav>
    </div>

    <!-- Footer / System status & User Profile -->
    <div class="space-y-3 border-t border-border p-3">
        <div
            v-if="!collapsed"
            class="flex items-center justify-between px-2 text-xs text-muted-foreground"
        >
            <span class="flex items-center gap-1.5 font-mono">
                <span
                    class="h-2 w-2 animate-pulse rounded-full motion-reduce:animate-none"
                    :class="demoMode ? 'bg-amber-500' : 'bg-emerald-500'"
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
                    <Avatar class="h-8 w-8 shrink-0 border border-border">
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
                                    ? authUser.name.slice(0, 2).toUpperCase()
                                    : 'SO'
                            }}
                        </AvatarFallback>
                    </Avatar>
                    <div v-if="!collapsed" class="flex-1 truncate">
                        <div
                            class="truncate text-xs font-semibold text-foreground"
                        >
                            {{ authUser?.name || 'SOC Operator' }}
                        </div>
                        <div class="truncate text-[10px] text-muted-foreground">
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
                        <p class="text-xs leading-none text-muted-foreground">
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
                            @click="emit('navigate')"
                        >
                            <User class="mr-2 h-4 w-4" />
                            Profile Settings
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem as-child>
                        <Link
                            :href="editSecurity()"
                            class="flex w-full cursor-pointer items-center"
                            @click="emit('navigate')"
                        >
                            <ShieldCheck class="mr-2 h-4 w-4" />
                            Security & 2FA
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem as-child>
                        <Link
                            :href="editAppearance()"
                            class="flex w-full cursor-pointer items-center"
                            @click="emit('navigate')"
                        >
                            <Settings class="mr-2 h-4 w-4" />
                            Appearance
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        class="cursor-pointer"
                        @click="toggleDemoMode"
                    >
                        <Radio class="mr-2 h-4 w-4 text-muted-foreground" />
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
</template>
