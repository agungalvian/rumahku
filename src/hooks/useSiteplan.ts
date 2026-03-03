import { useState, useEffect } from 'react';

export interface SiteplanDetail {
    siteplan: string | null;   // URL to siteplan image
    fotoDenah: string | null;  // floor plan from first tipeRumah
    fotoTampak: string | null; // front view from first tipeRumah
}

export const useSiteplan = (idLokasi: string): {
    data: SiteplanDetail | null;
    loading: boolean;
    error: string | null;
} => {
    const [data, setData] = useState<SiteplanDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!idLokasi) return;
        let cancelled = false;
        setLoading(true);
        setData(null);
        setError(null);

        fetch(`/api/tapera/lokasi-perumahan/${idLokasi}/json`, {
            headers: { Accept: 'application/json' },
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((json: any) => {
                if (cancelled) return;
                const detail = json?.detail ?? {};
                const tipe = detail?.tipeRumah?.[0] ?? {};
                setData({
                    siteplan: detail.siteplan || null,
                    fotoDenah: tipe.fotoDenah || null,
                    fotoTampak: tipe.fotoTampak || null,
                });
            })
            .catch(err => {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Error');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [idLokasi]);

    return { data, loading, error };
};
