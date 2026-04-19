import React, { useState } from 'react';
import { ChevronLeft, Camera, CheckCircle2 } from 'lucide-react';

const AktivasiPeserta: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
    const [step, setStep] = useState(1);
    const [nik, setNik] = useState('');
    const [pesertaData, setPesertaData] = useState<any>(null);
    const [email, setEmail] = useState('');
    const [noHp, setNoHp] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const checkNik = async () => {
        if (nik.length < 16) {
            setError('NIK harus 16 digit');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/peserta/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nik })
            });
            const data = await res.json();

            if (!data.registered) {
                setError('NIK Anda tidak terdaftar oleh instansi pembiayaan/pemberi kerja Anda. Silakan hubungi HRD atau daftar Mandiri.');
            } else if (data.status !== 'Bukan Peserta') {
                setError('Akun Anda sudah diaktivasi. Silakan masuk / kembali ke Dashboard.');
            } else {
                setPesertaData(data.data);
                setEmail(data.data.email || '');
                setNoHp(data.data.no_hp || '');
                setStep(2);
            }
        } catch {
            setError('Terjadi kesalahan jaringan.');
        } finally {
            setLoading(false);
        }
    };

    const submitAktivasi = async () => {
        if (!email || !noHp) {
            setError('Email dan No HP wajib diisi untuk keamanan akun.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/peserta/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nik, email, no_hp: noHp, password })
            });

            if (res.ok) {
                setStep(3); // Success Screen
            } else {
                setError('Gagal melakukan aktivasi');
            }
        } catch {
            setError('Terjadi kesalahan jaringan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
            <div style={{ backgroundColor: 'var(--primary)', padding: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => step === 1 ? onNavigate('peserta') : setStep(step - 1)} style={{ color: 'white', border: 'none', background: 'none' }}>
                    <ChevronLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Aktivasi Peserta</h1>
            </div>

            <div style={{ padding: '1.5rem 1rem' }}>
                {/* Visual Tracker */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    {[1, 2, 3].map((s) => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: step >= s ? 'var(--primary)' : '#E5E7EB', color: step >= s ? 'white' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                                {s}
                            </div>
                            {s < 3 && <div style={{ width: '40px', height: '2px', backgroundColor: step > s ? 'var(--primary)' : '#E5E7EB', margin: '0 8px' }} />}
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1F2937', marginBottom: '0.5rem' }}>Cek Status NIK</h2>
                        <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.5rem' }}>Masukkan NIK Anda untuk memverifikasi data yang telah didaftarkan oleh Pemberi Kerja / Instansi Anda.</p>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Nomor Induk Kependudukan (NIK)</label>
                            <input
                                type="number"
                                placeholder="Masukkan 16 digit NIK"
                                value={nik}
                                onChange={(e) => setNik(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1rem' }}
                            />
                        </div>

                        {error && <div style={{ padding: '0.75rem', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{error}</div>}

                        <button
                            onClick={checkNik}
                            disabled={loading || nik.length < 16}
                            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', backgroundColor: nik.length >= 16 ? 'var(--primary)' : '#9CA3AF', color: 'white', fontWeight: 600, fontSize: '1rem', border: 'none' }}
                        >
                            {loading ? 'Mengecek...' : 'Cek NIK'}
                        </button>
                    </div>
                )}

                {step === 2 && pesertaData && (
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1F2937', marginBottom: '1rem' }}>Konfirmasi Data Diri</h2>

                        <div style={{ backgroundColor: '#F9FAFB', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #E5E7EB' }}>
                            <div style={{ marginBottom: '0.75rem' }}>
                                <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '2px' }}>Nama Lengkap</p>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1F2937' }}>{pesertaData.nama_lengkap}</p>
                            </div>
                            <div style={{ marginBottom: '0.75rem' }}>
                                <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '2px' }}>Instansi / Perusahaan</p>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1F2937' }}>{pesertaData.instansi}</p>
                            </div>
                        </div>

                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1F2937', marginBottom: '1rem' }}>Lengkapi Kontak & Validasi</h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Email Aktif</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Nomor HP/WhatsApp</label>
                            <input type="tel" value={noHp} onChange={e => setNoHp(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Buat Password Masuk</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimal 6 karakter" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Verifikasi Wajah (Liveness)</label>
                            <div style={{ border: '2px dashed #D1D5DB', borderRadius: '12px', padding: '2rem 1rem', textAlign: 'center', backgroundColor: '#F9FAFB' }}>
                                <Camera size={32} color="#9CA3AF" style={{ margin: '0 auto 0.5rem' }} />
                                <p style={{ fontSize: '0.85rem', color: '#4B5563', fontWeight: 500 }}>Ambil Foto Selfie & KTP</p>
                            </div>
                        </div>

                        {error && <div style={{ padding: '0.75rem', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.5rem' }}>{error}</div>}

                        <button
                            onClick={submitAktivasi}
                            disabled={loading}
                            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 600, fontSize: '1rem', border: 'none' }}
                        >
                            {loading ? 'Memproses...' : 'Aktivasi Sekarang'}
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ backgroundColor: 'white', padding: '2.5rem 1.5rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <CheckCircle2 size={40} color="#16A34A" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.5rem' }}>Aktivasi Berhasil!</h2>
                        <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '2rem' }}>
                            Akun Peserta Tapera Anda telah aktif dan disinkronkan. ID Peserta Anda akan segera dikirim melalui Email/WhatsApp.
                        </p>

                        <button
                            onClick={() => onNavigate('peserta')}
                            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 600, fontSize: '1rem', border: 'none' }}
                        >
                            Ke Dashboard Peserta
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AktivasiPeserta;
