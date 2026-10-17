import type Echo from 'laravel-echo';
import { computed, onUnmounted, ref, watch, type Ref } from 'vue';
import { useAttackSimulation } from '@/composables/useAttackSimulation';
import { demoMode } from '@/composables/useDemoMode';
import { useEcho } from '@/composables/useEcho';
import type { IncidentTriggeredData, NormalizedLog } from '@/types/soc';

type EchoInstance = Echo<'reverb'>;

/** Payload dari backend — dibungkus .listen('.LogIngested') jadi class event. */
interface LogIngestedPayload {
    log: NormalizedLog;
}

export interface UseSocChannelOptions {
    maxLogs?: number;
    maxIncidents?: number;
}

export interface UseSocChannelReturn {
    logs: Ref<NormalizedLog[]>;
    incidents: Ref<IncidentTriggeredData[]>;
    isConnected: Ref<boolean>;
    paused: Ref<boolean>;
    togglePause: () => void;
    clearLogs: () => void;
}

const logs = ref<NormalizedLog[]>([]);
const incidents = ref<IncidentTriggeredData[]>([]);
const paused = ref(false);

export function useSocChannel(
    options: UseSocChannelOptions = {},
): UseSocChannelReturn {
    const maxLogs = options.maxLogs ?? 5_000;
    const maxIncidents = options.maxIncidents ?? 100;

    const { echo, isConnected: echoIsConnected } = useEcho();
    const simulation = useAttackSimulation();

    const isConnected = computed(() =>
        demoMode.value ? simulation.isRunning.value : echoIsConnected.value,
    );

    let echoSubscribed = false;
    let unsubSimLog: (() => void) | null = null;
    let unsubSimIncident: (() => void) | null = null;

    const cleanupEcho = (): void => {
        if (echo.value && echoSubscribed) {
            echo.value.leave('soc-logs');
            echo.value.leave('soc-incidents');
            echoSubscribed = false;
        }
    };

    const cleanupSim = (): void => {
        if (unsubSimLog) {
            unsubSimLog();
            unsubSimLog = null;
        }
        if (unsubSimIncident) {
            unsubSimIncident();
            unsubSimIncident = null;
        }
    };

    const subscribeEcho = (instance: EchoInstance): void => {
        if (echoSubscribed) return;
        echoSubscribed = true;

        instance
            .channel('soc-logs')
            .listen('.LogIngested', (payload: LogIngestedPayload) => {
                if (paused.value) return;

                const next = [...logs.value, payload.log];
                logs.value =
                    next.length > maxLogs
                        ? next.slice(next.length - maxLogs)
                        : next;
            });

        // Public channel: soc-incidents
        instance
            .channel('soc-incidents')
            .listen('.IncidentTriggered', (payload: IncidentTriggeredData) => {
                const next = [payload, ...incidents.value];
                incidents.value =
                    next.length > maxIncidents
                        ? next.slice(0, maxIncidents)
                        : next;
            });
    };

    const subscribeSim = (): void => {
        if (unsubSimLog || unsubSimIncident) return;

        simulation.start();

        unsubSimLog = simulation.onLog((log: NormalizedLog) => {
            if (paused.value) return;

            const next = [...logs.value, log];
            logs.value =
                next.length > maxLogs
                    ? next.slice(next.length - maxLogs)
                    : next;
        });

        unsubSimIncident = simulation.onIncident(
            (incident: IncidentTriggeredData) => {
                const next = [incident, ...incidents.value];
                incidents.value =
                    next.length > maxIncidents
                        ? next.slice(0, maxIncidents)
                        : next;
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
                simulation.stop();
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
        logs,
        incidents,
        isConnected,
        paused,
        togglePause: () => {
            paused.value = !paused.value;
        },
        clearLogs: () => {
            logs.value = [];
        },
    };
}
