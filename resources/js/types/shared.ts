import type { Auth } from '@/types/auth';

export interface SharedPageProps {
    name: string;
    auth: { user: Auth['user'] | null };
    sidebarOpen: boolean;
    status?: string;
    mustVerifyEmail?: boolean;
    [key: string]: unknown;
}
