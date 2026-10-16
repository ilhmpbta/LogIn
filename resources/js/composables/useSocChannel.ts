import type Echo from 'laravel-echo';
import { onUnmounted, ref, watch, type Ref } from 'vue';
import { useEcho } from '@/composables/useEcho';
import type { IncidentTriggeredData, NormalizedLog } from '@/types/soc';

type EchoInstance = Echo<'reverb'>;

/** Payload dari backend — dibungkus .listen('.LogIngested') jadi class event. */
interface LogIngestedPayload {
    log: NormalizedLog;
}

export interface UseSocChannelOptions {
    /** Berapa banyak log yang disimpan di memory. Sisanya di-drop (FIFO). */
    maxLogs?: number;
    /** Berapa banyak incident terbaru yang disimpan. */
    maxIncidents?: number;
}

export interface UseSocChannelReturn {
    logs: Ref<NormalizedLog[]>;
    incidents: Ref<IncidentTriggeredData[]>;
    isConnected: Ref<boolean>;
    /** True kalau user menekan tombol Pause di terminal viewer. */
    paused: Ref<boolean>;
    togglePause: () => void;
    clearLogs: () => void;
}

export function useSocChannel(
    options: UseSocChannelOptions = {},
): UseSocChannelReturn {
    const maxLogs = options.maxLogs ?? 5_000;
    const maxIncidents = options.maxIncidents ?? 100;

    const logs = ref<NormalizedLog[]>([]);
    const incidents = ref<IncidentTriggeredData[]>([]);
    const paused = ref(false);

    const { echo, isConnected } = useEcho();

    let subscribed = false;

    const subscribe = (instance: EchoInstance): void => {
        if (subscribed) return;
        subscribed = true;

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

    watch(
        echo,
        (instance) => {
            if (instance) subscribe(instance);
        },
        { immediate: true },
    );

    onUnmounted(() => {
        if (echo.value && subscribed) {
            echo.value.leave('soc-logs');
            echo.value.leave('soc-incidents');
            subscribed = false;
        }
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
