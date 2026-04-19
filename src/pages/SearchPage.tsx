import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useProperties } from '../hooks/useProperties';
import PropertyCard from '../components/PropertyCard';

interface SearchPageProps {
    onNavigate: (page: string) => void;
}

const SearchPage: React.FC<SearchPageProps> = ({ onNavigate }) => {
    const { setFilters, filters, properties, loading, error, wilayahOptions } = useProperties();
    const [localKeyword, setLocalKeyword] = useState(filters.keyword || '');
    const [selectedProv, setSelectedProv] = useState(filters.provinsi || '');
    const [selectedKab, setSelectedKab] = useState(filters.kabKota || '');
    const [selectedKec, setSelectedKec] = useState(filters.kecamatan || '');
    const [showFilters, setShowFilters] = useState(false);

    // Debounce: auto-apply keyword filter 500ms after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, keyword: localKeyword || undefined }));
        }, 500);
        return () => clearTimeout(timer);
    }, [localKeyword]);



    const handleApplyFilter = () => {
        setFilters({
            keyword: localKeyword,
            provinsi: selectedProv,
            kabKota: selectedKab,
            kecamatan: selectedKec,
            sortByDistance: true
        });
        setShowFilters(false);
    };

    const handleReset = () => {
        setLocalKeyword('');
        setSelectedProv('');
        setSelectedKab('');
        setSelectedKec('');
        setFilters({ sortByDistance: true });
    };

    const handlePropertyClick = (id: string) => {
        onNavigate('detail');
        // We'd usually update context or pass state, but for this app structure:
        const url = new URL(window.location.href);
        url.searchParams.set('id', id);
        window.history.pushState({ page: 'detail', propertyId: id }, '', url);
        // Dispatch custom event if App.tsx listens to it, or just trigger parent nav
        (onNavigate as any)('detail', id);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
            {/* ── Sticky Search Header ── */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 100,
                backgroundColor: 'white',
                borderBottom: '1px solid #E5E7EB',
                padding: '0.75rem 1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <button
                        onClick={() => onNavigate('home')}
                        style={{ padding: '8px', border: 'none', background: 'none' }}
                    >
                        <ArrowLeft size={24} color="#374151" />
                    </button>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                        <input
                            type="text"
                            placeholder="Ketik nama perumahan, kota, provinsi..."
                            value={localKeyword}
                            onChange={e => setLocalKeyword(e.target.value)}
                            autoFocus
                            style={{
                                width: '100%', padding: '0.6rem 0.6rem 0.6rem 2.5rem',
                                borderRadius: '10px', border: '1.5px solid #F3F4F6',
                                backgroundColor: '#F9FAFB', fontSize: '0.9rem'
                            }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setShowFilters(true)}
                        style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                            padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--primary)',
                            backgroundColor: (selectedProv || selectedKab) ? 'var(--primary-light)' : 'white',
                            color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600
                        }}
                    >
                        <SlidersHorizontal size={16} />
                        {(selectedProv || selectedKab) ? 'Filter Aktif' : 'Filter'}
                        <ChevronDown size={14} />
                    </button>
                    {(localKeyword || selectedProv || selectedKab) && (
                        <button
                            onClick={handleReset}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '8px', border: 'none',
                                backgroundColor: '#FEE2E2', color: '#EF4444',
                                fontSize: '0.85rem', fontWeight: 600
                            }}
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {/* ── Main Results List ── */}
            <div style={{ padding: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
                        {loading ? 'Mencari...' : `${properties.length} Rumah ditemukan`}
                        {localKeyword && !loading && <span style={{ fontWeight: 400, color: '#6B7280' }}> untuk "{localKeyword}"</span>}
                    </h2>
                    <p style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '2px' }}>Data dari Tapera Sikumbang API</p>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="pulse" style={{ height: '280px', backgroundColor: 'white', borderRadius: '12px' }} />
                        ))}
                    </div>
                ) : error ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444' }}>
                        <p>{error}</p>
                        <button onClick={handleApplyFilter} style={{ marginTop: '1rem', color: 'var(--primary)', fontWeight: 600 }}>Coba lagi</button>
                    </div>
                ) : properties.length === 0 ? (
                    <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                        <div style={{ backgroundColor: '#F3F4F6', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <Search size={32} color="#9CA3AF" />
                        </div>
                        <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Hasil tidak ditemukan</h3>
                        <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>Coba ubah kata kunci atau hapus filter wilayah Anda.</p>
                    </div>
                ) : (
                    <div>
                        {properties.map(p => (
                            <PropertyCard key={p.id} property={p} onClick={handlePropertyClick} />
                        ))}
                    </div>
                )
                }
            </div>

            {/* ── Filter Modal ── */}
            {showFilters && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200,
                    display: 'flex', alignItems: 'flex-end'
                }}>
                    <div style={{
                        width: '100%', maxWidth: '480px', margin: '0 auto',
                        backgroundColor: 'white', borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
                        padding: '1.5rem', maxHeight: '85vh', overflowY: 'auto'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Filter Wilayah</h2>
                            <button onClick={() => setShowFilters(false)} style={{ padding: '4px', border: 'none', background: 'none' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Provinsi */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    Provinsi <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({wilayahOptions.provinsi.length} tersedia)</span>
                                </label>
                                <select
                                    value={selectedProv}
                                    onChange={e => { setSelectedProv(e.target.value); setSelectedKab(''); setSelectedKec(''); }}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #E5E7EB', backgroundColor: 'white', fontSize: '0.9rem' }}
                                >
                                    <option value="">Semua Provinsi</option>
                                    {wilayahOptions.provinsi.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                            {/* Kab/Kota — only show options for selected province */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    Kabupaten/Kota
                                    {selectedProv && <span style={{ color: '#9CA3AF', fontWeight: 400 }}> ({(wilayahOptions.kabKota[selectedProv] ?? []).length} tersedia)</span>}
                                </label>
                                <select
                                    value={selectedKab}
                                    onChange={e => { setSelectedKab(e.target.value); setSelectedKec(''); }}
                                    disabled={!selectedProv}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #E5E7EB', backgroundColor: selectedProv ? 'white' : '#F9FAFB', fontSize: '0.9rem' }}
                                >
                                    <option value="">{selectedProv ? 'Semua Kab/Kota' : '— Pilih Provinsi dulu —'}</option>
                                    {(wilayahOptions.kabKota[selectedProv] ?? []).map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>

                            {/* Kecamatan — only show options for selected kab/kota */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                    Kecamatan
                                    {selectedKab && <span style={{ color: '#9CA3AF', fontWeight: 400 }}> ({(wilayahOptions.kecamatan[selectedKab] ?? []).length} tersedia)</span>}
                                </label>
                                <select
                                    value={selectedKec}
                                    onChange={e => setSelectedKec(e.target.value)}
                                    disabled={!selectedKab}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid #E5E7EB', backgroundColor: selectedKab ? 'white' : '#F9FAFB', fontSize: '0.9rem' }}
                                >
                                    <option value="">{selectedKab ? 'Semua Kecamatan' : '— Pilih Kab/Kota dulu —'}</option>
                                    {(wilayahOptions.kecamatan[selectedKab] ?? []).map(k => <option key={k} value={k}>{k}</option>)}
                                </select>
                            </div>
                        </div>


                        <button
                            onClick={handleApplyFilter}
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '30px',
                                backgroundColor: 'var(--primary)', color: 'white', border: 'none',
                                fontSize: '1rem', fontWeight: 700, marginTop: '2rem'
                            }}
                        >
                            Tampilkan Hasil
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchPage;
