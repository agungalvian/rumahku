import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Step1_Ajukan from './kpr/Step1_Ajukan';
import Step2_NIK from './kpr/Step2_NIK';
import Step3_BuatAkun from './kpr/Step3_BuatAkun';
import Step4_Konfirmasi from './kpr/Step4_Konfirmasi';
import Step5_PilihRumah from './kpr/Step5_PilihRumah';
import Step6_StatusBank from './kpr/Step6_StatusBank';

interface KprFlowPageProps {
    onNavigate: (page: string, id?: string) => void;
}

const guestStepTitles = [
    'Ajukan Pembiayaan',
    'Validasi NIK',
    'Buat Akun & Verifikasi',
    'Syarat & Ketentuan',
    'Pilih Rumah & Form',
    'Status Pengajuan',
];

const memberStepTitles = [
    'Ajukan Pembiayaan',
    'Validasi NIK',
    'Syarat & Ketentuan',
    'Pilih Rumah & Form',
    'Status Pengajuan',
];

const KprFlowPage: React.FC<KprFlowPageProps> = ({ onNavigate }) => {
    const { kprStep, nextKprStep, prevKprStep, submitKpr, isLoggedIn } = useAppContext();

    const titles = isLoggedIn ? memberStepTitles : guestStepTitles;
    const totalSteps = titles.length;

    // Map the sequential UI step to the actual content component index
    // Guest: 1, 2, 3, 4, 5, 6
    // Member: 1, 2, skip3, 4, 5, 6 -> UI Steps: 1, 2, 3, 4, 5
    const getComponentStep = (uiStep: number) => {
        if (!isLoggedIn) return uiStep;
        if (uiStep <= 2) return uiStep;
        return uiStep + 1; // Skip step 3
    };

    const currentComponentStep = getComponentStep(kprStep);

    const handleBack = () => {
        if (kprStep === 1) {
            onNavigate('home');
        } else {
            prevKprStep();
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)' }}>
            {/* Header */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 50,
                backgroundColor: 'white',
                borderBottom: '1px solid var(--border-color)',
                padding: '0.875rem 1rem',
            }}>
                {/* Top Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.875rem' }}>
                    {kprStep < 6 && (
                        <button
                            onClick={handleBack}
                            style={{ padding: '6px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', flexShrink: 0 }}
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            Langkah {kprStep} dari {totalSteps}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                            {titles[kprStep - 1]}
                        </div>
                    </div>
                    {/* Tapera badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                        <img src="/logo.png" alt="Rumahku" style={{ height: '28px' }} />
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)' }}>Rumahku</span>
                    </div>
                </div>

                {/* Step Progress Bar */}
                <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
                        <div
                            key={s}
                            style={{
                                flex: 1, height: '4px', borderRadius: '2px',
                                backgroundColor: s <= kprStep ? 'var(--primary)' : 'var(--border-color)',
                                transition: 'background-color 0.4s ease'
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div style={{ backgroundColor: 'white', minHeight: 'calc(100vh - 88px)' }}>
                {currentComponentStep === 1 && <Step1_Ajukan onNext={nextKprStep} />}
                {currentComponentStep === 2 && <Step2_NIK onNext={nextKprStep} />}
                {currentComponentStep === 3 && <Step3_BuatAkun onNext={nextKprStep} />}
                {currentComponentStep === 4 && <Step4_Konfirmasi onNext={nextKprStep} />}
                {currentComponentStep === 5 && <Step5_PilihRumah onSubmit={submitKpr} />}
                {currentComponentStep === 6 && (
                    <Step6_StatusBank
                        onGoToTracker={() => onNavigate('tracker')}
                        onGoHome={() => onNavigate('home')}
                    />
                )}
            </div>
        </div>
    );
};

export default KprFlowPage;
