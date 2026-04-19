import React, { useState, useRef } from 'react';
import { CheckCircle2, Camera, Upload, Loader } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface Step3Props {
    onNext: () => void;
}

type SubStep = 'syarat' | 'data' | 'password';

const Step3_BuatAkun: React.FC<Step3Props> = ({ onNext }) => {
    const { updateKprFormData, kprFormData } = useAppContext();
    const [subStep, setSubStep] = useState<SubStep>('syarat');
    const [agreed, setAgreed] = useState(false);
    const [email, setEmail] = useState(kprFormData.email);
    const [phone, setPhone] = useState(kprFormData.phone);
    const [ktpUploaded, setKtpUploaded] = useState(false);
    const [selfieUploaded, setSelfieUploaded] = useState(false);

    // OTP State
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    // Password State
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [passError, setPassError] = useState('');

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const subStepLabels = ['S&K', 'Data Akun', 'Password'];
    const subSteps: SubStep[] = ['syarat', 'data', 'password'];

    const handleOtpChange = (idx: number, val: string) => {
        if (!/^\d?$/.test(val)) return;
        const newOtp = [...otp];
        newOtp[idx] = val;
        setOtp(newOtp);
        if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
    };

    const handleSendOtp = () => {
        if (!phone || phone.length < 10) return;
        setShowOtpInput(true);
    };

    const handleVerifyOtp = () => {
        setIsVerifyingOtp(true);
        setTimeout(() => {
            setIsVerifyingOtp(false);
            setIsPhoneVerified(true);
            setShowOtpInput(false);
        }, 1500);
    };

    const handleDataNext = () => {
        updateKprFormData({ email, phone });
        setSubStep('password');
    };

    const handlePasswordSubmit = () => {
        if (password.length < 8) { setPassError('Password minimal 8 karakter'); return; }
        if (password !== confirmPass) { setPassError('Password tidak cocok'); return; }
        updateKprFormData({ password });
        onNext();
    };

    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Sub-step indicator */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem' }}>
                {subStepLabels.map((label, idx) => {
                    const current = subSteps.indexOf(subStep);
                    const isActive = idx === current;
                    const isDone = idx < current;
                    return (
                        <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{
                                height: '4px', borderRadius: '2px', marginBottom: '4px',
                                backgroundColor: isDone || isActive ? 'var(--primary)' : '#E5E7EB'
                            }} />
                            <span style={{ fontSize: '0.65rem', color: isActive ? 'var(--primary)' : '#6B7280', fontWeight: isActive ? 700 : 400 }}>
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Syarat & Ketentuan */}
            {subStep === 'syarat' && (
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Syarat & Ketentuan</h2>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '1rem' }}>Bacalah syarat & ketentuan berikut sebelum melanjutkan.</p>
                    <div style={{
                        height: '300px', overflowY: 'scroll', padding: '1rem',
                        backgroundColor: '#F9FAFB', borderRadius: '12px',
                        fontSize: '0.8rem', lineHeight: 1.8, color: '#4B5563',
                        border: '1px solid #E5E7EB'
                    }}>
                        <p style={{ fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>Perjanjian Penggunaan Layanan Digital BP Tapera</p>
                        <p>Dengan menggunakan layanan digital BP Tapera, Anda menyetujui bahwa data yang Anda berikan adalah benar, akurat, dan dapat dipertanggungjawabkan sesuai ketentuan yang berlaku.</p>
                        <br />
                        <p><strong>1. Data Pribadi</strong><br />Data pribadi Anda akan dijaga kerahasiaannya dan hanya digunakan untuk keperluan program pembiayaan perumahan sesuai Undang-Undang Nomor 4 Tahun 2016 tentang Tabungan Perumahan Rakyat.</p>
                        <br />
                        <p><strong>2. Persyaratan Peserta</strong><br />Anda harus merupakan warga negara Indonesia dengan status peserta BP Tapera aktif, belum pernah menerima bantuan FLPP, dan memenuhi kriteria penghasilan yang ditetapkan.</p>
                        <br />
                        <p><strong>3. Penggunaan Informasi</strong><br />Informasi yang Anda berikan dapat dibagikan kepada bank penyalur yang ditunjuk untuk keperluan verifikasi dan proses pembiayaan perumahan.</p>
                        <br />
                        <p><strong>4. Kewajiban Peserta</strong><br />Peserta wajib memberikan informasi yang benar dan lengkap. Apabila dikemudian hari terdapat informasi yang tidak sesuai, BP Tapera berhak membatalkan pengajuan.</p>
                        <br />
                        <p><strong>5. Hak & Tanggung Jawab</strong><br />BP Tapera berhak menolak pengajuan yang tidak memenuhi persyaratan tanpa kewajiban memberikan alasan tertulis.</p>
                        <br />
                        <p style={{ fontStyle: 'italic' }}>Scroll ke bawah untuk membaca seluruh perjanjian ini.</p>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ width: 20, height: 20, accentColor: 'var(--primary)' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Saya telah membaca dan menyetujui Syarat & Ketentuan</span>
                    </label>
                    <button
                        className="btn btn-primary btn-block"
                        style={{ marginTop: '1.25rem', padding: '1rem', borderRadius: '14px', opacity: agreed ? 1 : 0.5 }}
                        disabled={!agreed}
                        onClick={() => setSubStep('data')}
                    >
                        Setuju & Lanjutkan →
                    </button>
                </div>
            )}

            {/* Registrasi Data */}
            {subStep === 'data' && (
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Registrasi Data</h2>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', marginBottom: '1.25rem' }}>Lengkapi data diri Anda untuk membuat akun.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Alamat Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Nomor Ponsel</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setIsPhoneVerified(false); }}
                                    placeholder="08xx-xxxx-xxxx"
                                    disabled={isPhoneVerified}
                                    style={{ flex: 1 }}
                                />
                                {!isPhoneVerified && (
                                    <button
                                        onClick={handleSendOtp}
                                        disabled={!phone || phone.length < 10 || showOtpInput}
                                        style={{
                                            padding: '0 1rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700,
                                            backgroundColor: (phone && phone.length >= 10 && !showOtpInput) ? 'var(--primary)' : '#E5E7EB',
                                            color: 'white', border: 'none', cursor: 'pointer'
                                        }}
                                    >
                                        Verifikasi
                                    </button>
                                )}
                            </div>
                            {isPhoneVerified && (
                                <p style={{ fontSize: '0.75rem', color: '#059669', marginTop: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <CheckCircle2 size={14} /> Nomor ponsel terverifikasi
                                </p>
                            )}
                        </div>

                        {/* Inline OTP Input */}
                        {showOtpInput && !isPhoneVerified && (
                            <div style={{ padding: '1rem', backgroundColor: '#F0FDF4', borderRadius: '12px', border: '1.5px solid #BBF7D0' }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', marginBottom: '10px' }}>
                                    Masukkan 6-digit kode OTP
                                </p>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={el => { otpRefs.current[idx] = el; }}
                                            type="tel"
                                            maxLength={1}
                                            value={digit}
                                            onChange={e => handleOtpChange(idx, e.target.value)}
                                            style={{
                                                width: '40px', height: '48px', textAlign: 'center', fontSize: '1.2rem',
                                                fontWeight: 700, borderRadius: '8px', border: `1.5px solid ${digit ? 'var(--primary)' : '#D1D5DB'}`,
                                                outline: 'none', backgroundColor: 'white'
                                            }}
                                        />
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <button
                                        onClick={handleSendOtp}
                                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.7rem', fontWeight: 600, padding: 0 }}
                                    >
                                        Kirim Ulang
                                    </button>
                                    <button
                                        onClick={handleVerifyOtp}
                                        disabled={otp.join('').length !== 6 || isVerifyingOtp}
                                        style={{
                                            padding: '6px 16px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                                            backgroundColor: (otp.join('').length === 6 && !isVerifyingOtp) ? 'var(--primary)' : '#E5E7EB',
                                            color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '6px'
                                        }}
                                    >
                                        {isVerifyingOtp && <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                                        Verifikasi OTP
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Photo uploads */}
                        {[
                            { label: 'Foto KTP', icon: Upload, done: ktpUploaded, onMock: () => setKtpUploaded(true) },
                            { label: 'Selfie dengan KTP', icon: Camera, done: selfieUploaded, onMock: () => setSelfieUploaded(true) },
                        ].map(item => (
                            <div key={item.label}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>{item.label}</label>
                                <button
                                    onClick={item.done ? undefined : item.onMock}
                                    style={{
                                        width: '100%', padding: '1.25rem', borderRadius: '12px', cursor: 'pointer',
                                        border: `2px dashed ${item.done ? 'var(--primary)' : '#D1D5DB'}`,
                                        backgroundColor: item.done ? '#F0FDF4' : 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                        color: item.done ? 'var(--primary)' : '#6B7280', fontWeight: 600
                                    }}
                                >
                                    {item.done ? <><CheckCircle2 size={18} /> Berhasil Diunggah</> : <><item.icon size={18} /> Klik untuk Unggah</>}
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        className="btn btn-primary btn-block"
                        style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '14px', opacity: email && isPhoneVerified && ktpUploaded && selfieUploaded ? 1 : 0.6 }}
                        disabled={!email || !isPhoneVerified || !ktpUploaded || !selfieUploaded}
                        onClick={handleDataNext}
                    >
                        Lanjut ke Password →
                    </button>
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {/* Buat Password */}
            {subStep === 'password' && (
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Buat Password</h2>
                    <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1.5rem' }}>Buat password yang kuat untuk melindungi akun Anda.</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Password Baru</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 karakter" />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Konfirmasi Password</label>
                            <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Ulangi password" />
                        </div>
                        {passError && <p style={{ color: '#EF4444', fontSize: '0.8rem' }}>{passError}</p>}

                        <div>
                            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} style={{
                                        flex: 1, height: '4px', borderRadius: '2px',
                                        backgroundColor: password.length >= i * 2 ? (password.length >= 8 ? '#059669' : '#F59E0B') : '#E5E7EB'
                                    }} />
                                ))}
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                                {password.length === 0 ? 'Belum ada password' : password.length < 6 ? 'Lemah' : password.length < 8 ? 'Sedang' : 'Kuat'}
                            </span>
                        </div>
                    </div>
                    <button
                        className="btn btn-block"
                        style={{
                            marginTop: '1.5rem', padding: '1rem', borderRadius: '14px',
                            backgroundColor: 'var(--primary)', color: 'white', fontWeight: 700,
                            opacity: password && confirmPass ? 1 : 0.6
                        }}
                        disabled={!password || !confirmPass}
                        onClick={handlePasswordSubmit}
                    >
                        Buat Akun Sekarang
                    </button>
                </div>
            )}
        </div>
    );
};

export default Step3_BuatAkun;
