import React, { useState } from 'react';
import KprSimulator from '../components/KprSimulator';
import type { PropertyType } from '../data/mockData';

const SimulasiPage: React.FC = () => {
    const [harga, setHarga] = useState(300000000);
    const [tipe, setTipe] = useState<PropertyType>('Subsidi');

    const formatIDR = (val: number) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    return (
        <div style={{ paddingBottom: '80px', backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ padding: '1.25rem 1rem 1rem', backgroundColor: 'var(--primary)', borderBottom: '1px solid var(--primary-dark)' }}>
                <h1 style={{ fontWeight: 700, fontSize: '1.2rem', color: 'white' }}>Simulasi KPR</h1>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
                    Hitung estimasi cicilan dan biaya pembiayaan
                </p>
            </div>

            <div className="container">
                {/* Input Harga & Tipe */}
                <div style={{
                    backgroundColor: 'white', borderRadius: '16px',
                    padding: '1.25rem', marginBottom: '1rem',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '1rem' }}>Parameter Rumah</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                                Harga Rumah: <span style={{ color: 'var(--primary)' }}>{formatIDR(harga)}</span>
                            </label>
                            <input
                                type="range"
                                min={100000000}
                                max={1500000000}
                                step={10000000}
                                value={harga}
                                onChange={e => setHarga(Number(e.target.value))}
                                style={{ width: '100%', accentColor: 'var(--primary)' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                <span>Rp 100jt</span><span>Rp 1,5M</span>
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Jenis Pembiayaan</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {(['Subsidi', 'Komersial'] as PropertyType[]).map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTipe(t)}
                                        style={{
                                            flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                                            backgroundColor: tipe === t ? 'var(--primary)' : 'var(--bg-color)',
                                            color: tipe === t ? 'white' : 'var(--text-muted)',
                                            border: `1px solid ${tipe === t ? 'var(--primary)' : 'var(--border-color)'}`,
                                        }}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* KprSimulator Component */}
                <KprSimulator propertyPrice={harga} propertyType={tipe} />

                {/* Info note */}
                <div style={{
                    marginTop: '1rem', padding: '0.875rem',
                    backgroundColor: '#FFF7ED', borderRadius: '12px',
                    border: '1px solid #FED7AA', fontSize: '0.78rem',
                    color: '#92400E', lineHeight: 1.6
                }}>
                    ⚠️ <strong>Catatan:</strong> Simulasi ini bersifat perkiraan. Angka cicilan dan biaya aktual dapat berbeda tergantung kebijakan bank penyalur dan persyaratan yang berlaku.
                </div>
            </div>
        </div>
    );
};

export default SimulasiPage;
