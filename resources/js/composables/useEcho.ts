import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { onMounted, ref, shallowRef, type Ref, type ShallowRef } from 'vue';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<'reverb'>;
    }
}

let echoInstance: Echo<'reverb'> | null = null;

const echoRef = shallowRef<Echo<'reverb'> | null>(null);
const isConnected = ref(false);

export interface UseEchoReturn {
    echo: ShallowRef<Echo<'reverb'> | null>;
    isConnected: Ref<boolean>;
}

export function useEcho(): UseEchoReturn {
    onMounted(() => {
        if (!echoInstance) {
            window.Pusher = Pusher;

            echoInstance = new Echo({
                broadcaster: 'reverb',
                key: import.meta.env.VITE_REVERB_APP_KEY,
                wsHost: import.meta.env.VITE_REVERB_HOST,
                wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
                wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
                forceTLS:
                    (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
                enabledTransports: ['ws', 'wss'],
            });

            echoInstance.connector?.pusher.connection.bind('connected', () => {
                isConnected.value = true;
            });
            echoInstance.connector?.pusher.connection.bind(
                'disconnected',
                () => {
                    isConnected.value = false;
                },
            );
            echoInstance.connector?.pusher.connection.bind(
                'unavailable',
                () => {
                    isConnected.value = false;
                },
            );
        }

        echoRef.value = echoInstance;
    });

    return { echo: echoRef, isConnected };
}
