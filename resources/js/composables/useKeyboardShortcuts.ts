import { ref, onMounted, onUnmounted } from 'vue';
import { router } from '@inertiajs/vue3';
import { toggleSidebar } from './useSidebarCollapse';

const isInputFocused = (): boolean => {
    if (typeof document === 'undefined') return false;
    const active = document.activeElement;
    if (!active) return false;
    const tagName = active.tagName;
    if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
        return true;
    }
    if ((active as HTMLElement).isContentEditable) {
        return true;
    }
    return false;
};

export function useKeyboardShortcuts() {
    const paletteOpen = ref(false);

    const openPalette = () => {
        paletteOpen.value = true;
    };

    const closePalette = () => {
        paletteOpen.value = false;
    };

    const togglePalette = () => {
        paletteOpen.value = !paletteOpen.value;
    };

    let gPressedTime = 0;
    let gTimeoutId: number | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
        if (typeof window === 'undefined') return;

        const isCmdOrCtrl = e.metaKey || e.ctrlKey;

        // Cmd+K / Ctrl+K: toggle palette
        if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            togglePalette();
            return;
        }

        // If palette or any modal is open, ignore other navigation shortcuts (Cmd+K still works above)
        if (paletteOpen.value) {
            return;
        }

        // Cmd+B / Ctrl+B: toggle sidebar
        if (isCmdOrCtrl && e.key.toLowerCase() === 'b') {
            if (isInputFocused()) return;
            e.preventDefault();
            toggleSidebar();
            return;
        }

        // Vim-style G-chords (G then D/I/L/R)
        if (
            !isCmdOrCtrl &&
            !e.altKey &&
            !e.shiftKey &&
            !e.ctrlKey &&
            !e.metaKey
        ) {
            if (isInputFocused()) return;

            const key = e.key.toLowerCase();

            if (key === 'g') {
                const now = Date.now();
                if (gTimeoutId !== null) {
                    window.clearTimeout(gTimeoutId);
                    gTimeoutId = null;
                }
                gPressedTime = now;
                gTimeoutId = window.setTimeout(() => {
                    gPressedTime = 0;
                    gTimeoutId = null;
                }, 500);
                return;
            }

            if (gPressedTime > 0 && Date.now() - gPressedTime <= 500) {
                if (gTimeoutId !== null) {
                    window.clearTimeout(gTimeoutId);
                    gTimeoutId = null;
                }
                gPressedTime = 0;

                let targetRoute: string | null = null;
                if (key === 'd') {
                    targetRoute = '/dashboard';
                } else if (key === 'i') {
                    targetRoute = '/incidents';
                } else if (key === 'l') {
                    targetRoute = '/logs';
                } else if (key === 'r') {
                    targetRoute = '/rules';
                }

                if (targetRoute) {
                    e.preventDefault();
                    router.visit(targetRoute);
                }
            } else {
                if (gTimeoutId !== null) {
                    window.clearTimeout(gTimeoutId);
                    gTimeoutId = null;
                }
                gPressedTime = 0;
            }
        }
    };

    onMounted(() => {
        window.addEventListener('keydown', handleKeyDown);
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', handleKeyDown);
        if (gTimeoutId !== null) {
            window.clearTimeout(gTimeoutId);
        }
    });

    return {
        paletteOpen,
        openPalette,
        closePalette,
        togglePalette,
    };
}
