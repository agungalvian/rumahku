import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Property, PropertyType } from '../data/mockData';

// ─── API shape ───────────────────────────────────────────────────────────────

interface TipeRumah {
    id: number;
    status: 'subsidi' | 'komersil';
    nama: string;
    harga: number;
    kamarTidur: number;
    kamarMandi: number;
    fotoTampak: string;
    fotoDenah: string;
    jumlahLantai: number;
    luasTanah: number;
    luasBangunan: number;
    spesifikasiAtap: string;
    spesifikasiDinding: string;
    spesifikasiLantai: string;
    spesifikasiPondasi: string;
}

interface Wilayah {
    provinsi: string;
    kabupaten: string;
    kecamatan: string;
    kelurahan: string;
}

interface Pengembang {
    nama: string;
    asosiasi: string;
}

interface KantorPemasaran {
    noTelp: string;
    email: string;
    alamat: string;
}

interface TaperaLokasi {
    idLokasi: string;
    namaPerumahan: string;
    jenisPerumahan: string;
    jumlahUnit: number;
    foto: string[];
    koordinatPerumahan: string;
    tipeRumah: TipeRumah[];
    wilayah: Wilayah;
    pengembang: Pengembang;
    kantorPemasaran: KantorPemasaran[];
    aktivasi: boolean;
    rating: number | null;
}

interface TaperaApiResponse {
    data: TaperaLokasi[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mapStatus = (status: string): PropertyType =>
    status === 'subsidi' ? 'Subsidi' : 'Komersial';

const toImageUrl = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('/uploads/')) return path; // Local images
    // If it's already an absolute URL to tapera, proxy it
    if (path.startsWith('https://sikumbang.tapera.go.id')) {
        return path.replace('https://sikumbang.tapera.go.id', '/api/tapera-static');
    }
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/api/tapera-static${cleanPath}`;
};

const mapToProperty = (lokasi: TaperaLokasi): Property | null => {
    const tipe =
        lokasi.tipeRumah.find(t => t.status === 'subsidi') ??
        lokasi.tipeRumah.find(t => t.status === 'komersil') ??
        lokasi.tipeRumah[0];

    // Allow properties even if they don't have tipe details
    // if (!tipe) return null;

    const { kecamatan, kabupaten, provinsi } = lokasi.wilayah;
    const location = [kecamatan, kabupaten, provinsi].filter(Boolean).join(', ');

    const [latStr, lngStr] = (lokasi.koordinatPerumahan ?? '').split(',');
    const lat = parseFloat(latStr) || 0;
    const lng = parseFloat(lngStr) || 0;

    const galleryUrls = [
        ...lokasi.foto.map(toImageUrl),
        tipe?.fotoTampak ? toImageUrl(tipe.fotoTampak) : '',
        tipe?.fotoDenah ? toImageUrl(tipe.fotoDenah) : '',
    ].filter(Boolean);

    const facilities: string[] = [];
    if (tipe?.spesifikasiAtap) facilities.push(`Atap: ${tipe.spesifikasiAtap}`);
    if (tipe?.spesifikasiDinding) facilities.push(`Dinding: ${tipe.spesifikasiDinding}`);
    if (tipe?.spesifikasiLantai) facilities.push(`Lantai: ${tipe.spesifikasiLantai}`);
    if (tipe?.spesifikasiPondasi) facilities.push(`Pondasi: ${tipe.spesifikasiPondasi}`);

    const type = tipe ? mapStatus(tipe.status) : 'Subsidi';

    const features: string[] = [
        type === 'Subsidi' ? 'Subsidi Pemerintah' : 'Komersial',
        `${lokasi.pengembang?.asosiasi ?? ''}`.trim() || null,
        lokasi.jumlahUnit > 0 ? `${lokasi.jumlahUnit} Unit Tersedia` : null,
    ].filter((f): f is string => Boolean(f));

    return {
        id: lokasi.idLokasi,
        title: lokasi.namaPerumahan,
        type,
        price: tipe?.harga || 0,
        location,
        coordinates: { lat, lng },
        specifications: {
            bedrooms: Math.max(tipe?.kamarTidur || 0, 0),
            bathrooms: Math.max(tipe?.kamarMandi || 0, 0),
            landArea: tipe?.luasTanah || 0,
            buildArea: tipe?.luasBangunan || 0,
        },
        facilities: facilities.slice(0, 4),
        imageUrl: toImageUrl(lokasi.foto[0] || tipe?.fotoTampak),
        galleryUrls,
        features,
        isPromo: false,
        developerName: lokasi.pengembang?.nama,
        phoneContact: lokasi.kantorPemasaran?.[0]?.noTelp,
        jenisPerumahan: lokasi.jenisPerumahan,
    } as Property & { developerName?: string; phoneContact?: string; jenisPerumahan?: string };
};

// ─── Hook ────────────────────────────────────────────────────────────────────

// ─── Geo Helpers ─────────────────────────────────────────────────────────────

/**
 * Calculates distance between two points in KM using Haversine formula
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in KM
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface PropertyFilters {
    keyword?: string;
    provinsi?: string;
    kabKota?: string;
    kecamatan?: string;
    jenisPerumahan?: string;
    tipeProperti?: string;
    sortByDistance?: boolean;
    limit?: number;
}

export interface WilayahOptions {
    provinsi: string[];
    kabKota: { [prov: string]: string[] };
    kecamatan: { [kab: string]: string[] };
}

export interface UsePropertiesResult {
    properties: Property[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
    setFilters: (filters: PropertyFilters | ((prev: PropertyFilters) => PropertyFilters)) => void;
    filters: PropertyFilters;
    userCoords: { lat: number; lng: number } | null;
    setUserCoords: (coords: { lat: number; lng: number } | null) => void;
    wilayahOptions: WilayahOptions;
}

// ── Global Store for Caching & State ────────────────────────────────────────

interface CacheEntry {
    rawData: any[];
    timestamp: number;
}
const apiCache: Record<string, CacheEntry> = {};

let globalFilters: PropertyFilters = {};
let globalUserCoords: { lat: number; lng: number } | null = null;
let globalRawData: any[] = [];
let globalLoading = true;
let globalError: string | null = null;

const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());

export const useProperties = (): UsePropertiesResult => {
    const [, forceRender] = useState(0);

    // Subscribe to global state changes
    useEffect(() => {
        const handler = () => forceRender(t => t + 1);
        listeners.add(handler);
        return () => { listeners.delete(handler); };
    }, []);

    const setFilters = useCallback((updater: PropertyFilters | ((prev: PropertyFilters) => PropertyFilters)) => {
        globalFilters = typeof updater === 'function' ? updater(globalFilters) : updater;
        notify();
    }, []);

    const setUserCoords = useCallback((coords: { lat: number; lng: number } | null) => {
        globalUserCoords = coords;
        notify();
    }, []);

    const refetch = useCallback(() => {
        const cacheKey = `${globalFilters.jenisPerumahan || 'terbaru'}-${globalFilters.limit || 10}`;
        delete apiCache[cacheKey];
        notify();
    }, []);

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            const cacheKey = `${globalFilters.jenisPerumahan || 'terbaru'}-${globalFilters.limit || 10}`;

            // Check cache (valid for 5 minutes)
            if (apiCache[cacheKey] && Date.now() - apiCache[cacheKey].timestamp < 5 * 60 * 1000) {
                if (globalRawData !== apiCache[cacheKey].rawData || globalLoading) {
                    globalRawData = apiCache[cacheKey].rawData;
                    globalLoading = false;
                    globalError = null;
                    notify();
                }
                return;
            }

            globalLoading = true;
            globalError = null;
            notify();

            try {
                const params = new URLSearchParams({
                    page: '1',
                    limit: (globalFilters.limit || 10).toString(),
                });

                if (globalFilters.jenisPerumahan === 'Rumah Susun') {
                    params.append('selectedSearch', 'wilayah');
                    params.append('skalaPerumahan', 'semua');
                    params.append('sort', 'susun-dahulu');
                    params.append('searchBy', 'nama-perumahan');
                } else if (globalFilters.jenisPerumahan === 'Rumah Tapak') {
                    params.append('selectedSearch', 'wilayah');
                    params.append('skalaPerumahan', 'semua');
                    params.append('sort', 'tapak-dahulu');
                    params.append('searchBy', 'nama-perumahan');
                } else {
                    params.append('sort', 'terbaru');
                }

                const res = await fetch(`/api/properties/search?${params.toString()}`, {
                    headers: { Accept: 'application/json' },
                });
                
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json: TaperaApiResponse = await res.json();
                
                if (!cancelled) {
                    const rawData = json.data ?? [];
                    apiCache[cacheKey] = { rawData, timestamp: Date.now() };
                    globalRawData = rawData;
                    globalError = null;
                }
            } catch (err) {
                if (!cancelled) {
                    globalError = err instanceof Error ? err.message : 'Gagal memuat data';
                }
            } finally {
                if (!cancelled) {
                    globalLoading = false;
                    notify();
                }
            }
        };

        fetchData();
        return () => { cancelled = true; };
    }, [globalFilters.jenisPerumahan, globalFilters.limit]); 

    const { properties, wilayahOptions } = useMemo(() => {
        let mapped = globalRawData
            .map(mapToProperty)
            .filter((p): p is Property => p !== null);

        const provSet = new Set<string>();
        const kabByProv: { [prov: string]: Set<string> } = {};
        const kecByKab: { [kab: string]: Set<string> } = {};
        
        globalRawData.forEach(item => {
            const { provinsi, kabupaten, kecamatan } = item.wilayah ?? {};
            if (provinsi) {
                provSet.add(provinsi);
                if (!kabByProv[provinsi]) kabByProv[provinsi] = new Set();
                if (kabupaten) {
                    kabByProv[provinsi].add(kabupaten);
                    if (!kecByKab[kabupaten]) kecByKab[kabupaten] = new Set();
                    if (kecamatan) kecByKab[kabupaten].add(kecamatan);
                }
            }
        });
        
        const wOptions = {
            provinsi: [...provSet].sort(),
            kabKota: Object.fromEntries(Object.entries(kabByProv).map(([k, v]) => [k, [...v].sort()])),
            kecamatan: Object.fromEntries(Object.entries(kecByKab).map(([k, v]) => [k, [...v].sort()])),
        };

        if (globalFilters.keyword) {
            const kw = globalFilters.keyword.toLowerCase();
            mapped = mapped.filter(p =>
                p.title.toLowerCase().includes(kw) ||
                p.location.toLowerCase().includes(kw)
            );
        }
        if (globalFilters.provinsi) {
            const prov = globalFilters.provinsi.toLowerCase();
            mapped = mapped.filter(p => p.location.toLowerCase().includes(prov));
        }
        if (globalFilters.kabKota) {
            const kab = globalFilters.kabKota.toLowerCase();
            mapped = mapped.filter(p => p.location.toLowerCase().includes(kab));
        }
        if (globalFilters.kecamatan) {
            const kec = globalFilters.kecamatan.toLowerCase();
            mapped = mapped.filter(p => p.location.toLowerCase().includes(kec));
        }
        if (globalFilters.jenisPerumahan) {
            const jp = globalFilters.jenisPerumahan.toLowerCase();
            mapped = mapped.filter(p => {
                const pType = (p as any).jenisPerumahan?.toLowerCase() || '';
                return pType.includes(jp);
            });
        }
        if (globalFilters.tipeProperti) {
            const tp = globalFilters.tipeProperti.toLowerCase();
            mapped = mapped.filter(p => p.type.toLowerCase().includes(tp));
        }

        if (globalUserCoords) {
            mapped = mapped.map(p => {
                const dist = calculateDistance(
                    globalUserCoords!.lat,
                    globalUserCoords!.lng,
                    p.coordinates.lat,
                    p.coordinates.lng
                );
                return {
                    ...p,
                    distance: dist,
                    features: [...p.features, `${dist.toFixed(1)} km dari Anda`]
                };
            });

            if (globalFilters.sortByDistance) {
                mapped.sort((a, b) => (a.distance || 0) - (b.distance || 0));
            }
        }

        return { properties: mapped, wilayahOptions: wOptions };
    }, [globalRawData, globalFilters, globalUserCoords]);

    return {
        properties,
        loading: globalLoading,
        error: globalError,
        filters: globalFilters,
        setFilters,
        refetch,
        userCoords: globalUserCoords,
        setUserCoords,
        wilayahOptions
    };
};
