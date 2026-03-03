import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

const steps = [
    "Pengajuan Diterima",
    "Follow Up Bank",
    "SP3K",
    "Verifikasi Layak Huni",
    "Akad"
];

interface ApplicationTrackerProps {
    currentStep?: number;
}

const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({ currentStep = 1 }) => {
    return (
        <div className="card p-4">
            <h3 className="font-bold text-lg mb-4">Status Pengajuan</h3>

            <div className="mb-2 relative">
                <div style={{ position: 'absolute', top: 0, bottom: 0, left: '11px', width: '2px', backgroundColor: 'var(--border-color)', zIndex: 0 }}></div>
                {steps.map((step, idx) => {
                    const isCompleted = idx < currentStep;
                    const isActive = idx === currentStep;
                    return (
                        <div key={idx} className="flex gap-4 mb-4 relative z-10" style={{ opacity: isCompleted || isActive ? 1 : 0.45 }}>
                            <div style={{ backgroundColor: 'white' }}>
                                {isCompleted ? (
                                    <CheckCircle2 color="var(--secondary)" fill="var(--secondary-light)" size={24} />
                                ) : isActive ? (
                                    <Clock color="var(--primary)" size={24} />
                                ) : (
                                    <Circle color="var(--text-muted)" size={24} />
                                )}
                            </div>
                            <div style={{ marginTop: '2px' }}>
                                <h4 className={`font-semibold text-sm ${isActive ? 'text-primary' : ''}`}>{step}</h4>
                                {isActive && <p className="text-xs text-muted mt-1">Estimasi proses 3-5 hari kerja.</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ApplicationTracker;
