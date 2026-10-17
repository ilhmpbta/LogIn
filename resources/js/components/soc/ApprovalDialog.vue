<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShieldCheck, ShieldX, ArrowLeft } from '@lucide/vue';

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
    (e: 'reject', reason: string): void;
}>();

const mode = ref<'preview' | 'rejecting'>('preview');
const rejectReason = ref('');

watch(
    () => props.open,
    (isOpen) => {
        if (!isOpen) {
            mode.value = 'preview';
            rejectReason.value = '';
        }
    },
);

const isOpen = computed({
    get: () => props.open,
    set: (val) => emit('update:open', val),
});

function onApprove() {
    emit('approve');
    emit('update:open', false);
}

function startReject() {
    mode.value = 'rejecting';
    rejectReason.value = '';
}

function cancelReject() {
    mode.value = 'preview';
    rejectReason.value = '';
}

function confirmReject() {
    if (!rejectReason.value.trim()) return;
    emit('reject', rejectReason.value.trim());
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

            <!-- Preview Mode -->
            <template v-if="mode === 'preview'">
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
                        @click="startReject"
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
            </template>

            <!-- Rejecting Mode -->
            <template v-else>
                <div class="my-4 space-y-3">
                    <p class="text-xs leading-relaxed text-muted-foreground">
                        The agent will stand down. This incident will be marked
                        as manually rejected and no autonomous remediation will
                        run.
                    </p>
                    <div class="space-y-1.5">
                        <label
                            for="reject-reason"
                            class="block font-mono text-[11px] font-medium tracking-wider text-foreground uppercase"
                        >
                            Reason for rejection
                            <span class="text-rose-500">*</span>
                        </label>
                        <textarea
                            id="reject-reason"
                            v-model="rejectReason"
                            rows="3"
                            placeholder="Provide operational justification for rejecting this remediation action..."
                            class="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                        ></textarea>
                    </div>
                </div>

                <DialogFooter class="flex gap-2 sm:justify-end">
                    <Button
                        variant="outline"
                        class="border-border bg-background text-foreground hover:bg-muted"
                        @click="cancelReject"
                    >
                        <ArrowLeft class="mr-1.5 h-4 w-4" />
                        Back
                    </Button>
                    <Button
                        variant="destructive"
                        :disabled="!rejectReason.trim()"
                        class="bg-rose-600 text-white hover:bg-rose-500 disabled:opacity-50"
                        @click="confirmReject"
                    >
                        <ShieldX class="mr-1.5 h-4 w-4 text-rose-100" />
                        Confirm Rejection
                    </Button>
                </DialogFooter>
            </template>
        </DialogContent>
    </Dialog>
</template>
