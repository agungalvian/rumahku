import React, { useState, useEffect, useRef } from 'react';
import PropertyCard from '../components/PropertyCard';
import { useAppContext } from '../context/AppContext';
import { useProperties } from '../hooks/useProperties';
import { Search, MapPin, ChevronRight, Bookmark, Bell, User, LogOut, UserPlus, LogIn, ChevronLeft, RefreshCw, Mail } from 'lucide-react';

interface HomePageProps {
    onNavigate: (page: string, id?: string) => void;
    onStartKpr?: () => void;
}

const services = [
    { key: 'kpr-flpp', label: 'KPR FLPP', subtitle: 'Kredit Pemilikan Rumah FLPP', iconPath: '/icons/kpr-flpp.png' },
    { key: 'kbr', label: 'KBR', subtitle: 'Kredit Bangun Rumah', iconPath: '/icons/kbr.png' },
    { key: 'krr', label: 'KRR', subtitle: 'Kredit Renovasi Rumah', iconPath: '/icons/krr.png' },
    { key: 'refund', label: 'E-Klaim', subtitle: 'Pengembalian Tabungan Rumahku', iconPath: '/icons/e-klaim.png' },
    { key: 'kpr-tapera', label: 'KPR TAPERA', subtitle: 'Kredit Pemilikan Rumah Bersubsidi', iconPath: '/icons/kpr-tapera.png' },
];


// Banner slides — add/remove entries here to manage the carousel
const bannerSlides = [
    { id: 1, imageUrl: '/banner-1.jpg' },
    { id: 2, imageUrl: '/banner-2.jpg' },
    { id: 3, imageUrl: '/banner-3.jpg' },
    { id: 4, imageUrl: '/banner-4.jpg' },
    { id: 5, imageUrl: '/banner-5.jpg' },
    { id: 6, imageUrl: '/banner-6.jpg' },
];

const HomePage: React.FC<HomePageProps> = ({ onNavigate, onStartKpr }) => {
    const { notifications, isLoggedIn, userName, login, logout, wishlist } = useAppContext();
    const { properties, loading, error, filters, setFilters, refetch, userCoords, setUserCoords } = useProperties();
    const [activeSlide, setActiveSlide] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ── Local UI state ─────────────────────────────────────────────────────
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showNotifPanel, setShowNotifPanel] = useState(false);
    const [loginMode, setLoginMode] = useState<'login' | 'daftar'>('login');
    const [loginInput, setLoginInput] = useState({ name: '', nik: '', password: '' });
    const [showWishlist, setShowWishlist] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleLogin = async () => {
        if (loginMode === 'daftar') {
            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nik: loginInput.nik, password: loginInput.password, nama_lengkap: loginInput.name })
                });
                const result = await res.json();

                if (res.ok && result.success) {
                    login({
                        nik: result.data.nik,
                        fullName: result.data.nama_lengkap,
                        email: '',
                        phone: ''
                    });
                    setShowLoginModal(false);
                    setLoginInput({ name: '', nik: '', password: '' });
                    alert(result.message);
                } else {
                    alert(result.error || 'Pendaftaran gagal');
                }
            } catch (err) {
                console.error('Register error', err);
                alert('Kesalahan jaringan. Pastikan backend aktif.');
            }
            return;
        }

        try {
            const res = await fetch('/api/peserta/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nik: loginInput.nik, password: loginInput.password })
            });
            const result = await res.json();

            if (res.ok && result.success) {
                // Populate Context Profile from postgres payload
                login({
                    nik: result.data.nik,
                    fullName: result.data.nama_lengkap,
                    email: '', // Fetch doesn't surface email, but safe to omit
                    phone: ''
                });
                setShowLoginModal(false);
                setLoginInput({ name: '', nik: '', password: '' });
                alert(result.message);
            } else {
                alert(result.error || 'Login gagal');
            }
        } catch (err) {
            console.error('Login error', err);
            alert('Kesalahan jaringan. Pastikan backend aktif.');
        }
    };

    const handleLogoutClick = () => {
        logout();
        setShowUserMenu(false);
    };

    // Auto-advance every 4 seconds
    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setActiveSlide(i => (i + 1) % bannerSlides.length);
        }, 4000);
    };

    useEffect(() => {
        startTimer();

        // Automatic location request on mount
        if (navigator.geolocation && !userCoords) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setFilters(prev => ({ ...prev, sortByDistance: true }));
                },
                (err) => {
                    console.error('Geolocation error:', err);
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }

        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, []);

    // Removed handleEnableLocation as it's now automatic.

    const goTo = (idx: number) => {
        setActiveSlide(idx);
        startTimer(); // reset timer on manual nav
    };

    // We rely on the hook's filtered properties from the API
    const filteredProperties = properties;


    return (
        <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '80px' }}>

            {/* ── Sticky green header ── */}
            <div style={{
                position: 'sticky', top: 0, zIndex: 20,
                background: 'var(--primary)',
                padding: '0.75rem 1rem 1rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'white', padding: '4px', borderRadius: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <img src="/logo.png" alt="Rumahku" style={{ height: '28px', width: '28px', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search
                            size={18}
                            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', pointerEvents: 'none' }}
                        />
                        <input
                            type="text"
                            placeholder="Cari Rumah"
                            readOnly
                            onClick={() => onNavigate('search')}
                            value={filters.keyword || ''}
                            style={{
                                width: '100%', paddingLeft: '38px', paddingRight: '12px',
                                height: '44px', borderRadius: '22px', border: 'none',
                                backgroundColor: 'white', fontSize: '0.9rem', color: '#1F2937',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            }}
                        />
                    </div>
                    {[
                        { Icon: Bookmark, badge: wishlist.length, onClick: () => setShowWishlist(true) },
                        { Icon: Bell, badge: notifications.length, onClick: () => setShowNotifPanel(true) }
                    ].map(({ Icon, badge, onClick }, i) => (
                        <button
                            key={i}
                            onClick={onClick}
                            style={{
                                position: 'relative', width: '40px', height: '40px', borderRadius: '50%',
                                backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}
                        >
                            <Icon size={20} color="white" />
                            {badge > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-2px', right: '-2px',
                                    backgroundColor: '#EF4444', color: 'white',
                                    borderRadius: '50%', width: '16px', height: '16px',
                                    fontSize: '0.6rem', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {badge}
                                </span>
                            )}
                        </button>
                    ))}

                    {/* User icon with dropdown */}
                    <div ref={userMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
                        <button
                            onClick={() => setShowUserMenu(v => !v)}
                            style={{
                                width: '40px', height: '40px', borderRadius: '50%',
                                backgroundColor: isLoggedIn ? 'white' : 'rgba(255,255,255,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: isLoggedIn ? '2px solid rgba(255,255,255,0.8)' : 'none',
                            }}
                        >
                            {isLoggedIn
                                ? <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--primary)' }}>{userName.charAt(0).toUpperCase()}</span>
                                : <User size={20} color="white" />}
                        </button>

                        {showUserMenu && (
                            <div style={{
                                position: 'absolute', top: '48px', right: 0,
                                backgroundColor: 'white', borderRadius: '12px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                minWidth: '160px', overflow: 'hidden', zIndex: 50,
                            }}>
                                {isLoggedIn ? (
                                    <>
                                        <div style={{ padding: '10px 14px', borderBottom: '1px solid #F3F4F6' }}>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Login sebagai</div>
                                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827' }}>{userName}</div>
                                        </div>
                                        <button onClick={() => { onNavigate('profile'); setShowUserMenu(false); }} style={{ width: '100%', padding: '11px 14px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#111827', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <User size={15} color="var(--primary)" /> Profil Saya
                                        </button>
                                        <button onClick={handleLogoutClick} style={{ width: '100%', padding: '11px 14px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#EF4444', background: 'none', border: 'none', borderTop: '1px solid #F3F4F6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <LogOut size={15} color="#EF4444" /> Keluar
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => { setLoginMode('daftar'); setShowLoginModal(true); setShowUserMenu(false); }} style={{ width: '100%', padding: '12px 14px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#111827', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <UserPlus size={15} color="var(--primary)" /> Daftar
                                        </button>
                                        <button onClick={() => { setLoginMode('login'); setShowLoginModal(true); setShowUserMenu(false); }} style={{ width: '100%', padding: '12px 14px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', border: 'none', borderTop: '1px solid #F3F4F6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <LogIn size={15} color="var(--primary)" /> Login
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Auto-sliding Banner Carousel ── */}
            <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
                {/* Slide content */}
                <div
                    style={{
                        display: 'flex',
                        transform: `translateX(-${activeSlide * 100}%)`,
                        transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
                    }}
                >
                    {bannerSlides.map((s) => (
                        <div
                            key={s.id}
                            style={{
                                minWidth: '100%',
                                height: '140px',
                                flexShrink: 0,
                                position: 'relative',
                            }}
                        >
                            <img
                                src={s.imageUrl}
                                alt={`Banner ${s.id}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Prev / Next arrows */}
                <button
                    onClick={() => goTo((activeSlide - 1 + bannerSlides.length) % bannerSlides.length)}
                    style={{
                        position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '50%',
                        width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <ChevronLeft size={16} color="white" />
                </button>
                <button
                    onClick={() => goTo((activeSlide + 1) % bannerSlides.length)}
                    style={{
                        position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: '50%',
                        width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <ChevronRight size={16} color="white" />
                </button>

                {/* Dot indicators */}
                <div style={{
                    position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)',
                    display: 'flex', gap: '6px',
                }}>
                    {bannerSlides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goTo(idx)}
                            style={{
                                width: idx === activeSlide ? '20px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                backgroundColor: idx === activeSlide ? 'white' : 'rgba(255,255,255,0.45)',
                                transition: 'all 0.3s ease',
                                padding: 0,
                            }}
                        />
                    ))}
                </div>
            </div>


            {/* ── Service Menu ── */}
            <div style={{
                backgroundColor: 'white',
                padding: '0.75rem 0',
                marginBottom: '0.5rem',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
            }}>
                <style>{`
                    .service-scroll-container::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                <div
                    className="service-scroll-container"
                    style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '0 1.25rem',
                        width: 'max-content',
                    }}
                >
                    {services.map(svc => (
                        <button
                            key={svc.key}
                            onClick={() => {
                                if (svc.key === 'kbr') onNavigate('kbr');
                                else if (svc.key === 'krr') onNavigate('krr');
                                else if (svc.key === 'refund') onNavigate('eklaim');
                                else onStartKpr?.();
                            }}
                            style={{
                                width: '72px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                background: 'none',
                                border: 'none',
                                padding: '4px 0',
                                flexShrink: 0,
                                transition: 'transform 0.2s',
                                cursor: 'pointer',
                            }}
                        >
                            <div style={{
                                width: '56px',
                                height: '56px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--primary-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '2px',
                                boxShadow: '0 2px 8px rgba(91,178,74,0.15)'
                            }}>
                                <img src={svc.iconPath} alt={svc.label} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                            </div>
                            <span style={{
                                fontSize: '0.68rem',
                                fontWeight: 600,
                                color: '#374151',
                                textAlign: 'center',
                                lineHeight: 1.2,
                                height: '2.4em',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {svc.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Property List ── */}
            <div style={{ padding: '0 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827' }}>
                        {filters.sortByDistance
                            ? 'Rumah Terdekat'
                            : filters.keyword || filters.provinsi || filters.kabKota || filters.kecamatan
                                ? 'Hasil Pencarian'
                                : 'Rekomendasi Terbaru'}
                    </h2>
                    {(filters.keyword || filters.provinsi || filters.kabKota || filters.kecamatan || filters.sortByDistance) && (
                        <button
                            onClick={() => {
                                setFilters({});
                                setUserCoords(null);
                            }}
                            style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            ✕ Hapus Filter
                        </button>
                    )}
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div style={{
                            width: '40px', height: '40px', border: '4px solid var(--border-color)',
                            borderTopColor: 'var(--primary)', borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
                        }} />
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Memuat data properti...</p>
                    </div>
                )}

                {!loading && error && (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Gagal memuat data: {error}</p>
                        <button className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={refetch}>
                            <RefreshCw size={16} /> Coba Lagi
                        </button>
                    </div>
                )}

                {!loading && !error && filteredProperties.map(property => (
                    <PropertyCard
                        key={property.id}
                        property={property}
                        onClick={(id) => onNavigate('detail', id)}
                    />
                ))}

                {!loading && !error && filteredProperties.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                        <MapPin size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                        <p>Tidak ada properti yang sesuai.</p>
                    </div>
                )}
            </div>

            {/* ── Notifications Panel ── */}
            {
                showNotifPanel && (
                    <div
                        onClick={() => setShowNotifPanel(false)}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            style={{ width: '100%', maxWidth: '480px', margin: '0 auto', backgroundColor: 'white', borderRadius: '20px 20px 0 0', padding: '1.25rem 1.25rem 2rem', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ width: '36px', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', margin: '0 auto 1.25rem' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827' }}>Notifikasi</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {notifications.length > 0 && (
                                        <span style={{ fontSize: '0.72rem', backgroundColor: 'var(--primary)', color: 'white', padding: '2px 10px', borderRadius: '20px', fontWeight: 600 }}>
                                            {notifications.length} baru
                                        </span>
                                    )}
                                    <button onClick={() => setShowNotifPanel(false)} style={{ border: 'none', background: '#F3F4F6', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <span style={{ fontSize: '1rem', color: '#6B7280', lineHeight: 1 }}>✕</span>
                                    </button>
                                </div>
                            </div>
                            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {notifications.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                                        <Mail size={36} style={{ margin: '0 auto 10px', opacity: 0.25 }} />
                                        <p style={{ fontSize: '0.85rem' }}>Tidak ada notifikasi baru.</p>
                                    </div>
                                ) : (
                                    notifications.map((notif, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '12px', padding: '10px 12px', backgroundColor: 'var(--primary-light)', borderRadius: '10px', borderLeft: '4px solid var(--primary)' }}>
                                            <Mail size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#111827' }}>{typeof notif === 'string' ? notif : notif}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* ── Login / Daftar Modal ── */}
            {
                showLoginModal && (
                    <div
                        onClick={() => setShowLoginModal(false)}
                        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
                    >
                        <div
                            onClick={e => e.stopPropagation()}
                            style={{ width: '100%', maxWidth: '480px', margin: '0 auto', backgroundColor: 'white', borderRadius: '20px 20px 0 0', padding: '1.5rem 1.25rem 2rem' }}
                        >
                            {/* Handle bar */}
                            <div style={{ width: '36px', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', margin: '0 auto 1.25rem' }} />

                            <h2 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#111827', marginBottom: '0.25rem' }}>
                                {loginMode === 'login' ? 'Login' : 'Buat Akun'}
                            </h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                                {loginMode === 'login' ? 'Masuk ke akun rumahku Anda' : 'Daftarkan diri Anda sekarang'}
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {loginMode === 'daftar' && (
                                    <input
                                        placeholder="Nama Lengkap"
                                        value={loginInput.name}
                                        onChange={e => setLoginInput(p => ({ ...p, name: e.target.value }))}
                                        style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                )}
                                <input
                                    type="number"
                                    placeholder="Nomor Induk Kependudukan (NIK)"
                                    value={loginInput.nik}
                                    onChange={e => setLoginInput(p => ({ ...p, nik: e.target.value }))}
                                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={loginInput.password}
                                    onChange={e => setLoginInput(p => ({ ...p, password: e.target.value }))}
                                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E5E7EB', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                />
                            </div>

                            <button
                                onClick={handleLogin}
                                style={{ width: '100%', marginTop: '16px', padding: '14px', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '0.95rem', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
                            >
                                {loginMode === 'login' ? 'Masuk' : 'Daftar Sekarang'}
                            </button>

                            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '14px' }}>
                                {loginMode === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
                                <button
                                    onClick={() => setLoginMode(m => m === 'login' ? 'daftar' : 'login')}
                                    style={{ color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}
                                >
                                    {loginMode === 'login' ? 'Daftar' : 'Login'}
                                </button>
                            </p>
                        </div>
                    </div>
                )
            }

            {/* ── Wishlist Bottom Sheet ── */}
            {showWishlist && (() => {
                const wishlistProperties = properties.filter(p => wishlist.includes(p.id));
                return (
                    <>
                        <div
                            onClick={() => setShowWishlist(false)}
                            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', zIndex: 40, backdropFilter: 'blur(2px)' }}
                        />
                        <div style={{
                            position: 'fixed', bottom: 0, left: 0, right: 0,
                            backgroundColor: 'white', borderRadius: '20px 20px 0 0',
                            boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
                            zIndex: 50, padding: '1.25rem 1rem 5rem', maxHeight: '80vh', overflowY: 'auto'
                        }}>
                            <div style={{ width: '40px', height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px', margin: '0 auto 1rem' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Bookmark size={18} color="var(--primary)" fill="var(--primary-light)" />
                                    Wishlist Saya ({wishlist.length})
                                </h2>
                                <button onClick={() => setShowWishlist(false)} style={{ border: 'none', background: '#F3F4F6', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <span style={{ fontSize: '1rem', color: '#6B7280', lineHeight: 1 }}>✕</span>
                                </button>
                            </div>

                            {wishlistProperties.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                                    <Bookmark size={44} color="#D1D5DB" style={{ margin: '0 auto 0.75rem' }} />
                                    <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>Belum ada rumah yang disimpan.</p>
                                    <p style={{ color: '#B0BAC9', fontSize: '0.78rem', marginTop: '4px' }}>Ketuk ikon ❤ pada listing untuk menyimpan.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {wishlistProperties.map(prop => (
                                        <div
                                            key={prop.id}
                                            onClick={() => { setShowWishlist(false); onNavigate('detail', prop.id); }}
                                            style={{
                                                display: 'flex', gap: '12px', backgroundColor: '#F9FAFB',
                                                borderRadius: '12px', padding: '0.75rem', cursor: 'pointer',
                                                border: '1px solid #E5E7EB', alignItems: 'center'
                                            }}
                                        >
                                            <img
                                                src={prop.imageUrl || '/placeholder.jpg'}
                                                alt={prop.title}
                                                style={{ width: '72px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                                            />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prop.title}</p>
                                                <p style={{ fontSize: '0.72rem', color: '#6B7280', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prop.location}</p>
                                                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(prop.price)}
                                                </p>
                                            </div>
                                            <ChevronRight size={16} color="#D1D5DB" style={{ flexShrink: 0 }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                );
            })()}
        </div >
    );
};

export default HomePage;
