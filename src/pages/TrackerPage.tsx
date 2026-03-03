import React, { useState, useEffect } from 'react';
import ApplicationTracker from '../components/ApplicationTracker';
import { FileText, Receipt, ChevronRight, CheckCircle2, Clock, XCircle, Loader2, X, Building2, Calendar } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface TrackerPageProps {
    onNavigate: (page: string, id?: string) => void;
    onStartKpr: (propertyId?: string) => void;
    wishlistOnly?: boolean;
}

interface Pengajuan {
    id_pengajuan: string;
    jenis: string;
    deskripsi: string;
    tanggal: string;
    status: string;
}

interface Iuran {
    bulan: string;
    tahun: number;
    nominal: string;
    tipe: string;
    status: string;
    tanggal_bayar: string;
}

const statusConfig: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode; label: string; step: number }> = {
    proses: { bg: '#FEF3C7', text: '#D97706', border: '#D97706', icon: <Clock size={12} />, label: 'Sedang Diproses', step: 1 },
    selesai: { bg: '#D1FAE5', text: '#059669', border: '#059669', icon: <CheckCircle2 size={12} />, label: 'Disetujui', step: 4 },
    ditolak: { bg: '#FEE2E2', text: '#DC2626', border: '#DC2626', icon: <XCircle size={12} />, label: 'Ditolak', step: 1 },
};

const TrackerPage: React.FC<TrackerPageProps> = ({ onNavigate: _onNavigate, onStartKpr: _onStartKpr }) => {
    const [activeTab, setActiveTab] = useState<'pembiayaan' | 'kepesertaan'>('pembiayaan');
    const [selectedPengajuan, setSelectedPengajuan] = useState<Pengajuan | null>(null);
    const { isLoggedIn, userProfile } = useAppContext();

    const [pengajuan, setPengajuan] = useState<Pengajuan[]>([]);
    const [iuran, setIuran] = useState<Iuran[]>([]);
    const [pesertaStatus, setPesertaStatus] = useState<string>('');
    const [totalIuran, setTotalIuran] = useState<number>(0);
    const [loadingPengajuan, setLoadingPengajuan] = useState(false);
    const [loadingIuran, setLoadingIuran] = useState(false);

    const nik = userProfile?.nik;

    useEffect(() => {
        if (!nik) return;
        setLoadingPengajuan(true);
        fetch(`/api/peserta/riwayat/pengajuan?nik=${nik}`)
            .then(r => r.json())
            .then(data => { if (data.success) setPengajuan(data.data); })
            .catch(() => { })
            .finally(() => setLoadingPengajuan(false));
    }, [nik]);

    useEffect(() => {
        if (!nik) return;
        fetch('/api/peserta/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nik })
        })
            .then(r => r.json())
            .then(data => {
                if (data.registered) {
                    setPesertaStatus(data.status);
                    setTotalIuran(parseFloat(data.data?.saldo_tabungan || '0'));
                }
            })
            .catch(() => { });

        setLoadingIuran(true);
        fetch(`/api/peserta/riwayat/iuran?nik=${nik}`)
            .then(r => r.json())
            .then(data => { if (data.success) setIuran(data.data); })
            .catch(() => { })
            .finally(() => setLoadingIuran(false));
    }, [nik]);

    const isPeserta = pesertaStatus === 'Peserta' || pesertaStatus === 'Peserta Pekerja Mandiri';

    const tabStyle = (tab: string): React.CSSProperties => ({
        flex: 1,
        padding: '0.65rem',
        fontWeight: 600,
        fontSize: '0.875rem',
        border: 'none',
        borderBottom: activeTab === tab ? '2px solid #2563EB' : '2px solid transparent',
        backgroundColor: 'white',
        color: activeTab === tab ? '#2563EB' : '#6B7280',
        cursor: 'pointer',
        transition: 'all 0.2s',
    });

    return (
        <div style={{ paddingBottom: '80px', backgroundColor: '#F3F4F6', minHeight: '100vh' }}>
            {/* Header + Tabs */}
            <div style={{ padding: '1rem', backgroundColor: '#2563EB', paddingBottom: '0' }}>
                <h1 style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>Riwayat</h1>
                <div style={{ display: 'flex', backgroundColor: 'white', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
                    <button style={tabStyle('pembiayaan')} onClick={() => setActiveTab('pembiayaan')}>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <FileText size={16} /> Pembiayaan
                        </span>
                    </button>
                    <button style={tabStyle('kepesertaan')} onClick={() => setActiveTab('kepesertaan')}>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <Receipt size={16} /> Kepesertaan
                        </span>
                    </button>
                </div>
            </div>

            <div style={{ padding: '1rem' }}>

                {/* ===== TAB PEMBIAYAAN ===== */}
                {activeTab === 'pembiayaan' && (
                    <div>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.75rem' }}>
                            Riwayat Pengajuan
                        </h3>

                        {loadingPengajuan ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <Loader2 size={28} color="#2563EB" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : !isLoggedIn ? (
                            <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '12px' }}>
                                <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Silakan login untuk melihat riwayat pengajuan.</p>
                            </div>
                        ) : pengajuan.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '12px' }}>
                                <FileText size={36} color="#D1D5DB" style={{ margin: '0 auto 0.75rem' }} />
                                <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>Belum ada riwayat pengajuan pembiayaan.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {pengajuan.map((item) => {
                                    const s = statusConfig[item.status] ?? statusConfig['proses'];
                                    return (
                                        <div
                                            key={item.id_pengajuan}
                                            onClick={() => setSelectedPengajuan(item)}
                                            style={{
                                                backgroundColor: 'white', borderRadius: '12px',
                                                padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                borderLeft: `4px solid ${s.border}`, cursor: 'pointer',
                                                transition: 'box-shadow 0.15s',
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <span style={{
                                                    backgroundColor: s.bg, color: s.text,
                                                    padding: '2px 8px', borderRadius: '20px',
                                                    fontSize: '0.65rem', fontWeight: 700,
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '6px'
                                                }}>
                                                    {s.icon} {s.label}
                                                </span>
                                                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>{item.jenis}</p>
                                                <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '2px' }}>{item.deskripsi}</p>
                                                <p style={{ fontSize: '0.7rem', color: '#9CA3AF', fontFamily: 'monospace' }}>{item.id_pengajuan} · {item.tanggal}</p>
                                            </div>
                                            <ChevronRight size={18} color="#D1D5DB" />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== TAB KEPESERTAAN ===== */}
                {activeTab === 'kepesertaan' && (
                    <div>
                        {!isLoggedIn ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: 'white', borderRadius: '16px' }}>
                                <Receipt size={48} color="#D1D5DB" style={{ margin: '0 auto 1rem' }} />
                                <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>Silakan login untuk melihat riwayat kepesertaan.</p>
                            </div>
                        ) : !isPeserta ? (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                                <Receipt size={48} color="#D1D5DB" style={{ margin: '0 auto 1rem' }} />
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', marginBottom: '0.5rem' }}>Belum Menjadi Peserta</h3>
                                <p style={{ color: '#6B7280', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                    Riwayat iuran hanya tersedia untuk Peserta aktif BP Tapera.<br />
                                    Daftarkan diri Anda melalui menu Peserta.
                                </p>
                            </div>
                        ) : loadingIuran ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                <Loader2 size={28} color="#2563EB" style={{ margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : (
                            <div>
                                <div style={{
                                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                                    borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem',
                                    color: 'white', boxShadow: '0 4px 12px rgba(37,99,235,0.3)'
                                }}>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '4px' }}>Total Iuran Terkumpul</p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalIuran)}
                                    </p>
                                    <p style={{ fontSize: '0.7rem', opacity: 0.75, marginTop: '4px' }}>
                                        {iuran[0] ? `Per ${iuran[0].bulan} ${iuran[0].tahun}` : ''}
                                    </p>
                                </div>

                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.75rem' }}>
                                    Riwayat Iuran Bulanan
                                </h3>

                                {iuran.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '12px' }}>
                                        <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>Belum ada data iuran.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                        {iuran.map((item, i) => (
                                            <div key={i} style={{
                                                backgroundColor: 'white', borderRadius: '12px',
                                                padding: '0.875rem 1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                            }}>
                                                <div>
                                                    <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>{item.bulan} {item.tahun}</p>
                                                    <p style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: '2px' }}>{item.tipe}</p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#2563EB' }}>
                                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(parseFloat(item.nominal))}
                                                    </p>
                                                    <span style={{
                                                        backgroundColor: '#D1FAE5', color: '#059669',
                                                        padding: '2px 8px', borderRadius: '20px',
                                                        fontSize: '0.62rem', fontWeight: 700
                                                    }}>
                                                        ✓ Lunas
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ===== DETAIL BOTTOM SHEET ===== */}
            {selectedPengajuan && (() => {
                const s = statusConfig[selectedPengajuan.status] ?? statusConfig['proses'];
                return (
                    <>
                        {/* Backdrop */}
                        <div
                            onClick={() => setSelectedPengajuan(null)}
                            style={{
                                position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)',
                                zIndex: 40, backdropFilter: 'blur(2px)'
                            }}
                        />
                        {/* Sheet */}
                        <div style={{
                            position: 'fixed', bottom: 0, left: 0, right: 0,
                            backgroundColor: 'white', borderRadius: '20px 20px 0 0',
                            boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
                            zIndex: 50, padding: '1.5rem 1rem 2rem', maxHeight: '85vh', overflowY: 'auto'
                        }}>
                            {/* Handle */}
                            <div style={{ width: '40px', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', margin: '0 auto 1.25rem' }} />

                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>{selectedPengajuan.jenis}</h2>
                                    <span style={{
                                        backgroundColor: s.bg, color: s.text, padding: '3px 10px',
                                        borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                                        display: 'inline-flex', alignItems: 'center', gap: '4px'
                                    }}>
                                        {s.icon} {s.label}
                                    </span>
                                </div>
                                <button onClick={() => setSelectedPengajuan(null)} style={{ border: 'none', background: '#F3F4F6', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <X size={16} color="#6B7280" />
                                </button>
                            </div>

                            {/* Info rows */}
                            <div style={{ backgroundColor: '#F9FAFB', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem' }}>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '0.6rem', alignItems: 'flex-start' }}>
                                    <Building2 size={15} color="#9CA3AF" style={{ marginTop: '2px' }} />
                                    <div>
                                        <p style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Properti / Keperluan</p>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{selectedPengajuan.deskripsi}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                    <Calendar size={15} color="#9CA3AF" style={{ marginTop: '2px' }} />
                                    <div>
                                        <p style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>Tanggal Pengajuan</p>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>{selectedPengajuan.tanggal}</p>
                                    </div>
                                </div>
                                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #E5E7EB' }}>
                                    <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginBottom: '2px' }}>ID Pengajuan</p>
                                    <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563EB', fontFamily: 'monospace' }}>{selectedPengajuan.id_pengajuan}</p>
                                </div>
                            </div>

                            {/* Progress tracker */}
                            {selectedPengajuan.status !== 'ditolak' ? (
                                <ApplicationTracker currentStep={s.step} />
                            ) : (
                                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                                    <XCircle size={32} color="#DC2626" style={{ margin: '0 auto 0.5rem' }} />
                                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#DC2626' }}>Pengajuan Ditolak</p>
                                    <p style={{ fontSize: '0.75rem', color: '#9B1C1C', marginTop: '4px' }}>Silakan hubungi kantor BP Tapera terdekat untuk informasi lebih lanjut.</p>
                                </div>
                            )}
                        </div>
                    </>
                );
            })()}
        </div>
    );
};

export default TrackerPage;
