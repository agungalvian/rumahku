import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, ChevronRight, HelpCircle } from 'lucide-react';

const faqs = [
    { q: 'Siapa yang bisa mengajukan pembiayaan Tapera?', a: 'WNI yang merupakan peserta aktif BP Tapera, berpenghasilan ≤ Rp8 juta/bulan (untuk rumah subsidi), dan belum pernah memiliki rumah.' },
    { q: 'Berapa suku bunga KPR subsidi Tapera?', a: 'Suku bunga KPR FLPP ditetapkan sebesar 5% per tahun secara flat sepanjang masa pinjaman.' },
    { q: 'Berapa lama proses pengajuan KPR?', a: 'Proses pengajuan hingga akad kredit biasanya memakan waktu 1–3 bulan tergantung kelengkapan dokumen dan kebijakan bank penyalur.' },
    { q: 'Bank apa saja yang menjadi penyalur Tapera?', a: 'Bank penyalur resmi meliputi BTN, BRI, BNI, Mandiri, BSI, dan beberapa BPD (Bank Pembangunan Daerah) yang telah bekerjasama dengan BP Tapera.' },
    { q: 'Apakah ada batasan harga rumah untuk subsidi?', a: 'Ya. Harga rumah subsidi FLPP ditetapkan pemerintah, berbeda per wilayah. Umumnya berkisar antara Rp 162jt – Rp 234jt tergantung lokasi.' },
];

const KonsultasiPage: React.FC = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    return (
        <div style={{ paddingBottom: '80px', backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1rem 1rem', backgroundColor: '#2563EB', borderBottom: '1px solid #1D4ED8' }}>
                <h1 style={{ fontWeight: 700, fontSize: '1.2rem', color: 'white' }}>Konsultasi</h1>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>Bantuan dan informasi seputar KPR Tapera</p>
            </div>

            <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {/* Contact Channels */}
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.5rem' }}>Hubungi Kami</h3>
                {[
                    { icon: Phone, label: 'Call Center', sub: '1500-101 (08.00 – 17.00 WIB)', color: '#10B981', bg: '#D1FAE5', action: 'Hubungi Sekarang' },
                    { icon: MessageCircle, label: 'Live Chat', sub: 'Chat dengan agen kami', color: '#2563EB', bg: '#EFF6FF', action: 'Mulai Chat' },
                    { icon: Mail, label: 'Email', sub: 'pengaduan@bptapera.go.id', color: '#EA580C', bg: '#FFEDD5', action: 'Kirim Email' },
                ].map((item, idx) => (
                    <div key={idx} style={{
                        display: 'flex', alignItems: 'center', gap: '0.875rem',
                        padding: '1rem', backgroundColor: 'white',
                        borderRadius: '14px', boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '12px',
                            backgroundColor: item.bg, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <item.icon size={20} color={item.color} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.label}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.sub}</div>
                        </div>
                        <button style={{
                            fontSize: '0.75rem', fontWeight: 700,
                            color: item.color, background: item.bg,
                            border: 'none', borderRadius: '8px',
                            padding: '6px 10px', cursor: 'pointer', flexShrink: 0
                        }}>
                            {item.action}
                        </button>
                    </div>
                ))}

                {/* Pusat Bantuan */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem',
                    backgroundColor: 'white', borderRadius: '14px', boxShadow: 'var(--shadow-sm)', cursor: 'pointer'
                }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <HelpCircle size={20} color="#D97706" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Pusat Bantuan</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Informasi lengkap tentang KPR</div>
                    </div>
                    <ChevronRight size={18} color="var(--text-muted)" />
                </div>

                {/* FAQ */}
                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginTop: '0.25rem' }}>Pertanyaan Umum (FAQ)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {faqs.map((faq, idx) => (
                        <div key={idx} style={{
                            backgroundColor: 'white', borderRadius: '14px',
                            overflow: 'hidden', boxShadow: 'var(--shadow-sm)'
                        }}>
                            <button
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                style={{
                                    width: '100%', padding: '1rem', display: 'flex',
                                    justifyContent: 'space-between', alignItems: 'center',
                                    gap: '0.75rem', background: 'none', border: 'none', cursor: 'pointer'
                                }}
                            >
                                <span style={{ fontWeight: 600, fontSize: '0.875rem', textAlign: 'left', flex: 1 }}>{faq.q}</span>
                                <ChevronRight
                                    size={18} color="var(--text-muted)"
                                    style={{ transform: openFaq === idx ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }}
                                />
                            </button>
                            {openFaq === idx && (
                                <div style={{
                                    padding: '0 1rem 1rem', fontSize: '0.825rem',
                                    color: 'var(--text-muted)', lineHeight: 1.7,
                                    borderTop: '1px solid var(--border-color)'
                                }}>
                                    <p style={{ paddingTop: '0.75rem' }}>{faq.a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default KonsultasiPage;
