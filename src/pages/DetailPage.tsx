import React, { useState, useEffect, useRef } from 'react';
import { useProperties } from '../hooks/useProperties';
import KprSimulator from '../components/KprSimulator';
import PropertyMap from '../components/PropertyMap';
import { useSiteplan } from '../hooks/useSiteplan';
import { useAppContext } from '../context/AppContext';
import { Heart, ArrowLeft, Share2, Maximize, Home, BedDouble, Bath, ShieldCheck, MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface DetailPageProps {
    propertyId: string;
    onNavigate: (page: string) => void;
    onStartKpr: (propertyId: string) => void;
}

const DetailPage: React.FC<DetailPageProps> = ({ propertyId, onNavigate, onStartKpr }) => {
    const { properties } = useProperties();
    const property = properties.find(p => p.id === propertyId);
    const { wishlist, addToWishlist, removeFromWishlist } = useAppContext();
    const { data: siteplanData, loading: siteplanLoading } = useSiteplan(propertyId);

    const isWishlisted = property ? wishlist.includes(property.id) : false;
    const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    const toggleWishlist = () => {
        if (property) isWishlisted ? removeFromWishlist(property.id) : addToWishlist(property.id);
    };

    // ── Carousel Logic (Must be at top level) ──────────────────────────────
    const galleryItems = property
        ? (property.galleryUrls && property.galleryUrls.length > 0 ? property.galleryUrls : [property.imageUrl])
        : [];

    const [activeImage, setActiveImage] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const autoSlideTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    const nextImage = () => setActiveImage(prev => (prev + 1) % (galleryItems.length || 1));
    const prevImage = () => setActiveImage(prev => (prev - 1 + galleryItems.length) % (galleryItems.length || 1));

    useEffect(() => {
        if (!isPaused && galleryItems.length > 1) {
            autoSlideTimer.current = setInterval(nextImage, 4000);
        }
        return () => {
            if (autoSlideTimer.current) clearInterval(autoSlideTimer.current);
        };
    }, [isPaused, galleryItems.length]);

    // Touch Handling
    const touchStartX = useRef<number | null>(null);
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        setIsPaused(true);
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const touchEndUnits = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndUnits;

        if (Math.abs(diff) > 50) {
            if (diff > 0) nextImage();
            else prevImage();
        }
        touchStartX.current = null;
        setTimeout(() => setIsPaused(false), 2000);
    };

    if (!property) return <div className="p-4">Memuat data properti...</div>;

    return (
        <div style={{ paddingBottom: '80px', backgroundColor: 'var(--bg-color)' }}>
            {/* Header Actions */}
            <div style={{ position: 'fixed', top: 0, width: '100%', maxWidth: '480px', zIndex: 50, padding: '1rem', display: 'flex', justifyContent: 'space-between', background: 'linear-gradient(rgba(0,0,0,0.5), transparent)' }}>
                <button onClick={() => onNavigate('home')} style={{ backgroundColor: 'white', borderRadius: '50%', padding: '8px' }}>
                    <ArrowLeft size={20} />
                </button>
                <div className="flex gap-2">
                    <button style={{ backgroundColor: 'white', borderRadius: '50%', padding: '8px' }}>
                        <Share2 size={20} />
                    </button>
                    <button onClick={toggleWishlist} style={{ backgroundColor: 'white', borderRadius: '50%', padding: '8px' }}>
                        <Heart fill={isWishlisted ? "var(--danger)" : "transparent"} color={isWishlisted ? "var(--danger)" : "var(--text-main)"} size={20} />
                    </button>
                </div>
            </div>

            {/* Carousel Gallery */}
            <div
                style={{ position: 'relative', height: '300px', backgroundColor: '#000', overflow: 'hidden' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {/* Image Track */}
                <div style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: `translateX(-${activeImage * 100}%)`
                }}>
                    {galleryItems.map((url, idx) => (
                        <div key={idx} style={{ flexShrink: 0, width: '100%', height: '100%' }}>
                            <img
                                src={url}
                                alt={`${property.title} - ${idx + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    ))}
                </div>

                {/* Click Navigation Overlays */}
                <div
                    onClick={prevImage}
                    style={{ position: 'absolute', top: 0, left: 0, width: '25%', height: '100%', zIndex: 5, cursor: 'pointer' }}
                />
                <div
                    onClick={() => setIsFullscreen(true)}
                    style={{ position: 'absolute', top: 0, left: '25%', width: '50%', height: '100%', zIndex: 5, cursor: 'zoom-in' }}
                />
                <div
                    onClick={nextImage}
                    style={{ position: 'absolute', top: 0, right: 0, width: '25%', height: '100%', zIndex: 5, cursor: 'pointer' }}
                />

                {/* Indicators */}
                <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', display: 'flex', gap: '8px', zIndex: 10 }}>
                    <span className="badge" style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(4px)' }}>📹 360° View</span>
                    <span className="badge" style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', backdropFilter: 'blur(4px)' }}>
                        {activeImage + 1}/{galleryItems.length} Foto
                    </span>
                </div>

                {/* Dot Pagination */}
                {galleryItems.length > 1 && (
                    <div style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px', zIndex: 10 }}>
                        {galleryItems.map((_, idx) => (
                            <div
                                key={idx}
                                style={{
                                    width: idx === activeImage ? '16px' : '6px',
                                    height: '6px',
                                    borderRadius: '3px',
                                    backgroundColor: idx === activeImage ? 'white' : 'rgba(255,255,255,0.5)',
                                    transition: 'all 0.3s'
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="container" style={{ backgroundColor: 'white', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', marginTop: '-20px', position: 'relative', paddingBottom: '2rem' }}>
                <div className="flex justify-between items-start mb-2 pt-2">
                    <div>
                        <span className={`badge mb-2 ${property.type === 'Subsidi' ? 'badge-subsidi' : 'badge-komersial'}`}>
                            {property.type}
                        </span>
                        <h1 className="font-bold text-2xl mb-1">{property.title}</h1>
                        <p className="text-muted text-sm flex items-center gap-1"><MapPin size={14} /> {property.location}</p>
                    </div>
                    {property.type === 'Subsidi' && (
                        <img src="/logo.png" alt="Rumahku" style={{ height: '36px' }} />
                    )}
                </div>

                <div className="font-bold text-3xl text-primary mb-4">
                    {formatIDR(property.price)}
                </div>

                {/* Specifications */}
                <div className="flex justify-between mb-6 p-3 bg-gray-50 rounded" style={{ backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-md)' }}>
                    <div className="text-center"><BedDouble className="mx-auto mb-1" size={20} color="var(--primary)" /> <div className="text-sm font-semibold">{property.specifications.bedrooms} KT</div></div>
                    <div className="text-center"><Bath className="mx-auto mb-1" size={20} color="var(--primary)" /> <div className="text-sm font-semibold">{property.specifications.bathrooms} KM</div></div>
                    <div className="text-center"><Home className="mx-auto mb-1" size={20} color="var(--primary)" /> <div className="text-sm font-semibold">{property.specifications.buildArea}m²</div></div>
                    <div className="text-center"><Maximize className="mx-auto mb-1" size={20} color="var(--primary)" /> <div className="text-sm font-semibold">{property.specifications.landArea}m²</div></div>
                </div>

                {/* Features */}
                <h3 className="font-bold text-lg mb-3">Fasilitas &amp; Keunggulan</h3>

                {/* Spesifikasi material — 2 baris × 2 kolom */}
                {property.facilities.length > 0 && (() => {
                    const rows = [
                        property.facilities.slice(0, 2),  // Atap, Dinding
                        property.facilities.slice(2, 4),  // Lantai, Pondasi
                    ].filter(r => r.length > 0);
                    return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                            {rows.map((row, ri) => (
                                <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                    {row.map((item, ci) => {
                                        // item format: "Label: Value"
                                        const colonIdx = item.indexOf(': ');
                                        const label = colonIdx !== -1 ? item.slice(0, colonIdx) : item;
                                        const value = colonIdx !== -1 ? item.slice(colonIdx + 2) : '';
                                        return (
                                            <div key={ci} style={{
                                                display: 'flex', alignItems: 'flex-start', gap: '8px',
                                                backgroundColor: '#F0FDF4', borderRadius: '10px',
                                                padding: '10px 12px', fontSize: '0.8rem',
                                            }}>
                                                <ShieldCheck size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                                <div>
                                                    <div style={{ fontWeight: 700, color: '#111827' }}>{label}</div>
                                                    {value && <div style={{ color: '#4B5563', marginTop: '2px' }}>{value}</div>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    );
                })()}

                {/* Keunggulan chips */}
                {property.features.length > 0 && (
                    <ul className="mb-6 flex flex-wrap gap-2">
                        {property.features.map((feat, idx) => (
                            <li key={idx} style={{ backgroundColor: '#EFF6FF', borderRadius: '9999px', padding: '4px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                                <ShieldCheck size={13} color="var(--primary)" /> {feat}
                            </li>
                        ))}
                    </ul>
                )}

                {/* Interactive Map */}
                <h3 className="font-bold text-lg mb-2">Lokasi &amp; Lingkungan</h3>
                <PropertyMap
                    lat={property.coordinates.lat}
                    lng={property.coordinates.lng}
                    title={property.title}
                    location={property.location}
                />

                {/* Siteplan & Denah */}
                {(siteplanLoading || siteplanData?.siteplan || siteplanData?.fotoDenah) && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 className="font-bold text-lg mb-3">Siteplan &amp; Denah</h3>
                        {siteplanLoading ? (
                            <div style={{ height: '150px', backgroundColor: '#F3F4F6', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                <div style={{ width: '28px', height: '28px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: '10px' }} />
                                Memuat siteplan...
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                                {siteplanData?.siteplan && (
                                    <a href={siteplanData.siteplan} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textAlign: 'center' }}>SITEPLAN</div>
                                        <img
                                            src={siteplanData.siteplan}
                                            alt="Siteplan"
                                            style={{ width: '240px', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'block' }}
                                        />
                                    </a>
                                )}
                                {siteplanData?.fotoDenah && (
                                    <a href={siteplanData.fotoDenah} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textAlign: 'center' }}>DENAH</div>
                                        <img
                                            src={siteplanData.fotoDenah}
                                            alt="Denah Rumah"
                                            style={{ width: '180px', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'block' }}
                                        />
                                    </a>
                                )}
                                {siteplanData?.fotoTampak && (
                                    <a href={siteplanData.fotoTampak} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px', textAlign: 'center' }}>TAMPAK</div>
                                        <img
                                            src={siteplanData.fotoTampak}
                                            alt="Tampak Depan"
                                            style={{ width: '180px', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'block' }}
                                        />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Simulator */}
                <KprSimulator propertyPrice={property.price} propertyType={property.type} />

            </div>

            {/* Fixed Bottom Action */}
            <div style={{ position: 'fixed', bottom: 0, width: '100%', maxWidth: '480px', backgroundColor: 'white', borderTop: '1px solid var(--border-color)', padding: '1rem', display: 'flex', gap: '0.75rem', zIndex: 40 }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => onNavigate('home')}>
                    ← Kembali
                </button>
                <button className="btn btn-primary" style={{ flex: 2 }} onClick={() => onStartKpr(property.id)}>
                    Ajukan KPR Sekarang
                </button>
            </div>
            {/* Fullscreen Modal Viewer */}
            {isFullscreen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    backgroundColor: 'black', zIndex: 999,
                    display: 'flex', flexDirection: 'column',
                }}>
                    {/* Modal Header */}
                    <div style={{
                        padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        color: 'white', background: 'rgba(0,0,0,0.3)', position: 'absolute', top: 0, width: '100%', zIndex: 1010
                    }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{activeImage + 1} / {galleryItems.length} Foto</span>
                        <button onClick={() => setIsFullscreen(false)} style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: '50%', padding: '8px', border: 'none', color: 'white' }}>
                            <X size={24} />
                        </button>
                    </div>

                    {/* Main Fullscreen Gallery Container */}
                    <div
                        style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center' }}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div style={{
                            display: 'flex', width: '100%', height: '80vh',
                            transition: 'transform 0.4s ease-out',
                            transform: `translateX(-${activeImage * 100}%)`
                        }}>
                            {galleryItems.map((url, idx) => (
                                <div key={idx} style={{ flexShrink: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={url} alt={`Zoom ${idx + 1}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                </div>
                            ))}
                        </div>

                        {/* Modal Navigation Arrows */}
                        <button onClick={prevImage} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', padding: '10px', color: 'white', zIndex: 1010 }}>
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={nextImage} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', padding: '10px', color: 'white', zIndex: 1010 }}>
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailPage;
