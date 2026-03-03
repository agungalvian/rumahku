import React, { useState } from 'react';
import { ChevronLeft, Camera, CheckCircle2 } from 'lucide-react';

const DaftarMandiri: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        nik: '',
        password: '',
        nama_lengkap: '',
        tanggal_lahir: '',
        jenis_pekerjaan: '',
        estimasi_penghasilan: '',
        rekening_bank: '',
        alamat_domisili: '',
        email: '',
        no_hp: '',
        agree: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submitPendaftaran = async () => {
        if (!form.agree) {
            setError('Anda harus menyetujui Syarat & Ketentuan autodebet.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/peserta/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                setStep(3); // Success Screen
            } else {
                const err = await res.json();
                setError(err.error || 'Gagal melakukan pendaftaran');
            }
        } catch (err) {
            setError('Terjadi kesalahan jaringan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F3F4F6' }}>
            <div style={{ backgroundColor: '#2563EB', padding: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={() => step === 1 ? onNavigate('peserta') : setStep(step - 1)} style={{ color: 'white', border: 'none', background: 'none' }}>
                    <ChevronLeft size={24} />
                </button>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Daftar Pekerja Mandiri</h1>
            </div>

            <div style={{ padding: '1.5rem 1rem', paddingBottom: '3rem' }}>
                {/* Visual Tracker */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    {[1, 2, 3].map((s) => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: step >= s ? '#2563EB' : '#E5E7EB', color: step >= s ? 'white' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                                {s}
                            </div>
                            {s < 3 && <div style={{ width: '40px', height: '2px', backgroundColor: step > s ? '#2563EB' : '#E5E7EB', margin: '0 8px' }} />}
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1F2937', marginBottom: '1rem' }}>Data Pribadi</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>NIK KTP</label>
                                <input name="nik" type="number" value={form.nik} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Buat Password Masuk</label>
                                <input name="password" type="password" placeholder="Minimal 6 karakter" value={form.password} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Nama Lengkap Sesuai KTP</label>
                                <input name="nama_lengkap" value={form.nama_lengkap} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Tanggal Lahir</label>
                                <input name="tanggal_lahir" type="date" value={form.tanggal_lahir} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Email</label>
                                <input name="email" type="email" value={form.email} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>No HP Aktif</label>
                                <input name="no_hp" type="tel" value={form.no_hp} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            disabled={!form.nik || !form.nama_lengkap}
                            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', backgroundColor: '#2563EB', color: 'white', fontWeight: 600, fontSize: '1rem', border: 'none', marginTop: '1.5rem' }}
                        >
                            Lanjutkan
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1F2937', marginBottom: '1rem' }}>Data Pekerjaan & Finansial</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Jenis Pekerjaan</label>
                                <select name="jenis_pekerjaan" value={form.jenis_pekerjaan} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: 'white' }}>
                                    <option value="">Pilih Profesi</option>
                                    <option value="Freelancer">Freelancer / Pekerja Lepas</option>
                                    <option value="Wiraswasta">Wiraswasta / Pedagang</option>
                                    <option value="Driver Online">Mitra Transportasi Online</option>
                                    <option value="Pekerja Seni">Pekerja Seni</option>
                                    <option value="Lainnya">Lainnya...</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Estimasi Penghasilan Bulanan</label>
                                <input name="estimasi_penghasilan" type="number" placeholder="Contoh: 5000000" value={form.estimasi_penghasilan} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Rekening Autodebet (Nama Bank - No Rek)</label>
                                <input name="rekening_bank" placeholder="BCA - 12345678" value={form.rekening_bank} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Alamat Domisili Lengkap</label>
                                <textarea name="alamat_domisili" rows={3} value={form.alamat_domisili} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                            </div>

                            <div style={{ marginBottom: '0.5rem', marginTop: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Upload KTP & Selfie (Liveness)</label>
                                <div style={{ border: '2px dashed #D1D5DB', borderRadius: '12px', padding: '1.5rem 1rem', textAlign: 'center', backgroundColor: '#F9FAFB' }}>
                                    <Camera size={28} color="#9CA3AF" style={{ margin: '0 auto 0.5rem' }} />
                                    <p style={{ fontSize: '0.75rem', color: '#4B5563', fontWeight: 500 }}>Ketuk untuk Ambil Foto Selfie & KTP</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '1.5rem', padding: '1rem', backgroundColor: '#EFF6FF', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
                            <input
                                type="checkbox"
                                id="agree"
                                checked={form.agree}
                                onChange={(e) => setForm({ ...form, agree: e.target.checked })}
                                style={{ marginTop: '2px', width: '18px', height: '18px' }}
                            />
                            <label htmlFor="agree" style={{ fontSize: '0.75rem', lineHeight: 1.5, color: '#1E40AF', flex: 1 }}>
                                Saya menyetujui Syarat dan Ketentuan pendaftaran tabungan reguler secara mandiri dan bersedia iurannya ditarik dari rekening secara autodebet.
                            </label>
                        </div>

                        {error && <div style={{ padding: '0.75rem', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '8px', fontSize: '0.85rem', marginTop: '1rem' }}>{error}</div>}

                        <button
                            onClick={submitPendaftaran}
                            disabled={loading || !form.agree}
                            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', backgroundColor: form.agree ? '#2563EB' : '#9CA3AF', color: 'white', fontWeight: 600, fontSize: '1rem', border: 'none', marginTop: '1.5rem' }}
                        >
                            {loading ? 'Memproses...' : 'Daftar Sekarang'}
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ backgroundColor: 'white', padding: '2.5rem 1.5rem', borderRadius: '16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <div style={{ width: '80px', height: '80px', backgroundColor: '#DCFCE7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <CheckCircle2 size={40} color="#16A34A" />
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.5rem' }}>Pendaftaran Berhasil!</h2>
                        <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '2rem' }}>
                            Selamat! Anda resmi terdaftar sebagai Peserta Pekerja Mandiri BP Tapera. Terus tingkatkan saldo tabungan untuk meraih rumah impian Anda.
                        </p>

                        <button
                            onClick={() => onNavigate('peserta')}
                            style={{ width: '100%', padding: '0.875rem', borderRadius: '12px', backgroundColor: '#2563EB', color: 'white', fontWeight: 600, fontSize: '1rem', border: 'none' }}
                        >
                            Ke Dashboard Peserta
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default DaftarMandiri;
