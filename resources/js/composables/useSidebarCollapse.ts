import { ref, watch, type Ref } from 'vue';

const STORAGE_KEY = 'soc-sidebar-collapsed';

const getInitialCollapsed = (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
};

export const isCollapsed: Ref<boolean> = ref(getInitialCollapsed());

watch(isCollapsed, (val) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, String(val));
    }
});

export const toggleSidebar = (): void => {
    isCollapsed.value = !isCollapsed.value;
};

export const setCollapsed = (value: boolean): void => {
    isCollapsed.value = value;
};
