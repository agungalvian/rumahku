import React, { useState, useEffect } from 'react';
import { ChevronLeft, Wallet, Settings, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const PesertaPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
    const { isLoggedIn, userProfile } = useAppContext();
    const [pesertaData, setPesertaData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showSaldo, setShowSaldo] = useState(false);

    useEffect(() => {
        // Fetch the dashboard data using the actually logged in user NIK
        if (isLoggedIn && userProfile?.nik) {
            verifyParticipant(userProfile.nik);
        } else {
            setLoading(false);
        }
    }, [isLoggedIn, userProfile]);

    const verifyParticipant = async (nik: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/peserta/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nik })
            });
            const data = await res.json();
            if (data.registered) {
                setPesertaData({ ...data.data, status: data.status });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Memuat data kepesertaan...</p>
            </div>
        );
    }

    if (!isLoggedIn || !pesertaData) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
                <div style={{ backgroundColor: 'var(--primary)', padding: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => onNavigate('home')} style={{ color: 'white' }}><ChevronLeft size={24} /></button>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Peserta Rumahku</h1>
                </div>

                <div style={{ padding: '1rem', marginTop: '2rem', textAlign: 'center' }}>
                    <p>Silakan login terlebih dahulu untuk mengakses layanan BP Tapera.</p>
                </div>
            </div>
        );
    }

    // Determine specific participant states
    const isBukanPeserta = pesertaData.status === 'Bukan Peserta';
    const isMandiri = pesertaData.status === 'Peserta Pekerja Mandiri';

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6', paddingBottom: '90px' }}>
            <div style={{ backgroundColor: 'var(--primary)', padding: '1rem', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button onClick={() => onNavigate('home')} style={{ color: 'white' }}><ChevronLeft size={24} /></button>
                    <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Dashboard Peserta</h1>
                </div>
                <Settings size={20} />
            </div>

            <div style={{ padding: '0 1rem', marginTop: '-2rem' }}>
                {/* ID Card - only for active participants */}
                {!isBukanPeserta && (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '100px', height: '100px', backgroundColor: '#F0FDF4', borderRadius: '50%', zIndex: 0 }} />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '2px' }}>ID Peserta</p>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1F2937', letterSpacing: '2px' }}>{pesertaData.id_peserta}</p>
                                </div>
                                <div style={{ backgroundColor: '#D1FAE5', color: '#059669', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <CheckCircle2 size={12} />
                                    AKTIF
                                </div>
                            </div>

                            <div style={{ position: 'relative' }}>
                                <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', paddingRight: '100px' }}>{pesertaData.nama_lengkap}</p>

                                {!isMandiri ? (
                                    <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: 'var(--primary)', borderRadius: '50%' }} />
                                        {pesertaData.instansi || '-'}
                                    </p>
                                ) : (
                                    <p style={{ fontSize: '0.85rem', color: '#6B7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#F59E0B', borderRadius: '50%' }} />
                                        {pesertaData.jenis_pekerjaan || '-'}
                                    </p>
                                )}

                                {/* JENIS KEPESERTAAN BADGE */}
                                <div style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: isMandiri ? '#FEF3C7' : 'var(--primary-light)', color: isMandiri ? '#D97706' : 'var(--primary-dark)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {isMandiri ? 'PESERTA PEKERJA MANDIRI' : 'PESERTA'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isBukanPeserta && (
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
                        <ShieldAlert size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.5rem' }}>Anda Belum Menjadi Peserta</h2>
                        <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                            Akun digital Anda telah aktif. Silakan lakukan pendaftaran kepesertaan untuk mengakses layanan utuh Peserta BP Tapera.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                onClick={() => onNavigate('daftar-mandiri')}
                                style={{
                                    backgroundColor: 'var(--primary)', color: 'white', padding: '1rem', borderRadius: '12px',
                                    fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: 'none', cursor: 'pointer'
                                }}
                            >
                                <span style={{ textAlign: 'left' }}>
                                    <div style={{}}>Daftar Peserta Mandiri</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 400, opacity: 0.9 }}>Untuk Freelancer / Pedagang / Pekerja Lepas</div>
                                </span>
                                <ArrowRight size={20} />
                            </button>

                            <button
                                onClick={() => onNavigate('aktivasi-peserta')}
                                style={{
                                    backgroundColor: 'white', color: 'var(--primary)', padding: '1rem', borderRadius: '12px',
                                    fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--primary)', cursor: 'pointer'
                                }}
                            >
                                <span style={{ textAlign: 'left' }}>
                                    <div style={{}}>Aktivasi Peserta</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 400, color: '#6B7280' }}>Untuk ASN / TNI Polri / Karyawan Perusahaan</div>
                                </span>
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Saldo Balance Widget - only for active participants */}
                {!isBukanPeserta && (
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280', fontSize: '0.9rem' }}>
                                <Wallet size={18} color="var(--primary)" /> Saldo Tabungan Anda
                            </div>
                            <button
                                onClick={() => setShowSaldo(!showSaldo)}
                                style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '4px 10px', borderRadius: '12px' }}
                            >
                                {showSaldo ? 'Sembunyikan' : 'Tampilkan'}
                            </button>
                        </div>

                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1F2937' }}>
                            {showSaldo ? (
                                new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(pesertaData.saldo_tabungan)
                            ) : 'Rp ••••••••••'}
                        </div>
                    </div>
                )}

                {/* Info and Navigation Section */}
                {!isBukanPeserta && (
                    <>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1F2937', marginBottom: '1rem' }}>Menu Peserta</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {[
                                { title: 'Update Profil', desc: 'Perbarui data kontak dan domisili', action: () => { } },
                                { title: 'Riwayat Iuran', desc: 'Cek histori pembayaran/potongan bulanan', action: () => { } },
                                { title: 'Simulasi Manfaat', desc: 'Hitung total saldo di akhir masa kepesertaan', action: () => { } }
                            ].map((menu, i) => (
                                <div key={i} onClick={menu.action} style={{ backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                                    <div>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1F2937', marginBottom: '2px' }}>{menu.title}</h4>
                                        <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>{menu.desc}</p>
                                    </div>
                                    <ChevronLeft size={18} color="#9CA3AF" style={{ transform: 'rotate(180deg)' }} />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

        </div >
    );
};

export default PesertaPage;
