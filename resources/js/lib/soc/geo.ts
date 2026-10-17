export interface GeoPoint {
    lat: number;
    lng: number;
    country: string;
    city: string;
}

export const SOURCE_GEO: Record<string, GeoPoint> = {
    '192.168.1.105': {
        lat: 37.77,
        lng: -122.42,
        country: 'US',
        city: 'San Francisco',
    },
    '185.220.101.5': {
        lat: 52.37,
        lng: 4.89,
        country: 'NL',
        city: 'Amsterdam',
    },
    '45.33.32.156': { lat: 32.78, lng: -96.8, country: 'US', city: 'Dallas' },
    '103.152.36.99': {
        lat: 22.32,
        lng: 114.17,
        country: 'HK',
        city: 'Hong Kong',
    },
    '23.129.64.131': {
        lat: 47.61,
        lng: -122.33,
        country: 'US',
        city: 'Seattle',
    },
};

export const SERVER_GEO: Record<string, GeoPoint> = {
    'auth-srv-01': { lat: 1.35, lng: 103.82, country: 'SG', city: 'Singapore' },
    'auth-srv-02': { lat: 1.35, lng: 103.82, country: 'SG', city: 'Singapore' },
    'web-api-01': { lat: 50.11, lng: 8.68, country: 'DE', city: 'Frankfurt' },
    'web-api-02': { lat: 50.11, lng: 8.68, country: 'DE', city: 'Frankfurt' },
    'db-master-01': {
        lat: 37.43,
        lng: -78.66,
        country: 'US',
        city: 'Virginia',
    },
    'db-replica-01': {
        lat: 37.43,
        lng: -78.66,
        country: 'US',
        city: 'Virginia',
    },
    'sys-core-01': { lat: 35.68, lng: 139.69, country: 'JP', city: 'Tokyo' },
    'edge-fw-01': {
        lat: -23.55,
        lng: -46.63,
        country: 'BR',
        city: 'São Paulo',
    },
};

export const UNKNOWN_GEO: GeoPoint = {
    lat: 0,
    lng: 0,
    country: 'Unknown',
    city: 'Unknown',
};

export function lookupSourceGeo(ip: string): GeoPoint {
    if (SOURCE_GEO[ip]) return SOURCE_GEO[ip];
    if (ip?.startsWith('10.')) {
        return { lat: 37.75, lng: -122.4, country: 'US', city: 'Local DC' };
    }
    return { lat: 50.0, lng: 10.0, country: 'EU', city: 'Unknown Hub' };
}

export function lookupServerGeo(server: string): GeoPoint {
    if (SERVER_GEO[server]) return SERVER_GEO[server];
    return UNKNOWN_GEO;
}
