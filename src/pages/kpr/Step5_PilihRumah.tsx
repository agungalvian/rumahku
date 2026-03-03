import React, { useState, useEffect } from 'react';
import { CheckCircle2, Loader, MapPin, BedDouble, Bath, Maximize, Calendar, Search } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useProperties } from '../../hooks/useProperties';

interface Step5Props {
    onSubmit: () => void;
}

type InnerStep = 'pilih' | 'form' | 'subsidi' | 'janji';

const Step5_PilihRumah: React.FC<Step5Props> = ({ onSubmit }) => {
    const { kprFormData, updateKprFormData } = useAppContext();
    const { properties, loading, error, refetch, setFilters } = useProperties();
    const [innerStep, setInnerStep] = useState<InnerStep>(kprFormData.selectedPropertyId ? 'form' : 'pilih');
    const [selectedId, setSelectedId] = useState<string | null>(kprFormData.selectedPropertyId);
    const [fullName, setFullName] = useState(kprFormData.fullName);
    const [job, setJob] = useState(kprFormData.job);
    const [income, setIncome] = useState(kprFormData.income);
    const [kkNumber, setKKNumber] = useState(kprFormData.kkNumber);
    const [npwp, setNpwp] = useState(kprFormData.npwp);
    const [maritalStatus, setMaritalStatus] = useState(kprFormData.maritalStatus);
    const [spouseNik, setSpouseNik] = useState(kprFormData.spouseNik);
    const [spouseName, setSpouseName] = useState(kprFormData.spouseName);
    const [spouseDob, setSpouseDob] = useState(kprFormData.spouseDob);
    const [spouseIncome, setSpouseIncome] = useState(kprFormData.spouseIncome);
    const [bankName, setBankName] = useState(kprFormData.bankName);
    const [subsidyDone, setSubsidyDone] = useState(false);
    const [date, setDate] = useState(kprFormData.appointmentDate);
    const [time, setTime] = useState(kprFormData.appointmentTime);
    const [searchQuery, setSearchQuery] = useState('');

    // Debounced search for server-side filtering
    useEffect(() => {
        const handler = setTimeout(() => {
            setFilters(prev => ({ ...prev, keyword: searchQuery }));
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery, setFilters]);

    const isMarried = maritalStatus === 'KAWIN';

    const isFormValid = !!(
        fullName && job && income && kkNumber && maritalStatus && bankName &&
        (!isMarried || (spouseNik && spouseName && spouseDob && spouseIncome))
    );

    const selectedProperty = properties.find(p => p.id === selectedId);

    const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    const handleSelectProperty = (id: string) => {
        setSelectedId(id);
        updateKprFormData({ selectedPropertyId: id });
        setInnerStep('form');
    };

    const handleFormNext = () => {
        updateKprFormData({
            fullName, job, income, kkNumber, npwp, maritalStatus,
            spouseNik, spouseName, spouseDob, spouseIncome, bankName
        });
        setInnerStep('subsidi');
        // Simulate subsidy check
        setTimeout(() => {
            setSubsidyDone(true);
        }, 2500);
    };

    const handleFinalSubmit = () => {
        updateKprFormData({ appointmentDate: date, appointmentTime: time });
        onSubmit();
    };

    const innerStepIndex = ({ pilih: 0, form: 1, subsidi: 2, janji: 3 } as Record<InnerStep, number>)[innerStep];
    const innerLabels = ['Pilih', 'Form', 'Subsidi', 'Janji'];

    return (
        <div style={{ padding: '1.5rem' }}>
            {/* Sub-step bar */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem' }}>
                {innerLabels.map((label, idx) => (
                    <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ height: '4px', borderRadius: '2px', marginBottom: '4px', backgroundColor: idx <= innerStepIndex ? 'var(--primary)' : 'var(--border-color)' }} />
                        <span style={{ fontSize: '0.65rem', color: idx === innerStepIndex ? 'var(--primary)' : 'var(--text-muted)', fontWeight: idx === innerStepIndex ? 700 : 400 }}>
                            {label}
                        </span>
                    </div>
                ))}
            </div>

            {/* LOADING STATE */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <div style={{
                        width: '40px', height: '40px', border: '4px solid var(--border-color)',
                        borderTopColor: 'var(--primary)', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
                    }} />
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Memuat data properti...</p>
                </div>
            )}

            {/* ERROR STATE */}
            {!loading && error && (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <div style={{ color: '#EF4444', marginBottom: '1rem' }}>
                        <p style={{ fontWeight: 600 }}>Gagal Memuat Data</p>
                        <p style={{ fontSize: '0.85rem' }}>{error}</p>
                    </div>
                    <button
                        onClick={refetch}
                        style={{
                            padding: '8px 20px', borderRadius: '8px', backgroundColor: 'var(--primary)',
                            color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        Coba Lagi
                    </button>
                </div>
            )}

            {/* PILIH HUNIAN */}
            {!loading && innerStep === 'pilih' && (
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Pilih Hunian</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Pilih rumah yang ingin Anda ajukan pembiayaannya.</p>

                    {/* Search Bar */}
                    <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
                        <Search
                            size={18}
                            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }}
                        />
                        <input
                            type="text"
                            placeholder="Cari nama perumahan atau lokasi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', paddingLeft: '40px', paddingRight: '12px',
                                height: '44px', borderRadius: '12px', border: '1px solid var(--border-color)',
                                backgroundColor: 'white', fontSize: '0.9rem', color: '#1F2937',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {properties.map(p => (
                            <button
                                key={p.id}
                                onClick={() => handleSelectProperty(p.id)}
                                style={{
                                    display: 'flex', gap: '0.875rem', padding: '0.875rem',
                                    backgroundColor: 'white', borderRadius: '14px',
                                    border: `2px solid ${selectedId === p.id ? 'var(--primary)' : 'var(--border-color)'}`,
                                    cursor: 'pointer', textAlign: 'left', width: '100%'
                                }}
                            >
                                <img src={p.imageUrl} alt={p.title} style={{ width: '80px', height: '70px', objectFit: 'cover', borderRadius: '10px', flexShrink: 0 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '4px', alignItems: 'center' }}>
                                        <span style={{
                                            fontSize: '0.7rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                                            backgroundColor: p.type === 'Subsidi' ? '#DCFCE7' : '#FEF3C7',
                                            color: p.type === 'Subsidi' ? '#166534' : '#92400E'
                                        }}>{p.type === 'Subsidi' ? 'SUBSIDI' : 'KOMERSIAL'}</span>
                                    </div>
                                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginBottom: '4px' }}>
                                        <MapPin size={11} /> {p.location}
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><BedDouble size={12} /> {p.specifications.bedrooms} KT</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Bath size={12} /> {p.specifications.bathrooms} KM</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Maximize size={12} /> {p.specifications.landArea}m²</span>
                                    </div>
                                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.9rem', marginTop: '4px' }}>{formatIDR(p.price)}</div>
                                </div>
                            </button>
                        ))}

                        {properties.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                                <div style={{
                                    width: '64px', height: '64px', backgroundColor: '#F3F4F6',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 1rem'
                                }}>
                                    <Search size={32} style={{ opacity: 0.3 }} />
                                </div>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Rumah tidak ditemukan</p>
                                <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>Coba gunakan kata kunci lain atau hapus pencarian.</p>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        style={{
                                            background: 'none', border: `1px solid var(--primary)`,
                                            color: 'var(--primary)', padding: '6px 16px', borderRadius: '8px',
                                            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                                        }}
                                    >
                                        Hapus Pencarian
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ISI FORM */}
            {!loading && innerStep === 'form' && selectedProperty && (
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Formulir Pengajuan</h2>
                    {/* Selected Property Banner */}
                    <div style={{
                        display: 'flex', gap: '0.75rem', padding: '0.75rem',
                        backgroundColor: '#F0FDF4', borderRadius: '12px',
                        border: '1px solid #BBF7D0', marginBottom: '1.25rem', marginTop: '0.75rem'
                    }}>
                        <img src={selectedProperty.imageUrl} alt={selectedProperty.title} style={{ width: '56px', height: '48px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{selectedProperty.title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>{formatIDR(selectedProperty.price)}</div>
                        </div>
                        <button style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#16A34A', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, alignSelf: 'center' }} onClick={() => setInnerStep('pilih')}>
                            Ganti
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>NIK (Terverifikasi)</label>
                            <input value={kprFormData.nik} disabled style={{ backgroundColor: '#F3F4F6', color: '#6B7280', cursor: 'not-allowed' }} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Nama Lengkap</label>
                            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Sesuai KTP" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>No. Kartu Keluarga (KK)</label>
                                <input type="tel" value={kkNumber} onChange={e => setKKNumber(e.target.value.replace(/\D/g, ''))} placeholder="16 digit" maxLength={16} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>NPWP (Opsional)</label>
                                <input type="tel" value={npwp} onChange={e => setNpwp(e.target.value.replace(/\D/g, ''))} placeholder="15/16 digit" />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Status Pernikahan</label>
                            <select value={maritalStatus} onChange={e => setMaritalStatus(e.target.value as any)}>
                                <option value="">Pilih Status</option>
                                <option value="Tidak Kawin">Tidak Kawin</option>
                                <option value="KAWIN">KAWIN</option>
                            </select>
                        </div>

                        {isMarried && (
                            <div style={{
                                backgroundColor: '#F9FAFB', padding: '1rem', borderRadius: '12px',
                                border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.875rem'
                            }}>
                                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: 'var(--primary)' }}>Data Pasangan</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>NIK Pasangan</label>
                                        <input type="tel" value={spouseNik} onChange={e => setSpouseNik(e.target.value.replace(/\D/g, ''))} placeholder="16 digit" maxLength={16} style={{ fontSize: '0.85rem', padding: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Nama Pasangan</label>
                                        <input value={spouseName} onChange={e => setSpouseName(e.target.value)} placeholder="Sesuai KTP" style={{ fontSize: '0.85rem', padding: '8px' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Tanggal Lahir Pasangan</label>
                                        <input type="date" value={spouseDob} onChange={e => setSpouseDob(e.target.value)} style={{ fontSize: '0.85rem', padding: '8px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Penghasilan Pasangan (Rp)</label>
                                        <input type="tel" value={spouseIncome} onChange={e => setSpouseIncome(e.target.value.replace(/\D/g, ''))} placeholder="Contoh: 4000000" style={{ fontSize: '0.85rem', padding: '8px' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Pekerjaan</label>
                                <select value={job} onChange={e => setJob(e.target.value)} style={{ padding: '10px' }}>
                                    <option value="">Pilih</option>
                                    <option>PNS</option>
                                    <option>TNI/POLRI</option>
                                    <option>Karyawan</option>
                                    <option>Wiraswasta</option>
                                    <option>Lainnya</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Penghasilan (Rp)</label>
                                <input type="tel" value={income} onChange={e => setIncome(e.target.value.replace(/\D/g, ''))} placeholder="5000000" />
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Bank Pembiayaan</label>
                            <select value={bankName} onChange={e => setBankName(e.target.value)}>
                                <option value="">Pilih Bank</option>
                                <option>Bank BTN</option>
                                <option>Bank BTN Syariah</option>
                                <option>Bank BRI</option>
                                <option>Bank BNI</option>
                                <option>Bank Mandiri</option>
                                <option>Bank BSI</option>
                                <option>Bank Jabar (BJB)</option>
                                <option>Bank Sumut</option>
                                <option>Bank Nagari</option>
                            </select>
                        </div>
                    </div>
                    <button
                        className="btn btn-primary btn-block"
                        style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '14px', opacity: isFormValid ? 1 : 0.6 }}
                        disabled={!isFormValid}
                        onClick={handleFormNext}
                    >
                        Ajukan Sekarang →
                    </button>
                </div>
            )}

            {/* SUBSIDI CHECK */}
            {!loading && innerStep === 'subsidi' && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Subsidi Checking</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
                        Sistem sedang memverifikasi kualifikasi subsidi Anda...
                    </p>

                    {!subsidyDone ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                            {[
                                'Verifikasi data identitas...',
                                'Cek riwayat kepemilikan rumah...',
                                'Kalkulasi kelayakan subsidi...',
                            ].map((item, idx) => (
                                <div key={idx} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                                    padding: '0.875rem', backgroundColor: 'white',
                                    borderRadius: '12px', border: '1px solid var(--border-color)'
                                }}>
                                    <Loader size={18} color="var(--primary)" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                backgroundColor: '#DCFCE7', margin: '0 auto 1.25rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <CheckCircle2 size={48} color="#166534" />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#166534', marginBottom: '0.5rem' }}>
                                Anda Memenuhi Kualifikasi!
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
                                Selamat! Data Anda memenuhi persyaratan subsidi pembiayaan Tapera.
                            </p>
                            <button
                                className="btn btn-block"
                                style={{ padding: '1rem', borderRadius: '14px', backgroundColor: '#166534', color: 'white', fontWeight: 700 }}
                                onClick={() => setInnerStep('janji')}
                            >
                                Atur Janji Temu →
                            </button>
                        </div>
                    )}
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                </div>
            )}

            {/* JANJI TEMU */}
            {!loading && innerStep === 'janji' && (
                <div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Janji Temu</h2>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        Pilih jadwal untuk verifikasi dokumen di kantor bank penyalur.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                                <Calendar size={14} style={{ display: 'inline', marginRight: '5px' }} />
                                Tanggal Janji Temu
                            </label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Pilih Waktu</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTime(t)}
                                        style={{
                                            padding: '8px 16px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                                            backgroundColor: time === t ? 'var(--primary)' : 'white',
                                            color: time === t ? 'white' : 'var(--text-main)',
                                            border: `1px solid ${time === t ? 'var(--primary)' : 'var(--border-color)'}`
                                        }}
                                    >
                                        {t} WIB
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div style={{
                        marginTop: '1.5rem', padding: '1rem', backgroundColor: '#F0FDF4',
                        borderRadius: '12px', border: '1px solid #BBF7D0'
                    }}>
                        <p style={{ fontSize: '0.8rem', color: '#166534', lineHeight: 1.6 }}>
                            📍 <strong>Lokasi:</strong> Bank BTN / BRI / BSI terdekat yang melayani program Tapera di kota Anda.
                        </p>
                    </div>
                    <button
                        className="btn btn-primary btn-block"
                        style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '14px', opacity: date && time ? 1 : 0.6 }}
                        disabled={!date || !time}
                        onClick={handleFinalSubmit}
                    >
                        Kirim Pengajuan →
                    </button>
                </div>
            )}
        </div>
    );
};

export default Step5_PilihRumah;
