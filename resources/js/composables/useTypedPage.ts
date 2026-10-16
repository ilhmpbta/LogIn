import { usePage } from '@inertiajs/vue3';
import type { SharedPageProps } from '@/types/shared';

export function useTypedPage() {
    return usePage<SharedPageProps>();
}
