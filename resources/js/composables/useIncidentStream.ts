import type Echo from 'laravel-echo';
import { onUnmounted, ref, watch, type Ref } from 'vue';
import { useEcho } from '@/composables/useEcho';
import type { IncidentStatus } from '@/types/soc';

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
    const { echo, isConnected } = useEcho();

    let subscribed = false;

    const subscribe = (instance: EchoInstance): void => {
        if (subscribed) return;
        subscribed = true;

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

    watch(
        echo,
        (instance) => {
            if (instance) subscribe(instance);
        },
        { immediate: true },
    );

    onUnmounted(() => {
        if (echo.value && subscribed) {
            echo.value.leave(`incident.${incidentId}`);
            subscribed = false;
        }
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
