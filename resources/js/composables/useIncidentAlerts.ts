import { watch } from 'vue';
import { router } from '@inertiajs/vue3';
import { toast } from 'vue-sonner';
import { useSocChannel } from '@/composables/useSocChannel';
import { useAlertSound } from '@/composables/useAlertSound';

const seenIncidentIds = new Set<string>();
const MAX_SEEN = 200;

function markSeen(id: string) {
    if (seenIncidentIds.has(id)) return;
    if (seenIncidentIds.size >= MAX_SEEN) {
        const first = seenIncidentIds.values().next().value;
        if (first !== undefined) {
            seenIncidentIds.delete(first);
        }
    }
    seenIncidentIds.add(id);
}

export function useIncidentAlerts(): void {
    const { incidents } = useSocChannel();
    const alertSound = useAlertSound();

    let isInitialMount = true;

    watch(
        incidents,
        (newIncidents) => {
            if (!newIncidents || newIncidents.length === 0) return;

            if (isInitialMount) {
                for (const inc of newIncidents) {
                    if (inc.incident_id) {
                        markSeen(inc.incident_id);
                    }
                }
                isInitialMount = false;
                return;
            }

            for (const inc of newIncidents) {
                const id = inc.incident_id;
                if (!id) continue;

                if (!seenIncidentIds.has(id)) {
                    markSeen(id);

                    const severity = (inc.severity || 'MEDIUM').toUpperCase();
                    const title = `Security Incident: ${inc.title || id}`;
                    const description = `Target: ${inc.target_server || 'Unknown'} | Attacker: ${inc.attacker_ip || 'Unknown'} | Logs: ${inc.log_count_in_window ?? 0}`;

                    const action = {
                        label: 'View',
                        onClick: () => {
                            router.visit(`/incidents/${id}`);
                        },
                    };

                    if (severity === 'CRITICAL') {
                        toast.error(title, {
                            description,
                            action,
                        });
                        alertSound.play('CRITICAL');
                    } else if (severity === 'HIGH') {
                        toast.warning(title, {
                            description,
                            action,
                        });
                        alertSound.play('HIGH');
                    } else if (severity === 'MEDIUM') {
                        toast.info(title, {
                            description,
                            action,
                        });
                    }
                }
            }
        },
        { deep: false, immediate: true },
    );
}
