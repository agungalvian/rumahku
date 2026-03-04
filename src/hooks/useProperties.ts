import { useState, useEffect } from 'react';
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
    if (path.startsWith('http')) return path;
    return `https://sikumbang.tapera.go.id${path}`;
};

const mapToProperty = (lokasi: TaperaLokasi): Property | null => {
    const tipe =
        lokasi.tipeRumah.find(t => t.status === 'subsidi') ??
        lokasi.tipeRumah.find(t => t.status === 'komersil') ??
        lokasi.tipeRumah[0];

    if (!tipe) return null;

    const { kecamatan, kabupaten, provinsi } = lokasi.wilayah;
    const location = [kecamatan, kabupaten, provinsi].filter(Boolean).join(', ');

    const [latStr, lngStr] = (lokasi.koordinatPerumahan ?? '').split(',');
    const lat = parseFloat(latStr) || 0;
    const lng = parseFloat(lngStr) || 0;

    const galleryUrls = [
        ...lokasi.foto,
        tipe.fotoTampak ? toImageUrl(tipe.fotoTampak) : '',
        tipe.fotoDenah ? toImageUrl(tipe.fotoDenah) : '',
    ].filter(Boolean);

    const facilities: string[] = [];
    if (tipe.spesifikasiAtap) facilities.push(`Atap: ${tipe.spesifikasiAtap}`);
    if (tipe.spesifikasiDinding) facilities.push(`Dinding: ${tipe.spesifikasiDinding}`);
    if (tipe.spesifikasiLantai) facilities.push(`Lantai: ${tipe.spesifikasiLantai}`);
    if (tipe.spesifikasiPondasi) facilities.push(`Pondasi: ${tipe.spesifikasiPondasi}`);

    const type = mapStatus(tipe.status);

    const features: string[] = [
        type === 'Subsidi' ? 'Subsidi Pemerintah' : 'Komersial',
        `${lokasi.pengembang?.asosiasi ?? ''}`.trim() || null,
        lokasi.jumlahUnit > 0 ? `${lokasi.jumlahUnit} Unit Tersedia` : null,
    ].filter((f): f is string => Boolean(f));

    return {
        id: lokasi.idLokasi,
        title: lokasi.namaPerumahan,
        type,
        price: tipe.harga,
        location,
        coordinates: { lat, lng },
        specifications: {
            bedrooms: Math.max(tipe.kamarTidur, 0),
            bathrooms: Math.max(tipe.kamarMandi, 0),
            landArea: tipe.luasTanah,
            buildArea: tipe.luasBangunan,
        },
        facilities: facilities.slice(0, 4),
        imageUrl: lokasi.foto[0] ?? toImageUrl(tipe.fotoTampak),
        galleryUrls,
        features,
        isPromo: false,
        developerName: lokasi.pengembang?.nama,
        phoneContact: lokasi.kantorPemasaran?.[0]?.noTelp,
    } as Property & { developerName?: string; phoneContact?: string };
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
    sortByDistance?: boolean;
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

export const useProperties = (): UsePropertiesResult => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<PropertyFilters>({});
    const [wilayahOptions, setWilayahOptions] = useState<WilayahOptions>({ provinsi: [], kabKota: {}, kecamatan: {} });
    const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [tick, setTick] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({
                    sort: 'terbaru',
                    page: '1',
                    limit: '100',
                });

                // NOTE: Tapera API ignores all filter params — all filtering is done client-side.

                const res = await fetch(`/api/tapera/ajax/lokasi/search?${params.toString()}`, {
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json: TaperaApiResponse = await res.json();
                if (!cancelled) {
                    const rawData = json.data ?? [];
                    let mapped = rawData
                        .map(mapToProperty)
                        .filter((p): p is Property => p !== null);

                    // ── Build wilayah options from raw API data ─────────────
                    const provSet = new Set<string>();
                    const kabByProv: { [prov: string]: Set<string> } = {};
                    const kecByKab: { [kab: string]: Set<string> } = {};
                    rawData.forEach(item => {
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
                    setWilayahOptions({
                        provinsi: [...provSet].sort(),
                        kabKota: Object.fromEntries(Object.entries(kabByProv).map(([k, v]) => [k, [...v].sort()])),
                        kecamatan: Object.fromEntries(Object.entries(kecByKab).map(([k, v]) => [k, [...v].sort()])),
                    });

                    // ── Client-side filtering ──────────────────────────────
                    if (filters.keyword) {
                        const kw = filters.keyword.toLowerCase();
                        mapped = mapped.filter(p =>
                            p.title.toLowerCase().includes(kw) ||
                            p.location.toLowerCase().includes(kw)
                        );
                    }
                    if (filters.provinsi) {
                        const prov = filters.provinsi.toLowerCase();
                        mapped = mapped.filter(p => p.location.toLowerCase().includes(prov));
                    }
                    if (filters.kabKota) {
                        const kab = filters.kabKota.toLowerCase();
                        mapped = mapped.filter(p => p.location.toLowerCase().includes(kab));
                    }
                    if (filters.kecamatan) {
                        const kec = filters.kecamatan.toLowerCase();
                        mapped = mapped.filter(p => p.location.toLowerCase().includes(kec));
                    }

                    // Inject distance if userCoords available
                    if (userCoords) {
                        mapped = mapped.map(p => {
                            const dist = calculateDistance(
                                userCoords.lat,
                                userCoords.lng,
                                p.coordinates.lat,
                                p.coordinates.lng
                            );
                            return {
                                ...p,
                                distance: dist,
                                features: [...p.features, `${dist.toFixed(1)} km dari Anda`]
                            };
                        });

                        if (filters.sortByDistance) {
                            mapped.sort((a, b) => (a.distance || 0) - (b.distance || 0));
                        }
                    }

                    setProperties(mapped);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Gagal memuat data');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();
        return () => { cancelled = true; };
    }, [tick, filters, userCoords]);

    const refetch = () => setTick(t => t + 1);

    return { properties, loading, error, refetch, setFilters, filters, userCoords, setUserCoords, wilayahOptions };

};
