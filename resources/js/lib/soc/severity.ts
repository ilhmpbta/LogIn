import {
    AlertOctagon,
    AlertTriangle,
    CircleAlert,
    Info,
    type LucideIcon,
} from '@lucide/vue';
import type { IncidentStatus, Severity } from '@/types/soc';

export interface SeverityStyle {
    label: string;
    text: string;
    bg: string;
    border: string;
    ring: string;
    hex: string;
    icon: LucideIcon;
    rank: number;
}

export const SEVERITY_STYLES: Record<Severity, SeverityStyle> = {
    CRITICAL: {
        label: 'Critical',
        text: 'text-rose-700 dark:text-rose-300',
        bg: 'bg-rose-500/10 dark:bg-rose-500/15',
        border: 'border-rose-500/30 dark:border-rose-500/40',
        ring: 'ring-rose-500/50',
        hex: '#f43f5e',
        icon: AlertOctagon,
        rank: 4,
    },
    HIGH: {
        label: 'High',
        text: 'text-orange-700 dark:text-orange-300',
        bg: 'bg-orange-500/10 dark:bg-orange-500/15',
        border: 'border-orange-500/30 dark:border-orange-500/40',
        ring: 'ring-orange-500/50',
        hex: '#fb923c',
        icon: AlertTriangle,
        rank: 3,
    },
    MEDIUM: {
        label: 'Medium',
        text: 'text-amber-700 dark:text-amber-300',
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        border: 'border-amber-500/30 dark:border-amber-500/40',
        ring: 'ring-amber-500/50',
        hex: '#fbbf24',
        icon: CircleAlert,
        rank: 2,
    },
    LOW: {
        label: 'Low',
        text: 'text-emerald-700 dark:text-emerald-300',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        border: 'border-emerald-500/30 dark:border-emerald-500/40',
        ring: 'ring-emerald-500/50',
        hex: '#34d399',
        icon: Info,
        rank: 1,
    },
};

export function severityStyle(severity: Severity): SeverityStyle {
    return SEVERITY_STYLES[severity];
}

export function sortBySeverity<T extends { severity: Severity }>(
    items: T[],
): T[] {
    return [...items].sort(
        (a, b) =>
            SEVERITY_STYLES[b.severity].rank - SEVERITY_STYLES[a.severity].rank,
    );
}

export interface IncidentStatusStyle {
    label: string;
    text: string;
    bg: string;
    border: string;
    hex: string;
    pulse: boolean;
}

export const INCIDENT_STATUS_STYLES: Record<
    IncidentStatus,
    IncidentStatusStyle
> = {
    NEW: {
        label: 'New',
        text: 'text-sky-700 dark:text-sky-300',
        bg: 'bg-sky-500/10 dark:bg-sky-500/15',
        border: 'border-sky-500/30 dark:border-sky-500/40',
        hex: '#38bdf8',
        pulse: false,
    },
    ANALYZING: {
        label: 'Analyzing',
        text: 'text-violet-700 dark:text-violet-300',
        bg: 'bg-violet-500/10 dark:bg-violet-500/15',
        border: 'border-violet-500/30 dark:border-violet-500/40',
        hex: '#a78bfa',
        pulse: true,
    },
    MITIGATING: {
        label: 'Mitigating',
        text: 'text-fuchsia-700 dark:text-fuchsia-300',
        bg: 'bg-fuchsia-500/10 dark:bg-fuchsia-500/15',
        border: 'border-fuchsia-500/30 dark:border-fuchsia-500/40',
        hex: '#e879f9',
        pulse: true,
    },
    MITIGATED: {
        label: 'Mitigated',
        text: 'text-emerald-700 dark:text-emerald-300',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        border: 'border-emerald-500/30 dark:border-emerald-500/40',
        hex: '#34d399',
        pulse: false,
    },
    RESOLVED: {
        label: 'Resolved',
        text: 'text-teal-700 dark:text-teal-300',
        bg: 'bg-teal-500/10 dark:bg-teal-500/15',
        border: 'border-teal-500/30 dark:border-teal-500/40',
        hex: '#2dd4bf',
        pulse: false,
    },
    FALSE_POSITIVE: {
        label: 'False Positive',
        text: 'text-muted-foreground',
        bg: 'bg-muted/50 dark:bg-muted/50',
        border: 'border-border',
        hex: '#a3a3a3',
        pulse: false,
    },
};

export function statusStyle(status: IncidentStatus): IncidentStatusStyle {
    return INCIDENT_STATUS_STYLES[status];
}
