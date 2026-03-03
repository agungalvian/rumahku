import React, { useState } from 'react';
import { CheckCircle2, Loader } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface Step2Props {
    onNext: () => void;
}

const Step2_NIK: React.FC<Step2Props> = ({ onNext }) => {
    const { kprFormData, updateKprFormData, isLoggedIn } = useAppContext();
    const [nik, setNik] = useState(kprFormData.nik);
    const [loading, setLoading] = useState(false);
    const [checked, setChecked] = useState(false);
    const [error, setError] = useState('');

    const handleCheck = () => {
        if (nik.length !== 16) {
            setError('NIK harus 16 digit angka');
            return;
        }
        setError('');
        setLoading(true);

        // Simulate validation
        setTimeout(() => {
            setLoading(false);
            setChecked(true);
            updateKprFormData({ nik });
        }, 1500);
    };

    return (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Validasi NIK Anda
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Masukkan NIK (Nomor Induk Kependudukan) 16 digit sesuai KTP untuk memverifikasi data Anda.
                </p>
            </div>

            <div style={{ backgroundColor: '#F9FAFB', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                    Nomor Induk Kependudukan (NIK)
                </label>
                <input
                    type="tel"
                    maxLength={16}
                    value={nik}
                    onChange={e => { setNik(e.target.value.replace(/\D/g, '')); setChecked(false); }}
                    placeholder="Contoh: 3273010203040001"
                    className="form-control"
                    style={{
                        fontSize: '1.2rem', letterSpacing: '2px', fontWeight: 700,
                        backgroundColor: 'white', border: '1.5px solid #D1D5DB'
                    }}
                />
                {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{nik.length}/16 digit</span>
                    {checked && <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>NIK Terverifikasi ✓</span>}
                </div>
            </div>

            {!checked ? (
                <button
                    className="btn btn-primary btn-block"
                    onClick={handleCheck}
                    disabled={nik.length !== 16 || loading}
                    style={{ padding: '1rem', borderRadius: '14px', opacity: (nik.length !== 16 || loading) ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                    {loading && <Loader size={20} style={{ animation: 'spin 1s linear infinite' }} />}
                    {loading ? 'Memvalidasi...' : 'Validasi NIK Sekarang'}
                </button>
            ) : (
                <button
                    className="btn btn-block"
                    style={{
                        padding: '1rem', borderRadius: '14px',
                        backgroundColor: '#166534', color: 'white',
                        fontWeight: 700, border: 'none'
                    }}
                    onClick={onNext}
                >
                    {isLoggedIn ? 'Lanjut ke Konfirmasi →' : 'Lanjut ke Buat Akun →'}
                </button>
            )}

            {checked && (
                <div style={{
                    padding: '1rem', backgroundColor: '#ECFDF5',
                    borderRadius: '12px', border: '1px solid #A7F3D0',
                    display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    <CheckCircle2 color="#166534" size={20} />
                    <p style={{ fontSize: '0.8rem', color: '#065F46', margin: 0 }}>
                        Data NIK Anda valid dan ditemukan di database kependudukan.
                    </p>
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default Step2_NIK;
