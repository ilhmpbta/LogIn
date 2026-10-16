<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import { BookOpen, Folder, LayoutGrid, Menu, Search } from '@lucide/vue';
import { computed } from 'vue';
import AppLogo from '@/components/AppLogo.vue';
import { toUrl } from '@/lib/utils';
import AppLogoIcon from '@/components/AppLogoIcon.vue';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import UserMenuContent from '@/components/UserMenuContent.vue';
import { useCurrentUrl } from '@/composables/useCurrentUrl';
import { useTypedPage } from '@/composables/useTypedPage';
import { getInitials } from '@/composables/useInitials';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, NavItem } from '@/types';
import type { User } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const props = withDefaults(defineProps<Props>(), {
    breadcrumbs: () => [],
});

const page = useTypedPage();
const currentUser = computed(() => page.props.auth.user as User);
const { isCurrentUrl, whenCurrentUrl } = useCurrentUrl();

const activeItemStyles =
    'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const rightNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/ilhmpbta/LogIn',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs',
        icon: BookOpen,
    },
];
</script>

<template>
    <div
        class="dark:bg-sidebar-background border-b border-sidebar-border/80 bg-sidebar"
    >
        <div
            class="mx-auto flex h-16 items-center justify-between px-4 md:max-w-7xl"
        >
            <!-- Mobile Menu & Logo -->
            <div class="flex items-center space-x-4">
                <Sheet>
                    <SheetTrigger as-child>
                        <Button
                            variant="ghost"
                            size="icon"
                            class="size-9 rounded-lg md:hidden"
                        >
                            <Menu class="size-5" />
                            <span class="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" class="w-64 bg-sidebar p-6">
                        <SheetHeader class="sr-only">
                            <SheetTitle>Navigation Menu</SheetTitle>
                        </SheetHeader>
                        <div class="mb-8 flex items-center gap-2">
                            <AppLogo />
                        </div>
                        <nav class="flex flex-col space-y-4">
                            <Link
                                v-for="item in mainNavItems"
                                :key="item.title"
                                :href="item.href"
                                class="text-sm font-medium text-sidebar-foreground transition-colors hover:text-primary"
                            >
                                {{ item.title }}
                            </Link>
                        </nav>
                    </SheetContent>
                </Sheet>

                <Link :href="dashboard()" class="flex items-center gap-2">
                    <AppLogo />
                </Link>

                <!-- Desktop Navigation Menu -->
                <NavigationMenu class="ml-6 hidden md:flex">
                    <NavigationMenuList class="space-x-1">
                        <NavigationMenuItem
                            v-for="item in mainNavItems"
                            :key="item.title"
                        >
                            <Link
                                :href="item.href"
                                :class="[
                                    navigationMenuTriggerStyle(),
                                    'h-9 rounded-lg px-3 text-sm font-medium transition-colors',
                                    isCurrentUrl(item.href)
                                        ? activeItemStyles
                                        : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                                ]"
                            >
                                <component
                                    :is="item.icon"
                                    v-if="item.icon"
                                    class="mr-2 size-4"
                                />
                                {{ item.title }}
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
            </div>

            <!-- Right Nav & User Dropdown -->
            <div class="flex items-center space-x-3">
                <div class="hidden items-center space-x-1 lg:flex">
                    <template v-for="item in rightNavItems" :key="item.title">
                        <TooltipProvider :delay-duration="0">
                            <Tooltip>
                                <TooltipTrigger as-child>
                                    <a
                                        :href="toUrl(item.href)"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="group inline-flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                    >
                                        <span class="sr-only">
                                            {{ item.title }}
                                        </span>
                                        <component
                                            :is="item.icon"
                                            class="size-4"
                                        />
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{{ item.title }}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </template>
                </div>

                <div class="relative ml-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger :as-child="true">
                            <Button
                                variant="ghost"
                                size="icon"
                                class="relative size-10 w-auto rounded-full p-1 focus-within:ring-2 focus-within:ring-primary"
                            >
                                <Avatar
                                    class="size-8 overflow-hidden rounded-full"
                                >
                                    <AvatarImage
                                        v-if="currentUser.avatar"
                                        :src="currentUser.avatar"
                                        :alt="currentUser.name"
                                    />
                                    <AvatarFallback
                                        class="rounded-lg bg-neutral-200 font-semibold text-black dark:bg-neutral-700 dark:text-white"
                                    >
                                        {{ getInitials(currentUser?.name) }}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" class="w-56">
                            <UserMenuContent :user="currentUser" />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    </div>

    <div
        v-if="props.breadcrumbs.length > 1"
        class="flex w-full border-b border-sidebar-border/70 bg-sidebar px-4 py-2 text-sm text-sidebar-foreground/80"
    >
        <div class="mx-auto flex w-full items-center space-x-2 md:max-w-7xl">
            <Breadcrumbs :breadcrumbs="props.breadcrumbs" />
        </div>
    </div>
</template>
