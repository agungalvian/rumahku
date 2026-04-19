import { FileText, UserPlus, CheckSquare, Building2, ChartBar } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface Step1Props {
    onNext: () => void;
}

const Step1_Ajukan: React.FC<Step1Props> = ({ onNext }) => {
    const { isLoggedIn } = useAppContext();

    const guestSteps = [
        { icon: FileText, label: 'Input & Validasi NIK', sub: 'Cek status peserta Tapera & FLPP' },
        { icon: UserPlus, label: 'Buat Akun Digital', sub: 'Registrasi, verifikasi OTP & password' },
        { icon: CheckSquare, label: 'Konfirmasi Pembiayaan', sub: 'Persetujuan pernyataan minat' },
        { icon: Building2, label: 'Pilih Rumah & Isi Form', sub: 'Ajukan & atur janji temu' },
        { icon: ChartBar, label: 'Pantau Status Bank', sub: 'Monitor progress pengajuan' },
    ];

    const memberSteps = [
        { icon: FileText, label: 'Input & Validasi NIK', sub: 'Cek status peserta Tapera & FLPP' },
        { icon: CheckSquare, label: 'Konfirmasi Pembiayaan', sub: 'Persetujuan pernyataan minat' },
        { icon: Building2, label: 'Pilih Rumah & Isi Form', sub: 'Ajukan & atur janji temu' },
        { icon: ChartBar, label: 'Pantau Status Bank', sub: 'Monitor progress pengajuan' },
    ];

    const steps = isLoggedIn ? memberSteps : guestSteps;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '70vh', padding: '1.5rem' }}>
            {/* Hero */}
            <div style={{
                background: 'var(--gradient-primary)',
                borderRadius: '20px',
                padding: '2rem',
                textAlign: 'center',
                color: 'white',
                marginBottom: '2rem'
            }}>
                <img src="/logo.png" alt="Rumahku" style={{ height: '72px', margin: '0 auto 1rem' }} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Rumahku Pembiayaan
                </h2>
                <p style={{ fontSize: '0.875rem', opacity: 0.9, lineHeight: 1.6 }}>
                    Wujudkan rumah impian Anda dengan program pembiayaan bersubsidi dari Rumahku
                </p>
            </div>

            {/* Steps overview */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
                Proses Pengajuan
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                {steps.map((item, idx) => (
                    <div key={idx} style={{
                        display: 'flex', alignItems: 'center', gap: '0.875rem',
                        padding: '0.875rem', backgroundColor: 'white',
                        borderRadius: '12px', boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            backgroundColor: 'var(--primary-light)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <item.icon size={18} color="var(--primary)" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                <span style={{
                                    display: 'inline-block', width: '20px', height: '20px',
                                    background: 'var(--primary)', color: 'white', borderRadius: '50%',
                                    fontSize: '0.7rem', fontWeight: 700, textAlign: 'center',
                                    lineHeight: '20px', marginRight: '6px'
                                }}>{idx + 2}</span>
                                {item.label}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            <button
                className="btn btn-primary btn-block"
                style={{ marginTop: '2rem', padding: '1rem', fontSize: '1.05rem', borderRadius: '14px' }}
                onClick={onNext}
            >
                Mulai Pengajuan →
            </button>
        </div>
    );
};

export default Step1_Ajukan;
