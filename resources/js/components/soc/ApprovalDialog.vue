<script setup lang="ts">
import { computed } from 'vue';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShieldCheck, ShieldX } from '@lucide/vue';

const props = withDefaults(
    defineProps<{
        open: boolean;
        title?: string;
        description?: string;
        actionName?: string;
        severity?: string;
    }>(),
    {
        title: 'Security Action Approval Required',
        description:
            'The AI SOC Agent is requesting authorization to execute a remediation action on the infrastructure.',
        actionName: 'Isolate Target Host & Block IP',
    },
);

const emit = defineEmits<{
    (e: 'update:open', value: boolean): void;
    (e: 'approve'): void;
    (e: 'reject'): void;
}>();

const isOpen = computed({
    get: () => props.open,
    set: (val) => emit('update:open', val),
});

function onApprove() {
    emit('approve');
    emit('update:open', false);
}

function onReject() {
    emit('reject');
    emit('update:open', false);
}
</script>

<template>
    <Dialog v-model:open="isOpen">
        <DialogContent
            class="border-border bg-card text-card-foreground sm:max-w-md"
        >
            <DialogHeader>
                <div class="mb-2 flex items-center gap-3">
                    <div
                        class="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    >
                        <AlertTriangle class="h-5 w-5" />
                    </div>
                    <div>
                        <DialogTitle class="text-base text-foreground">{{
                            title
                        }}</DialogTitle>
                        <DialogDescription
                            class="mt-0.5 text-xs text-muted-foreground"
                        >
                            {{ description }}
                        </DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <div
                class="my-4 space-y-2 rounded-xl border border-border bg-muted/40 p-3"
            >
                <span
                    class="block font-mono text-[11px] tracking-wider text-muted-foreground uppercase"
                    >Proposed Remediation Action</span
                >
                <div
                    class="flex items-center gap-2 font-mono text-xs font-semibold text-amber-600 dark:text-amber-300"
                >
                    <span>⚡ {{ actionName }}</span>
                </div>
            </div>

            <DialogFooter class="flex gap-2 sm:justify-end">
                <Button
                    variant="outline"
                    class="border-border bg-background text-foreground hover:bg-muted"
                    @click="onReject"
                >
                    <ShieldX
                        class="mr-1.5 h-4 w-4 text-rose-600 dark:text-rose-400"
                    />
                    Reject Action
                </Button>
                <Button
                    class="bg-emerald-600 text-white hover:bg-emerald-500"
                    @click="onApprove"
                >
                    <ShieldCheck class="mr-1.5 h-4 w-4 text-emerald-100" />
                    Approve & Execute
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>
