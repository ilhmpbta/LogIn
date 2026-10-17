import { ref, type Ref } from 'vue';
import type { Severity } from '@/types/soc';

export interface UseAlertSoundReturn {
    isMuted: Ref<boolean>;
    toggleMute: () => void;
    play: (severity: Severity) => void;
}

const isMuted = ref<boolean>(false);

if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('soc-alert-muted');
    if (stored !== null) {
        isMuted.value = stored === 'true';
    }
}

function toggleMute() {
    isMuted.value = !isMuted.value;
    if (typeof window !== 'undefined') {
        window.localStorage.setItem('soc-alert-muted', String(isMuted.value));
    }
}

let audioCtx: AudioContext | null = null;
let primed = false;

function primeAudioContext() {
    if (primed || typeof window === 'undefined') return;
    const handlePointerDown = () => {
        if (!audioCtx) {
            const AudioContextClass =
                window.AudioContext ||
                (
                    window as unknown as {
                        webkitAudioContext: typeof AudioContext;
                    }
                ).webkitAudioContext;
            if (AudioContextClass) {
                audioCtx = new AudioContextClass();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        primed = true;
        window.removeEventListener('pointerdown', handlePointerDown);
    };
    window.addEventListener('pointerdown', handlePointerDown, { once: true });
}

if (typeof window !== 'undefined') {
    primeAudioContext();
}

function getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!audioCtx) {
        const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
                .webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    return audioCtx;
}

function playTone(freq: number, durationMs: number) {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
    }

    try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        const durationSec = durationMs / 1000;

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + durationSec);
        osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
        };
    } catch {
        // Silently catch autoplay policy or audio errors
    }
}

function playSequence(steps: { freq: number; durationMs: number }[]) {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
    }

    try {
        const now = ctx.currentTime;
        let offset = 0;
        for (const step of steps) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(step.freq, now + offset);

            const durationSec = step.durationMs / 1000;
            gain.gain.setValueAtTime(0.001, now + offset);
            gain.gain.linearRampToValueAtTime(0.15, now + offset + 0.01);
            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + offset + durationSec,
            );

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + offset);
            osc.stop(now + offset + durationSec);
            osc.onended = () => {
                osc.disconnect();
                gain.disconnect();
            };

            offset += durationSec + 0.03;
        }
    } catch {}
}

export function useAlertSound(): UseAlertSoundReturn {
    function play(severity: Severity) {
        if (isMuted.value) return;
        const upper = severity?.toUpperCase();
        if (upper === 'CRITICAL') {
            playSequence([
                { freq: 880, durationMs: 150 },
                { freq: 660, durationMs: 150 },
            ]);
        } else if (upper === 'HIGH') {
            playTone(660, 150);
        } else {
            playTone(440, 100);
        }
    }

    return {
        isMuted,
        toggleMute,
        play,
    };
}
