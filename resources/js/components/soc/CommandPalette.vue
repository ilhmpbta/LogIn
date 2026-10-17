<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { router } from '@inertiajs/vue3';
import {
    LayoutDashboard,
    ShieldAlert,
    Terminal,
    Sliders,
    User,
    ShieldCheck,
    Settings,
    LogOut,
    Search,
} from '@lucide/vue';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { logout } from '@/routes';
import type { LucideIcon } from '@lucide/vue';

const props = defineProps<{
    open: boolean;
}>();

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
}>();

const query = ref('');
const selectedIndex = ref(0);
const searchInputRef = ref<HTMLInputElement | null>(null);

const isMac = computed(() => {
    if (typeof navigator === 'undefined') return true;
    return /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
});

const modKey = computed(() => (isMac.value ? '⌘' : 'Ctrl'));

type CommandItem = {
    title: string;
    category?: string;
    icon: LucideIcon;
    chord?: string;
    action: () => void;
};

const items = computed<CommandItem[]>(() => [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        chord: 'G D',
        action: () => {
            emit('update:open', false);
            router.visit('/dashboard');
        },
    },
    {
        title: 'Incidents',
        icon: ShieldAlert,
        chord: 'G I',
        action: () => {
            emit('update:open', false);
            router.visit('/incidents');
        },
    },
    {
        title: 'Live Logs',
        icon: Terminal,
        chord: 'G L',
        action: () => {
            emit('update:open', false);
            router.visit('/logs');
        },
    },
    {
        title: 'Detection Rules',
        icon: Sliders,
        chord: 'G R',
        action: () => {
            emit('update:open', false);
            router.visit('/rules');
        },
    },
    {
        title: 'Settings → Profile',
        icon: User,
        action: () => {
            emit('update:open', false);
            router.visit('/settings/profile');
        },
    },
    {
        title: 'Settings → Security',
        icon: ShieldCheck,
        action: () => {
            emit('update:open', false);
            router.visit('/settings/security');
        },
    },
    {
        title: 'Settings → Appearance',
        icon: Settings,
        action: () => {
            emit('update:open', false);
            router.visit('/settings/appearance');
        },
    },
    {
        title: 'Log out',
        icon: LogOut,
        action: () => {
            emit('update:open', false);
            router.flushAll();
            router.post(logout());
        },
    },
]);

const filteredItems = computed(() => {
    if (!query.value.trim()) {
        return items.value;
    }
    const q = query.value.toLowerCase();
    return items.value.filter((item) => item.title.toLowerCase().includes(q));
});

watch(query, () => {
    selectedIndex.value = 0;
});

watch(
    () => props.open,
    (isOpen) => {
        if (isOpen) {
            query.value = '';
            selectedIndex.value = 0;
            nextTick(() => {
                searchInputRef.value?.focus();
            });
        }
    },
);

const onKeyDown = (e: KeyboardEvent) => {
    if (!props.open) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredItems.value.length > 0) {
            selectedIndex.value =
                (selectedIndex.value + 1) % filteredItems.value.length;
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredItems.value.length > 0) {
            selectedIndex.value =
                (selectedIndex.value - 1 + filteredItems.value.length) %
                filteredItems.value.length;
        }
    } else if (e.key === 'Enter') {
        e.preventDefault();
        const current = filteredItems.value[selectedIndex.value];
        if (current) {
            current.action();
        }
    }
};
</script>

<template>
    <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
        <DialogContent
            class="top-[20%] translate-y-0 gap-0 overflow-hidden border-border bg-card p-0 shadow-2xl"
            :show-close-button="false"
            @keydown="onKeyDown"
        >
            <DialogTitle class="sr-only">Command Palette</DialogTitle>
            <DialogDescription class="sr-only">
                Search for pages, settings, and commands
            </DialogDescription>

            <div class="flex items-center border-b border-border px-3 py-2.5">
                <Search class="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                    ref="searchInputRef"
                    v-model="query"
                    type="text"
                    placeholder="Type a command or search..."
                    class="flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
            </div>

            <div class="max-h-80 overflow-y-auto p-2">
                <div
                    v-if="filteredItems.length === 0"
                    class="py-6 text-center text-sm text-muted-foreground"
                >
                    No commands match
                </div>
                <div
                    v-for="(item, index) in filteredItems"
                    :key="item.title"
                    @click="item.action()"
                    @mouseenter="selectedIndex = index"
                    :class="[
                        'flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
                        index === selectedIndex
                            ? 'bg-accent text-accent-foreground'
                            : 'text-foreground hover:bg-accent/50',
                    ]"
                >
                    <div class="flex items-center gap-2.5">
                        <component
                            :is="item.icon"
                            class="h-4 w-4 text-muted-foreground"
                        />
                        <span>{{ item.title }}</span>
                    </div>
                    <div v-if="item.chord" class="flex items-center gap-1">
                        <kbd
                            class="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground"
                        >
                            {{ item.chord }}
                        </kbd>
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>
</template>
