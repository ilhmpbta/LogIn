<script lang="ts">
// Module-scope singletons — persist across Inertia page navigations.
import { ref } from 'vue';
import type { Topology } from 'topojson-specification';

const worldData = ref<Topology | null>(null);
let worldDataPromise: Promise<Topology> | null = null;
const animatedIds = new Set<string>();
</script>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useSocChannel } from '@/composables/useSocChannel';
import { lookupSourceGeo, lookupServerGeo } from '@/lib/soc/geo';
import { severityStyle } from '@/lib/soc/severity';
import { feature } from 'topojson-client';
import { geoNaturalEarth1, geoPath, geoGraticule10 } from 'd3-geo';
import type { GeometryCollection } from 'topojson-specification';

const { incidents } = useSocChannel();
const loadError = ref(false);

onMounted(async () => {
    if (worldData.value) return; // already cached from a previous mount
    if (!worldDataPromise) {
        worldDataPromise = fetch('/data/world-110m.json').then((res) => {
            if (!res.ok) throw new Error('Failed to fetch map data');
            return res.json() as Promise<Topology>;
        });
    }
    try {
        worldData.value = await worldDataPromise;
    } catch {
        loadError.value = true;
        worldDataPromise = null; // allow retry on next mount
    }
});

// Shared projection — computed ONCE per worldData change, not per incident.
const projection = computed(() => {
    if (!worldData.value) return null;
    try {
        const countries = worldData.value.objects
            .countries as GeometryCollection;
        const land = feature(worldData.value, countries);
        const proj = geoNaturalEarth1().fitSize([800, 450], land as never);
        return { land, proj, pathGen: geoPath(proj) };
    } catch {
        return null;
    }
});

const landPath = computed(() => {
    if (!projection.value) return '';
    return projection.value.pathGen(projection.value.land as never) || '';
});

const graticulePath = computed(() => {
    if (!projection.value) return '';
    return projection.value.pathGen(geoGraticule10() as never) || '';
});

function getCoords(lng: number, lat: number): [number, number] | null {
    if (!projection.value) return null;
    const coords = projection.value.proj([lng, lat]);
    return coords || null;
}

interface IncidentArc {
    id: string;
    d: string;
    color: string;
    opacity: number;
    isNew: boolean;
    sourceCoords: [number, number];
    targetCoords: [number, number];
    sourceInfo: string;
    title: string;
}

const renderedArcs = computed<IncidentArc[]>(() => {
    if (!projection.value) return [];
    const arcs: IncidentArc[] = [];
    const now = Date.now();

    for (const inc of incidents.value) {
        const sourceGeo = lookupSourceGeo(inc.attacker_ip);
        const targetGeo = lookupServerGeo(inc.target_server);

        const sCoords = getCoords(sourceGeo.lng, sourceGeo.lat);
        const tCoords = getCoords(targetGeo.lng, targetGeo.lat);

        if (!sCoords || !tCoords) continue;

        const dx = tCoords[0] - sCoords[0];
        const dy = tCoords[1] - sCoords[1];
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mx = (sCoords[0] + tCoords[0]) / 2;
        const my = (sCoords[1] + tCoords[1]) / 2;

        const nx = -dy / dist;
        const ny = dx / dist;
        const offset = dist * 0.25;
        const cx = mx + nx * offset;
        const cy = my + ny * offset;

        const d = `M ${sCoords[0]} ${sCoords[1]} Q ${cx} ${cy} ${tCoords[0]} ${tCoords[1]}`;

        const isOld = now - new Date(inc.first_seen).getTime() > 30_000;
        const opacity = isOld ? 0.3 : 0.9;
        const color = severityStyle(inc.severity).hex;

        const isNew = !animatedIds.has(inc.incident_id);
        if (isNew) {
            animatedIds.add(inc.incident_id);
        }

        arcs.push({
            id: inc.incident_id,
            d,
            color,
            opacity,
            isNew,
            sourceCoords: sCoords,
            targetCoords: tCoords,
            sourceInfo: `${inc.attacker_ip} (${sourceGeo.city}, ${sourceGeo.country})`,
            title: inc.title,
        });
    }

    return arcs;
});
</script>

<template>
    <div
        class="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm backdrop-blur-xs"
    >
        <!-- Header -->
        <div
            class="mb-3 flex items-center justify-between border-b border-border pb-2"
        >
            <div class="flex items-center gap-2">
                <span
                    class="text-xs font-medium tracking-wider text-foreground uppercase"
                >
                    Global Threat Origins
                </span>
            </div>
            <div class="flex items-center gap-2">
                <span
                    class="h-2 w-2 animate-ping rounded-full bg-emerald-500 motion-reduce:animate-none"
                />
                <span
                    class="font-mono text-[10px] text-muted-foreground uppercase"
                    >Live</span
                >
            </div>
        </div>

        <!-- Map Container / SVG -->
        <div
            class="relative flex min-h-[256px] flex-1 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/20"
        >
            <!-- Error State -->
            <div v-if="loadError" class="text-xs text-muted-foreground">
                Map unavailable
            </div>

            <!-- Skeleton / Loading State -->
            <div
                v-else-if="!worldData"
                class="h-full w-full animate-pulse bg-muted/40 motion-reduce:animate-none"
            />

            <!-- Loaded SVG Map -->
            <svg
                v-else
                viewBox="0 0 800 450"
                class="h-auto max-h-[320px] w-full"
                style="background-color: var(--card)"
            >
                <!-- Background -->
                <rect width="800" height="450" style="fill: var(--card)" />

                <!-- Graticule -->
                <path
                    :d="graticulePath"
                    style="
                        fill: none;
                        stroke: var(--border);
                        stroke-width: 0.5;
                        opacity: 0.2;
                    "
                />

                <!-- Land Masses -->
                <path
                    :d="landPath"
                    style="
                        fill: var(--muted);
                        stroke: var(--border);
                        stroke-width: 0.5;
                    "
                />

                <!-- Arcs -->
                <g>
                    <path
                        v-for="arc in renderedArcs"
                        :key="arc.id"
                        :d="arc.d"
                        pathLength="1"
                        :style="{
                            fill: 'none',
                            stroke: arc.color,
                            strokeWidth: '1.5',
                            strokeLinecap: 'round',
                            opacity: arc.opacity,
                            strokeDasharray: '1',
                            animation: arc.isNew
                                ? 'dash-anim 800ms ease-out forwards'
                                : 'none',
                        }"
                    />
                </g>

                <!-- Markers -->
                <g>
                    <template
                        v-for="arc in renderedArcs"
                        :key="'marker-' + arc.id"
                    >
                        <!-- Target Marker -->
                        <circle
                            :cx="arc.targetCoords[0]"
                            :cy="arc.targetCoords[1]"
                            r="3"
                            style="
                                fill: var(--foreground);
                                stroke: var(--card);
                                stroke-width: 1;
                            "
                        />
                        <!-- Source Marker with Tooltip -->
                        <circle
                            :cx="arc.sourceCoords[0]"
                            :cy="arc.sourceCoords[1]"
                            r="4"
                            :style="{ fill: arc.color }"
                            class="cursor-pointer transition-transform hover:scale-125"
                        >
                            <title>
                                {{ arc.sourceInfo }} — {{ arc.title }}
                            </title>
                        </circle>
                    </template>
                </g>

                <!-- Empty State -->
                <text
                    v-if="renderedArcs.length === 0"
                    x="400"
                    y="225"
                    text-anchor="middle"
                    dominant-baseline="middle"
                    style="
                        fill: var(--muted-foreground);
                        font-size: 12px;
                        font-family: monospace;
                    "
                >
                    No active incidents
                </text>
            </svg>
        </div>
    </div>
</template>

<style scoped>
@keyframes dash-anim {
    from {
        stroke-dashoffset: 1;
    }
    to {
        stroke-dashoffset: 0;
    }
}
</style>
