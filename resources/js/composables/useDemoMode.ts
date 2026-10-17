import { ref, watch, type Ref } from 'vue';

const STORAGE_KEY = 'soc-demo-mode';

const getInitialDemoMode = (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
};

export const demoMode: Ref<boolean> = ref(getInitialDemoMode());

watch(demoMode, (val) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, String(val));
    }
});

export const toggleDemoMode = (): void => {
    demoMode.value = !demoMode.value;
};

export const setDemoMode = (value: boolean): void => {
    demoMode.value = value;
};
