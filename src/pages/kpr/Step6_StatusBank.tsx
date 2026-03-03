import React from 'react';
import { CheckCircle2, Clock, Circle, Phone, Calendar, Home } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { properties } from '../../data/mockData';

interface Step6Props {
    onGoToTracker: () => void;
    onGoHome: () => void;
}

const bankSteps = [
    { label: 'Pengajuan Diterima', sub: 'Berkas telah dikirim ke bank penyalur', done: true },
    { label: 'Verifikasi Dokumen', sub: 'Bank sedang memeriksa kelengkapan berkas', done: false, active: true },
    { label: 'Penilaian Kredit', sub: 'Analisis kelayakan kredit oleh analis bank', done: false },
    { label: 'SP3K (Persetujuan)', sub: 'Surat Persetujuan Pemberian Kredit', done: false },
    { label: 'Akad Kredit', sub: 'Penandatanganan perjanjian pembiayaan', done: false },
];

const Step6_StatusBank: React.FC<Step6Props> = ({ onGoToTracker, onGoHome }) => {
    const { kprFormData } = useAppContext();
    const selectedProperty = properties.find(p => p.id === kprFormData.selectedPropertyId);
    const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    return (
        <div style={{ padding: '1.5rem', paddingBottom: '2rem' }}>
            {/* Success Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #059669, #10B981)',
                borderRadius: '20px', padding: '1.75rem',
                textAlign: 'center', color: 'white', marginBottom: '1.5rem'
            }}>
                <CheckCircle2 size={56} style={{ margin: '0 auto 0.75rem' }} fill="rgba(255,255,255,0.2)" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                    Pengajuan Berhasil Dikirim!
                </h2>
                <p style={{ fontSize: '0.85rem', opacity: 0.9, lineHeight: 1.6 }}>
                    Berkas Anda telah diterima dan sedang diproses oleh bank penyalur.
                </p>
                <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>Nomor Referensi</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '2px' }}>
                        TAP-{Date.now().toString().slice(-8)}
                    </div>
                </div>
            </div>

            {/* Selected Property Summary */}
            {selectedProperty && (
                <div style={{
                    display: 'flex', gap: '0.875rem', padding: '0.875rem', backgroundColor: 'white',
                    borderRadius: '14px', border: '1px solid var(--border-color)', marginBottom: '1.25rem'
                }}>
                    <img src={selectedProperty.imageUrl} alt={selectedProperty.title} style={{ width: '64px', height: '56px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Rumah yang Diajukan</div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedProperty.title}</div>
                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.875rem' }}>{formatIDR(selectedProperty.price)}</div>
                    </div>
                </div>
            )}

            {/* Appointment Info */}
            {kprFormData.appointmentDate && (
                <div style={{
                    display: 'flex', gap: '0.75rem', alignItems: 'center',
                    padding: '0.875rem', backgroundColor: 'var(--primary-light)',
                    borderRadius: '12px', border: '1px solid #BFDBFE', marginBottom: '1.25rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}><Calendar size={20} color="var(--primary)" /></div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Janji Temu Terjadwal</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
                            {new Date(kprFormData.appointmentDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} — {kprFormData.appointmentTime} WIB
                        </div>
                    </div>
                </div>
            )}

            {/* Progress Tracker */}
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>Progress Pengajuan</h3>
            <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '11px', width: '2px', backgroundColor: 'var(--border-color)', zIndex: 0 }} />
                {bankSteps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', position: 'relative', zIndex: 1, opacity: step.done || step.active ? 1 : 0.45 }}>
                        <div style={{ backgroundColor: step.done ? 'var(--secondary-light)' : step.active ? 'var(--primary-light)' : 'white', borderRadius: '50%', flexShrink: 0 }}>
                            {step.done ? (
                                <CheckCircle2 size={24} color="var(--secondary)" fill="var(--secondary-light)" />
                            ) : step.active ? (
                                <Clock size={24} color="var(--primary)" />
                            ) : (
                                <Circle size={24} color="var(--border-color)" />
                            )}
                        </div>
                        <div style={{ paddingTop: '2px' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: step.active ? 'var(--primary)' : 'var(--text-main)' }}>{step.label}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{step.sub}</div>
                            {step.active && (
                                <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                                    Estimasi 3-5 hari kerja
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Contact Info */}
            <div style={{
                padding: '1rem', backgroundColor: '#FFF7ED', borderRadius: '12px',
                border: '1px solid #FED7AA', marginBottom: '1.5rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <Phone size={16} color="#EA580C" />
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#EA580C' }}>Butuh Bantuan?</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#9A3412' }}>
                    Hubungi call center BP Tapera di <strong>1500-101</strong> atau email ke <strong>pengaduan@bptapera.go.id</strong>
                </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                    className="btn btn-primary btn-block"
                    style={{ padding: '1rem', borderRadius: '14px' }}
                    onClick={onGoToTracker}
                >
                    Pantau Status Pengajuan
                </button>
                <button
                    className="btn btn-outline btn-block"
                    style={{ padding: '1rem', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    onClick={onGoHome}
                >
                    <Home size={18} /> Kembali ke Beranda
                </button>
            </div>
        </div>
    );
};

export default Step6_StatusBank;
