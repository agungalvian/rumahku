import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface Step4Props {
    onNext: () => void;
}

const Step4_Konfirmasi: React.FC<Step4Props> = ({ onNext }) => {
    const [agreed, setAgreed] = useState(false);

    return (
        <div style={{ padding: '1.5rem' }}>
            <div style={{
                background: 'linear-gradient(135deg, #2563EB, #00C853)',
                borderRadius: '16px', padding: '1.5rem', textAlign: 'center',
                color: 'white', marginBottom: '1.5rem'
            }}>
                <ShieldCheck size={48} style={{ margin: '0 auto 0.75rem' }} />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Pernyataan Minat Pembiayaan
                </h2>
                <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                    Baca dan setujui pernyataan berikut untuk melanjutkan proses pengajuan
                </p>
            </div>

            <div style={{
                padding: '1.25rem', backgroundColor: 'white', borderRadius: '14px',
                border: '1px solid var(--border-color)', marginBottom: '1.25rem',
                lineHeight: 1.8, fontSize: '0.875rem', color: 'var(--text-main)'
            }}>
                <p style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Pernyataan Minat Pembiayaan Perumahan Tapera</p>
                <p>Saya yang bertanda tangan di bawah ini menyatakan dengan sesungguhnya bahwa:</p>
                <br />
                <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>Saya berminat untuk memperoleh <strong>Fasilitas Pembiayaan Perumahan BP Tapera</strong> dalam rangka pembelian rumah pertama saya.</li>
                    <li>Data dan informasi yang saya berikan adalah <strong>benar dan dapat dipertanggungjawabkan</strong>.</li>
                    <li>Saya <strong>belum pernah memiliki rumah</strong> dan belum pernah menerima subsidi perumahan dari pemerintah dalam bentuk apapun.</li>
                    <li>Saya bersedia untuk melengkapi dokumen-dokumen yang diperlukan dalam proses pengajuan pembiayaan.</li>
                    <li>Saya memahami bahwa persetujuan akhir akan ditentukan oleh <strong>Bank Penyalur</strong> yang ditunjuk.</li>
                </ol>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    style={{ width: 20, height: 20, flexShrink: 0, marginTop: '2px', accentColor: 'var(--primary)' }}
                />
                <span style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                    Saya menyatakan bahwa pernyataan di atas adalah benar dan saya bersedia melanjutkan proses pengajuan pembiayaan Tapera.
                </span>
            </label>

            <button
                className="btn btn-primary btn-block"
                style={{ padding: '1rem', borderRadius: '14px', opacity: agreed ? 1 : 0.5 }}
                disabled={!agreed}
                onClick={onNext}
            >
                Setuju & Lanjutkan Pembiayaan →
            </button>
        </div>
    );
};

export default Step4_Konfirmasi;
