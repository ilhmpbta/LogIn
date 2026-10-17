import type Echo from 'laravel-echo';
import { computed, onUnmounted, ref, watch, type Ref } from 'vue';
import { useAttackSimulation } from '@/composables/useAttackSimulation';
import { demoMode } from '@/composables/useDemoMode';
import { useEcho } from '@/composables/useEcho';
import type { AgentExecutionUpdatedData, IncidentStatus } from '@/types/soc';

type EchoInstance = Echo<'reverb'>;

export interface AgentStep {
    step: number;
    thought: string;
    toolCalled: string | null;
    toolParameters: Record<string, unknown> | null;
    toolResult: string | null;
    status: IncidentStatus;
    timestamp: string;
}

interface AgentExecutionUpdatedPayload {
    incident_id: string;
    step: number;
    thought: string;
    tool_called: string | null;
    tool_parameters: Record<string, unknown> | null;
    tool_result: string | null;
    current_status: IncidentStatus;
}

export interface UseIncidentStreamReturn {
    steps: Ref<AgentStep[]>;
    status: Ref<IncidentStatus | null>;
    isConnected: Ref<boolean>;
    reset: () => void;
}

export function useIncidentStream(incidentId: string): UseIncidentStreamReturn {
    const steps = ref<AgentStep[]>([]);
    const status = ref<IncidentStatus | null>(null);

    const { echo, isConnected: echoIsConnected } = useEcho();
    const simulation = useAttackSimulation();

    const isConnected = computed(() =>
        demoMode.value ? simulation.isRunning.value : echoIsConnected.value,
    );

    let echoSubscribed = false;
    let unsubSimStep: (() => void) | null = null;

    const cleanupEcho = (): void => {
        if (echo.value && echoSubscribed) {
            echo.value.leave(`incident.${incidentId}`);
            echoSubscribed = false;
        }
    };

    const cleanupSim = (): void => {
        if (unsubSimStep) {
            unsubSimStep();
            unsubSimStep = null;
        }
    };

    const subscribeEcho = (instance: EchoInstance): void => {
        if (echoSubscribed) return;
        echoSubscribed = true;

        instance
            .private(`incident.${incidentId}`)
            .listen(
                '.AgentExecutionUpdated',
                (payload: AgentExecutionUpdatedPayload) => {
                    status.value = payload.current_status;

                    steps.value = [
                        ...steps.value,
                        {
                            step: payload.step,
                            thought: payload.thought,
                            toolCalled: payload.tool_called,
                            toolParameters: payload.tool_parameters,
                            toolResult: payload.tool_result,
                            status: payload.current_status,
                            timestamp: new Date().toISOString(),
                        },
                    ];
                },
            );
    };

    const subscribeSim = (): void => {
        if (unsubSimStep) return;

        unsubSimStep = simulation.onAgentStep(
            incidentId,
            (stepData: AgentExecutionUpdatedData) => {
                status.value = stepData.current_status;

                steps.value = [
                    ...steps.value,
                    {
                        step: stepData.step,
                        thought: stepData.thought,
                        toolCalled: stepData.tool_called,
                        toolParameters: stepData.tool_parameters,
                        toolResult: stepData.tool_result,
                        status: stepData.current_status,
                        timestamp: new Date().toISOString(),
                    },
                ];
            },
        );
    };

    watch(
        [demoMode, echo],
        ([isDemo, echoInstance]) => {
            if (isDemo) {
                cleanupEcho();
                subscribeSim();
            } else {
                cleanupSim();
                if (echoInstance) {
                    subscribeEcho(echoInstance);
                }
            }
        },
        { immediate: true },
    );

    onUnmounted(() => {
        cleanupEcho();
        cleanupSim();
    });

    return {
        steps,
        status,
        isConnected,
        reset: () => {
            steps.value = [];
            status.value = null;
        },
    };
}
