import React, { useState } from 'react';
import { ArrowLeft, Search, User, Hash, CheckCircle2, XCircle, Clock, AlertCircle, ChevronRight } from 'lucide-react';

interface EklaimPageProps {
    onNavigate: (page: string) => void;
}

type StatusResult = {
    nama: string;
    nip: string;
    status: 'diproses' | 'selesai' | 'ditolak' | 'verifikasi';
    noKlaim: string;
    tglPengajuan: string;
    tglEstimasi?: string;
    keterangan: string;
    jumlah?: number;
};

// Simulasi data — in production, would call a real API
const mockDatabase: Record<string, StatusResult> = {
    '197804152003121001': {
        nama: 'BUDI SANTOSO',
        nip: '197804152003121001',
        status: 'selesai',
        noKlaim: 'EKL-2024-00123',
        tglPengajuan: '15 Jan 2024',
        keterangan: 'Pengembalian tabungan telah selesai dicairkan.',
        jumlah: 48_750_000,
    },
    '198512202010012005': {
        nama: 'RINA WULANDARI',
        nip: '198512202010012005',
        status: 'diproses',
        noKlaim: 'EKL-2024-00287',
        tglPengajuan: '02 Mar 2024',
        tglEstimasi: '02 Apr 2024',
        keterangan: 'Dokumen sedang diverifikasi oleh tim BP Tapera.',
    },
    '199001052015041002': {
        nama: 'AHMAD FAUZI',
        nip: '199001052015041002',
        status: 'verifikasi',
        noKlaim: 'EKL-2024-00341',
        tglPengajuan: '20 Feb 2024',
        tglEstimasi: '20 Mar 2024',
        keterangan: 'Menunggu kelengkapan dokumen pendukung.',
    },
    '197601012001121003': {
        nama: 'SITI RAHAYU',
        nip: '197601012001121003',
        status: 'ditolak',
        noKlaim: 'EKL-2024-00045',
        tglPengajuan: '05 Nov 2023',
        keterangan: 'Pengajuan ditolak karena masa kepesertaan < 12 bulan. Silakan hubungi call center.',
    },
};

const fmt = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const statusConfig = {
    selesai: {
        label: 'Selesai Dicairkan',
        color: '#059669',
        bg: '#ECFDF5',
        border: '#A7F3D0',
        Icon: CheckCircle2,
    },
    diproses: {
        label: 'Sedang Diproses',
        color: '#D97706',
        bg: '#FFFBEB',
        border: '#FDE68A',
        Icon: Clock,
    },
    verifikasi: {
        label: 'Menunggu Verifikasi',
        color: '#2563EB',
        bg: '#EFF6FF',
        border: '#BFDBFE',
        Icon: AlertCircle,
    },
    ditolak: {
        label: 'Ditolak',
        color: '#DC2626',
        bg: '#FEF2F2',
        border: '#FECACA',
        Icon: XCircle,
    },
};

const EklaimPage: React.FC<EklaimPageProps> = ({ onNavigate }) => {
    const [nama, setNama] = useState('');
    const [nip, setNip] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<StatusResult | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleCek = () => {
        if (!nama.trim() || !nip.trim()) return;
        setLoading(true);
        setResult(null);
        setNotFound(false);
        setSubmitted(true);

        // Simulate API latency
        setTimeout(() => {
            const found = mockDatabase[nip.trim()];
            if (found && found.nama === nama.trim().toUpperCase()) {
                setResult(found);
            } else {
                setNotFound(true);
            }
            setLoading(false);
        }, 1200);
    };

    const handleReset = () => {
        setNama('');
        setNip('');
        setResult(null);
        setNotFound(false);
        setSubmitted(false);
    };

    const cfg = result ? statusConfig[result.status] : null;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', paddingBottom: '32px' }}>

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.25rem' }}>
                    <button
                        onClick={() => onNavigate('home')}
                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                        <ArrowLeft size={20} color="white" />
                    </button>
                    <div>
                        <h1 style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', margin: 0 }}>E-Klaim Tapera</h1>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', margin: 0 }}>Cek Status Pengembalian Tabungan</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Cepat & Mudah', 'Real-time', 'Aman & Terenkripsi'].map(c => (
                        <span key={c} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600 }}>{c}</span>
                    ))}
                </div>
            </div>

            <div style={{ padding: '1rem' }}>

                {/* Form Card */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(14,165,233,0.10)', border: '1.5px solid #E0F2FE', marginBottom: '1rem' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0C4A6E', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Search size={17} color="#0EA5E9" /> Form Cek Status
                    </h2>

                    {/* Nama */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            Nama Lengkap <span style={{ color: '#6B7280', fontWeight: 400 }}>(tanpa gelar)</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Contoh: BUDI SANTOSO"
                                value={nama}
                                onChange={e => setNama(e.target.value.toUpperCase())}
                                style={{
                                    width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                    borderRadius: '10px', border: '1.5px solid #E5E7EB',
                                    fontSize: '0.875rem', color: '#111827',
                                    boxSizing: 'border-box', letterSpacing: '0.02em',
                                }}
                            />
                        </div>
                        <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '4px' }}>Masukkan nama sesuai data kepegawaian, huruf kapital</p>
                    </div>

                    {/* NIP */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                            NIP <span style={{ color: '#6B7280', fontWeight: 400 }}>(Nomor Induk Pegawai)</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Hash size={16} color="#9CA3AF" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="number"
                                placeholder="Contoh: 197804152003121001"
                                value={nip}
                                onChange={e => setNip(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                                    borderRadius: '10px', border: '1.5px solid #E5E7EB',
                                    fontSize: '0.875rem', color: '#111827',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>
                        <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '4px' }}>18 digit NIP tanpa spasi</p>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={handleCek}
                            disabled={!nama.trim() || !nip.trim() || loading}
                            style={{
                                flex: 1, padding: '0.875rem', borderRadius: '30px',
                                background: (!nama.trim() || !nip.trim() || loading)
                                    ? '#E5E7EB'
                                    : 'linear-gradient(135deg, #0EA5E9, #0284C7)',
                                color: (!nama.trim() || !nip.trim() || loading) ? '#9CA3AF' : 'white',
                                border: 'none', fontSize: '0.95rem', fontWeight: 700,
                                cursor: (!nama.trim() || !nip.trim() || loading) ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                transition: 'all 0.2s',
                                boxShadow: (!nama.trim() || !nip.trim() || loading) ? 'none' : '0 4px 12px rgba(14,165,233,0.35)',
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                                    Mengecek...
                                </>
                            ) : (
                                <><Search size={18} /> Cek Status</>
                            )}
                        </button>
                        {submitted && (
                            <button
                                onClick={handleReset}
                                style={{ padding: '0.875rem 1.25rem', borderRadius: '30px', border: '1.5px solid #E5E7EB', background: 'none', fontSize: '0.85rem', fontWeight: 600, color: '#6B7280', cursor: 'pointer' }}
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Loading skeleton */}
                {loading && (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                        {[80, 60, 90, 50].map((w, i) => (
                            <div key={i} style={{ height: '14px', backgroundColor: '#F3F4F6', borderRadius: '7px', marginBottom: '12px', width: w + '%', animation: 'pulse 1.5s infinite' }} />
                        ))}
                    </div>
                )}

                {/* Result */}
                {!loading && result && cfg && (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                        {/* Status banner */}
                        <div style={{ backgroundColor: cfg.bg, borderBottom: `1px solid ${cfg.border}`, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <cfg.Icon size={28} color={cfg.color} />
                            <div>
                                <p style={{ fontWeight: 800, color: cfg.color, fontSize: '1rem', margin: 0 }}>{cfg.label}</p>
                                <p style={{ fontSize: '0.72rem', color: '#6B7280', margin: '2px 0 0' }}>No. Klaim: {result.noKlaim}</p>
                            </div>
                        </div>

                        {/* Detail rows */}
                        <div style={{ padding: '1rem 1.25rem' }}>
                            {[
                                { label: 'Nama', value: result.nama },
                                { label: 'NIP', value: result.nip },
                                { label: 'Tanggal Pengajuan', value: result.tglPengajuan },
                                ...(result.tglEstimasi ? [{ label: 'Estimasi Selesai', value: result.tglEstimasi }] : []),
                                ...(result.jumlah ? [{ label: 'Jumlah Pengembalian', value: fmt(result.jumlah), highlight: true }] : []),
                            ].map((row, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: i === 0 ? 0 : '10px', paddingBottom: '10px', borderBottom: '1px solid #F3F4F6' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 500 }}>{row.label}</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: (row as any).highlight ? 800 : 600, color: (row as any).highlight ? '#059669' : '#111827', textAlign: 'right', maxWidth: '60%' }}>
                                        {row.value}
                                    </span>
                                </div>
                            ))}

                            {/* Keterangan */}
                            <div style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: '10px', padding: '0.875rem', marginTop: '1rem' }}>
                                <p style={{ fontSize: '0.78rem', color: cfg.color, fontWeight: 600, margin: '0 0 4px' }}>Keterangan</p>
                                <p style={{ fontSize: '0.8rem', color: '#374151', margin: 0, lineHeight: 1.5 }}>{result.keterangan}</p>
                            </div>

                            {/* Hubungi jika masalah */}
                            <button
                                style={{ marginTop: '1rem', width: '100%', padding: '0.875rem', borderRadius: '12px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => window.open('tel:1500662')}
                            >
                                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>Butuh bantuan? Hubungi Call Center</span>
                                <ChevronRight size={16} color="#9CA3AF" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Not found */}
                {!loading && notFound && (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '2rem 1.5rem', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                        <div style={{ width: '64px', height: '64px', backgroundColor: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <XCircle size={32} color="#DC2626" />
                        </div>
                        <h3 style={{ fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Data Tidak Ditemukan</h3>
                        <p style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.6 }}>
                            Kombinasi Nama dan NIP yang Anda masukkan tidak ditemukan. Pastikan nama diisi tanpa gelar dan NIP sesuai data kepegawaian.
                        </p>
                        <a href="tel:1500662" style={{ display: 'inline-block', marginTop: '1rem', padding: '0.75rem 1.5rem', borderRadius: '30px', backgroundColor: '#0EA5E9', color: 'white', fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none' }}>
                            Hubungi Call Center
                        </a>
                    </div>
                )}

                {/* Info syarat */}
                {!submitted && (
                    <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                        <h3 style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0C4A6E', marginBottom: '0.75rem' }}>Syarat E-Klaim Tapera</h3>
                        {[
                            'Peserta yang telah memasuki masa pensiun',
                            'Peserta yang mengundurkan diri atau diberhentikan',
                            'Peserta yang meninggal dunia (ahli waris)',
                            'Peserta yang bukan lagi WNI',
                        ].map(s => (
                            <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                                <CheckCircle2 size={14} color="#0EA5E9" style={{ marginTop: '2px', flexShrink: 0 }} />
                                <p style={{ fontSize: '0.8rem', color: '#374151', margin: 0 }}>{s}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
            `}</style>
        </div>
    );
};

export default EklaimPage;
