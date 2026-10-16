<script setup lang="ts">
import { h, ref } from 'vue';
import {
    FlexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useVueTable,
    type ColumnDef,
    type SortingState,
} from '@tanstack/vue-table';
import { router } from '@inertiajs/vue3';
import SeverityBadge from './SeverityBadge.vue';
import IncidentBadge from './IncidentBadge.vue';
import type {
    IncidentStatus,
    IncidentTriggeredData,
    Severity,
} from '@/types/soc';

export interface IncidentItem extends IncidentTriggeredData {
    id: string;
}

const props = withDefaults(
    defineProps<{
        incidents: IncidentItem[];
        pageSize?: number;
    }>(),
    {
        pageSize: 10,
    },
);

const sorting = ref<SortingState>([{ id: 'first_seen', desc: true }]);

const columns: ColumnDef<IncidentItem>[] = [
    {
        accessorKey: 'incident_id',
        header: 'Incident ID',
        cell: ({ row }) =>
            h(
                'span',
                { class: 'font-mono text-xs font-semibold text-foreground' },
                row.getValue<string>('incident_id'),
            ),
    },
    {
        accessorKey: 'title',
        header: 'Title & Rule',
        cell: ({ row }) => {
            const item = row.original;
            return h('div', { class: 'space-y-0.5' }, [
                h(
                    'div',
                    { class: 'font-medium text-foreground text-xs' },
                    item.title,
                ),
                h(
                    'div',
                    { class: 'font-mono text-[10px] text-muted-foreground' },
                    `Rule: ${item.triggered_rule_id}`,
                ),
            ]);
        },
    },
    {
        accessorKey: 'severity',
        header: 'Severity',
        cell: ({ row }) =>
            h(SeverityBadge, {
                severity: row.getValue<Severity>('severity'),
                size: 'sm',
            }),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) =>
            h(IncidentBadge, {
                status: row.getValue<IncidentStatus>('status'),
                size: 'sm',
            }),
    },
    {
        accessorKey: 'target_server',
        header: 'Target Server',
        cell: ({ row }) =>
            h(
                'span',
                { class: 'font-mono text-xs text-muted-foreground' },
                row.getValue<string>('target_server'),
            ),
    },
    {
        accessorKey: 'attacker_ip',
        header: 'Attacker IP',
        cell: ({ row }) =>
            h(
                'span',
                { class: 'font-mono text-xs text-rose-600 dark:text-rose-400' },
                row.getValue<string>('attacker_ip'),
            ),
    },
    {
        accessorKey: 'first_seen',
        header: 'Timestamp',
        cell: ({ row }) => {
            const val = row.getValue<string>('first_seen');
            const display = val ? val.replace('T', ' ').slice(0, 19) : '';
            return h(
                'span',
                { class: 'font-mono text-[11px] text-muted-foreground' },
                display,
            );
        },
    },
];

const table = useVueTable<IncidentItem>({
    get data() {
        return props.incidents;
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
        get sorting() {
            return sorting.value;
        },
    },
    onSortingChange: (updaterOrValue) => {
        sorting.value =
            typeof updaterOrValue === 'function'
                ? updaterOrValue(sorting.value)
                : updaterOrValue;
    },
    initialState: {
        pagination: {
            pageSize: props.pageSize,
        },
    },
});

function handleRowClick(incident: IncidentItem): void {
    const id = incident.incident_id || incident.id;
    router.visit(`/incidents/${id}`);
}
</script>

<template>
    <div
        class="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm backdrop-blur-xs"
    >
        <div class="overflow-x-auto">
            <table class="w-full border-collapse text-left">
                <thead>
                    <tr
                        v-for="headerGroup in table.getHeaderGroups()"
                        :key="headerGroup.id"
                        class="border-b border-border bg-muted/60 text-[11px] tracking-wider text-muted-foreground uppercase"
                    >
                        <th
                            v-for="header in headerGroup.headers"
                            :key="header.id"
                            class="cursor-pointer px-4 py-3 font-semibold transition-colors select-none hover:text-foreground"
                            @click="
                                header.column.getToggleSortingHandler()?.(
                                    $event,
                                )
                            "
                        >
                            <div class="flex items-center gap-1.5">
                                <FlexRender
                                    v-if="!header.isPlaceholder"
                                    :render="header.column.columnDef.header"
                                    :props="header.getContext()"
                                />
                                <span v-if="header.column.getIsSorted()">
                                    {{
                                        header.column.getIsSorted() === 'asc'
                                            ? '▲'
                                            : '▼'
                                    }}
                                </span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border text-xs">
                    <template v-if="table.getRowModel().rows.length > 0">
                        <tr
                            v-for="row in table.getRowModel().rows"
                            :key="row.id"
                            class="cursor-pointer transition-colors hover:bg-muted/50"
                            @click="handleRowClick(row.original)"
                        >
                            <td
                                v-for="cell in row.getVisibleCells()"
                                :key="cell.id"
                                class="px-4 py-3 whitespace-nowrap"
                            >
                                <FlexRender
                                    :render="cell.column.columnDef.cell"
                                    :props="cell.getContext()"
                                />
                            </td>
                        </tr>
                    </template>
                    <template v-else>
                        <tr>
                            <td
                                :colspan="columns.length"
                                class="px-4 py-8 text-center text-muted-foreground"
                            >
                                No security incidents detected.
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>

        <!-- Pagination Controls -->
        <div
            class="flex items-center justify-between border-t border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground"
        >
            <div>
                Showing
                {{
                    table.getState().pagination.pageIndex *
                        table.getState().pagination.pageSize +
                    1
                }}
                to
                {{
                    Math.min(
                        (table.getState().pagination.pageIndex + 1) *
                            table.getState().pagination.pageSize,
                        props.incidents.length,
                    )
                }}
                of {{ props.incidents.length }} incidents
            </div>
            <div class="flex items-center gap-2">
                <button
                    class="rounded border border-border bg-background px-3 py-1 text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="!table.getCanPreviousPage()"
                    @click="table.previousPage()"
                >
                    Previous
                </button>
                <button
                    class="rounded border border-border bg-background px-3 py-1 text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="!table.getCanNextPage()"
                    @click="table.nextPage()"
                >
                    Next
                </button>
            </div>
        </div>
    </div>
</template>
