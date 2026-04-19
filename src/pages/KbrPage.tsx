import React, { useState, useMemo } from 'react';
import { ArrowLeft, Hammer, ChevronDown, ChevronUp, FileText, Phone, CheckCircle2, Calculator } from 'lucide-react';

interface KbrPageProps {
    onNavigate: (page: string) => void;
}

const rabData = [
    {
        wilayah: 'Jabodetabek',
        provinsi: ['DKI Jakarta', 'Bogor', 'Depok', 'Tangerang', 'Bekasi'],
        biayaPerM2: 4_000_000,
        items: [
            { uraian: 'Pondasi & Struktur', persen: 35 },
            { uraian: 'Dinding & Plesteran', persen: 20 },
            { uraian: 'Atap', persen: 15 },
            { uraian: 'Mekanikal & Elektrikal', persen: 12 },
            { uraian: 'Finishing & Kusen', persen: 13 },
            { uraian: 'Biaya Tidak Terduga', persen: 5 },
        ],
    },
    {
        wilayah: 'Jawa (non-Jabodetabek)',
        provinsi: ['Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'DI Yogyakarta', 'Banten'],
        biayaPerM2: 3_200_000,
        items: [
            { uraian: 'Pondasi & Struktur', persen: 35 },
            { uraian: 'Dinding & Plesteran', persen: 20 },
            { uraian: 'Atap', persen: 15 },
            { uraian: 'Mekanikal & Elektrikal', persen: 12 },
            { uraian: 'Finishing & Kusen', persen: 13 },
            { uraian: 'Biaya Tidak Terduga', persen: 5 },
        ],
    },
    {
        wilayah: 'Sumatera',
        provinsi: ['Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Jambi', 'Sumatera Selatan', 'Bengkulu', 'Lampung'],
        biayaPerM2: 3_000_000,
        items: [
            { uraian: 'Pondasi & Struktur', persen: 35 },
            { uraian: 'Dinding & Plesteran', persen: 20 },
            { uraian: 'Atap', persen: 16 },
            { uraian: 'Mekanikal & Elektrikal', persen: 11 },
            { uraian: 'Finishing & Kusen', persen: 13 },
            { uraian: 'Biaya Tidak Terduga', persen: 5 },
        ],
    },
    {
        wilayah: 'Kalimantan',
        provinsi: ['Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara'],
        biayaPerM2: 3_500_000,
        items: [
            { uraian: 'Pondasi & Struktur', persen: 36 },
            { uraian: 'Dinding & Plesteran', persen: 19 },
            { uraian: 'Atap', persen: 15 },
            { uraian: 'Mekanikal & Elektrikal', persen: 12 },
            { uraian: 'Finishing & Kusen', persen: 13 },
            { uraian: 'Biaya Tidak Terduga', persen: 5 },
        ],
    },
    {
        wilayah: 'Sulawesi',
        provinsi: ['Sulawesi Utara', 'Sulawesi Tengah', 'Sulawesi Selatan', 'Sulawesi Tenggara', 'Gorontalo', 'Sulawesi Barat'],
        biayaPerM2: 3_300_000,
        items: [
            { uraian: 'Pondasi & Struktur', persen: 35 },
            { uraian: 'Dinding & Plesteran', persen: 20 },
            { uraian: 'Atap', persen: 15 },
            { uraian: 'Mekanikal & Elektrikal', persen: 12 },
            { uraian: 'Finishing & Kusen', persen: 13 },
            { uraian: 'Biaya Tidak Terduga', persen: 5 },
        ],
    },
    {
        wilayah: 'Papua & Maluku',
        provinsi: ['Papua', 'Papua Barat', 'Maluku', 'Maluku Utara'],
        biayaPerM2: 4_500_000,
        items: [
            { uraian: 'Pondasi & Struktur', persen: 36 },
            { uraian: 'Dinding & Plesteran', persen: 19 },
            { uraian: 'Atap', persen: 15 },
            { uraian: 'Mekanikal & Elektrikal', persen: 12 },
            { uraian: 'Finishing & Kusen', persen: 13 },
            { uraian: 'Biaya Tidak Terduga', persen: 5 },
        ],
    },
    {
        wilayah: 'Nusa Tenggara & Bali',
        provinsi: ['Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur'],
        biayaPerM2: 3_100_000,
        items: [
            { uraian: 'Pondasi & Struktur', persen: 35 },
            { uraian: 'Dinding & Plesteran', persen: 20 },
            { uraian: 'Atap', persen: 16 },
            { uraian: 'Mekanikal & Elektrikal', persen: 11 },
            { uraian: 'Finishing & Kusen', persen: 13 },
            { uraian: 'Biaya Tidak Terduga', persen: 5 },
        ],
    },
];

const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const COLORS = ['var(--primary)', '#0891B2', '#7C3AED', '#059669', '#D97706', '#DC2626'];

const KbrPage: React.FC<KbrPageProps> = ({ onNavigate }) => {
    const [selectedWilayahIdx, setSelectedWilayahIdx] = useState(0);
    const [luas, setLuas] = useState<string>('36');
    const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showCalc, setShowCalc] = useState(true);

    const luasNum = Math.max(1, parseFloat(luas) || 0);
    const selectedRab = rabData[selectedWilayahIdx];
    const totalBiaya = useMemo(() => selectedRab.biayaPerM2 * luasNum, [selectedRab, luasNum]);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', paddingBottom: '100px' }}>

            {/* Header */}
            <div style={{ background: 'var(--primary)', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                    <button
                        onClick={() => onNavigate('home')}
                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={20} color="white" />
                    </button>
                    <div>
                        <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>KBR — Kredit Bangun Rumah</h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', margin: 0 }}>Kalkulator RAB Pembangunan</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Bunga Rendah', 'Tenor s/d 15 Thn', 'Maks. Rp 300 Jt'].map(c => (
                        <span key={c} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600 }}>{c}</span>
                    ))}
                </div>
            </div>

            <div style={{ padding: '1rem' }}>

                {/* ── KALKULATOR RAB ──────────────────────────────────────── */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(91,178,74,0.10)', marginBottom: '1rem', border: '1.5px solid var(--primary-light)' }}>
                    {/* Section toggle header */}
                    <button
                        onClick={() => setShowCalc(v => !v)}
                        style={{ width: '100%', background: 'var(--primary-light)', border: 'none', padding: '0.875rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--primary-dark)', fontSize: '0.9rem' }}>
                            <Calculator size={18} color="var(--primary)" /> Kalkulator RAB
                        </span>
                        {showCalc ? <ChevronUp size={18} color="var(--primary)" /> : <ChevronDown size={18} color="var(--primary)" />}
                    </button>

                    {showCalc && (
                        <div style={{ padding: '1rem' }}>
                            {/* Wilayah selector */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Pilih Wilayah</label>
                                <select
                                    value={selectedWilayahIdx}
                                    onChange={e => setSelectedWilayahIdx(Number(e.target.value))}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '0.875rem', backgroundColor: '#F9FAFB', color: '#111827' }}
                                >
                                    {rabData.map((r, i) => (
                                        <option key={i} value={i}>{r.wilayah} — {fmt(r.biayaPerM2)}/m²</option>
                                    ))}
                                </select>
                                {/* Provinsi chips */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                                    {selectedRab.provinsi.map(p => (
                                        <span key={p} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 600 }}>{p}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Luas input */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Luas Bangunan (m²)</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button onClick={() => setLuas(v => String(Math.max(1, (parseFloat(v) || 0) - 1)))}
                                        style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1.5px solid #E5E7EB', background: '#F9FAFB', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 700 }}>−</button>
                                    <input
                                        type="number"
                                        min={1}
                                        max={500}
                                        value={luas}
                                        onChange={e => setLuas(e.target.value)}
                                        style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: '1.5px solid var(--primary)', fontSize: '1.1rem', fontWeight: 700, textAlign: 'center', color: '#111827' }}
                                    />
                                    <button onClick={() => setLuas(v => String((parseFloat(v) || 0) + 1))}
                                        style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1.5px solid #E5E7EB', background: '#F9FAFB', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 700 }}>+</button>
                                </div>
                                {/* Quick presets */}
                                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                    {[21, 36, 45, 54, 60, 72].map(l => (
                                        <button key={l} onClick={() => setLuas(String(l))}
                                            style={{ flex: 1, padding: '5px 0', borderRadius: '8px', border: '1px solid', borderColor: luasNum === l ? 'var(--primary)' : '#E5E7EB', backgroundColor: luasNum === l ? 'var(--primary-light)' : '#F9FAFB', color: luasNum === l ? 'var(--primary)' : '#6B7280', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}>
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Hasil total */}
                            <div style={{ background: 'var(--gradient-primary)', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1rem', color: 'white' }}>
                                <p style={{ fontSize: '0.72rem', opacity: 0.8, margin: '0 0 2px' }}>Estimasi Total RAB</p>
                                <p style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>{fmt(totalBiaya)}</p>
                                <p style={{ fontSize: '0.7rem', opacity: 0.75, margin: '4px 0 0' }}>
                                    {luasNum} m² × {fmt(selectedRab.biayaPerM2)}/m²  ·  Wilayah {selectedRab.wilayah}
                                </p>
                            </div>

                            {/* Breakdown per item */}
                            <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '0.65rem' }}>Rincian Biaya per Komponen</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {selectedRab.items.map((item, i) => {
                                    const biaya = Math.round(totalBiaya * item.persen / 100);
                                    const barW = item.persen + '%';
                                    return (
                                        <div key={i}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                                <span style={{ fontSize: '0.78rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: COLORS[i % COLORS.length], display: 'inline-block' }} />
                                                    {item.uraian}
                                                </span>
                                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111827' }}>{fmt(biaya)}</span>
                                            </div>
                                            <div style={{ height: '6px', backgroundColor: '#F3F4F6', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: barW, backgroundColor: COLORS[i % COLORS.length], borderRadius: '3px', transition: 'width 0.3s' }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <p style={{ fontSize: '0.68rem', color: '#9CA3AF', marginTop: '0.75rem' }}>* Estimasi berdasarkan standar biaya konstruksi BP Tapera. Bisa berbeda sesuai spesifikasi material.</p>
                        </div>
                    )}
                </div>

                {/* Persyaratan */}
                <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '1rem', marginBottom: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F2937', marginBottom: '0.75rem' }}>Persyaratan Umum</h3>
                    {[
                        'Peserta Tapera aktif min. 12 bulan',
                        'WNI dan berdomisili di Indonesia',
                        'Belum memiliki/sedang kredit properti',
                        'Memiliki lahan yang sah secara hukum',
                    ].map(s => (
                        <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                            <CheckCircle2 size={15} color="var(--primary)" style={{ marginTop: '1px', flexShrink: 0 }} />
                            <p style={{ fontSize: '0.82rem', color: '#374151', margin: 0 }}>{s}</p>
                        </div>
                    ))}
                </div>

                {/* Standar biaya per wilayah — accordion referensi */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1F2937', margin: 0 }}>
                        <FileText size={15} style={{ verticalAlign: 'middle', marginRight: '6px', color: 'var(--primary)' }} />
                        Standar Biaya per Wilayah
                    </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                    {rabData.map((rab, idx) => {
                        const isOpen = expandedIdx === idx;
                        return (
                            <div key={idx} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: isOpen ? '2px solid var(--primary)' : '2px solid transparent', transition: 'border 0.2s' }}>
                                <button
                                    onClick={() => setExpandedIdx(isOpen ? null : idx)}
                                    style={{ width: '100%', padding: '0.875rem 1rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ fontWeight: 700, color: '#111827', fontSize: '0.875rem', margin: 0 }}>{rab.wilayah}</p>
                                        <p style={{ fontSize: '0.72rem', color: '#6B7280', margin: '2px 0 0' }}>{fmt(rab.biayaPerM2)} / m²</p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button
                                            onClick={e => { e.stopPropagation(); setSelectedWilayahIdx(idx); setShowCalc(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                            style={{ padding: '4px 10px', fontSize: '0.68rem', fontWeight: 700, borderRadius: '20px', border: 'none', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', cursor: 'pointer' }}
                                        >
                                            Pakai
                                        </button>
                                        {isOpen ? <ChevronUp size={16} color="var(--primary)" /> : <ChevronDown size={16} color="#9CA3AF" />}
                                    </div>
                                </button>
                                {isOpen && (
                                    <div style={{ padding: '0 1rem 1rem', borderTop: '1px solid #F3F4F6' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '0.75rem', paddingTop: '0.75rem' }}>
                                            {rab.provinsi.map(p => (
                                                <span key={p} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 600 }}>{p}</span>
                                            ))}
                                        </div>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#F9FAFB' }}>
                                                    <th style={{ textAlign: 'left', padding: '7px 8px', color: '#6B7280', fontWeight: 600, borderBottom: '1px solid #E5E7EB' }}>Komponen</th>
                                                    <th style={{ textAlign: 'right', padding: '7px 8px', color: '#6B7280', fontWeight: 600, borderBottom: '1px solid #E5E7EB' }}>%</th>
                                                    <th style={{ textAlign: 'right', padding: '7px 8px', color: '#6B7280', fontWeight: 600, borderBottom: '1px solid #E5E7EB' }}>Biaya/m²</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rab.items.map((item, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                                                        <td style={{ padding: '7px 8px', color: '#374151' }}>{item.uraian}</td>
                                                        <td style={{ padding: '7px 8px', textAlign: 'right', color: '#6B7280' }}>{item.persen}%</td>
                                                        <td style={{ padding: '7px 8px', textAlign: 'right', color: 'var(--primary-dark)', fontWeight: 600 }}>
                                                            {fmt(Math.round(rab.biayaPerM2 * item.persen / 100))}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Fixed CTA */}
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: '480px', margin: '0 auto', backgroundColor: 'white', borderTop: '1px solid #E5E7EB', padding: '1rem', zIndex: 50, boxShadow: '0 -4px 16px rgba(0,0,0,0.08)' }}>
                <button
                    onClick={() => setShowModal(true)}
                    style={{ width: '100%', padding: '1rem', borderRadius: '30px', background: 'var(--gradient-primary)', color: 'white', border: 'none', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(91,178,74,0.35)' }}
                >
                    <Hammer size={20} /> Ajukan KBR Sekarang
                </button>
            </div>

            {/* Modal */}
            {showModal && (
                <>
                    <div onClick={() => setShowModal(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 60, backdropFilter: 'blur(2px)' }} />
                    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: '480px', margin: '0 auto', backgroundColor: 'white', borderRadius: '20px 20px 0 0', zIndex: 70, padding: '1.5rem 1.25rem 2.5rem', boxShadow: '0 -4px 30px rgba(0,0,0,0.15)' }}>
                        <div style={{ width: '40px', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', margin: '0 auto 1.25rem' }} />
                        <h2 style={{ fontWeight: 800, fontSize: '1rem', color: '#111827', marginBottom: '0.5rem' }}>Pengajuan KBR</h2>

                        {/* Ringkasan estimasi */}
                        <div style={{ backgroundColor: 'var(--primary-light)', borderRadius: '12px', padding: '0.875rem 1rem', marginBottom: '1rem' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--primary-dark)', fontWeight: 600, margin: '0 0 4px' }}>Estimasi RAB Anda</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>{fmt(totalBiaya)}</p>
                            <p style={{ fontSize: '0.7rem', color: '#6B7280', margin: '2px 0 0' }}>{luasNum} m² · {selectedRab.wilayah}</p>
                        </div>

                        <p style={{ fontSize: '0.82rem', color: '#6B7280', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                            Silakan hubungi kantor BP Tapera terdekat atau call center kami untuk memulai proses pengajuan.
                        </p>
                        <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                            <p style={{ fontSize: '0.8rem', color: '#374151', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                <Phone size={15} color="var(--primary)" /> Call Center BP Tapera
                            </p>
                            <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '4px 0 0' }}>1500 662</p>
                            <p style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>Senin – Jumat, 08.00 – 17.00 WIB</p>
                        </div>
                        <a href="tel:1500662" style={{ display: 'block', textAlign: 'center', width: '100%', padding: '0.875rem', borderRadius: '30px', background: 'var(--gradient-primary)', color: 'white', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none' }}>
                            Hubungi Sekarang
                        </a>
                        <button onClick={() => setShowModal(false)} style={{ marginTop: '0.75rem', width: '100%', padding: '0.875rem', borderRadius: '30px', border: '1.5px solid #E5E7EB', background: 'none', fontWeight: 600, fontSize: '0.9rem', color: '#6B7280', cursor: 'pointer' }}>
                            Tutup
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default KbrPage;
