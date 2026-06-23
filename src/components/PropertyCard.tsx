import React from 'react';
import type { Property } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { Heart, MapPin, BedDouble, Bath, Maximize } from 'lucide-react';

interface PropertyCardProps {
    property: Property;
    onClick: (id: string) => void;
    variant?: 'list' | 'grid';
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick, variant = 'list' }) => {
    const { wishlist, addToWishlist, removeFromWishlist } = useAppContext();
    const isWishlisted = wishlist.includes(property.id);

    const toggleWishlist = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isWishlisted) {
            removeFromWishlist(property.id);
        } else {
            addToWishlist(property.id);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="card mb-4" onClick={() => onClick(property.id)} style={{ cursor: 'pointer', backgroundColor: 'var(--primary-light)' }}>
            <div style={{ position: 'relative' }}>
                <img
                    src={property.imageUrl}
                    alt={property.title}
                    style={{ width: '100%', aspectRatio: variant === 'grid' ? '1 / 1' : 'auto', height: variant === 'grid' ? 'auto' : '200px', objectFit: 'cover' }}
                />
                {(() => {
                    const jp = (property as any).jenisPerumahan;
                    const isTapak = jp === 'Rumah Tapak';
                    const isSusun = jp === 'Rumah Susun';

                    if (!isTapak && !isSusun) return null;

                    return (
                        <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <div style={{
                                backgroundColor: isTapak ? 'rgba(38, 99, 235, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                padding: '4px 8px',
                                borderRadius: '6px', display: 'flex', alignItems: 'center',
                                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                                fontSize: '0.75rem', fontWeight: 700, 
                                color: isTapak ? '#ffffff' : 'var(--primary)',
                                height: '32px', boxSizing: 'border-box'
                            }}>
                                {isTapak ? 'Tapak' : 'Susun'}
                            </div>
                        </div>
                    );
                })()}
                <button
                    onClick={toggleWishlist}
                    style={{
                        position: 'absolute', top: '10px', right: '10px',
                        backgroundColor: 'rgba(255,255,255,0.8)', padding: '8px',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <Heart fill={isWishlisted ? "var(--danger)" : "transparent"} color={isWishlisted ? "var(--danger)" : "var(--text-main)"} size={20} />
                </button>
            </div>

            <div className="container">
                <div className="flex justify-between items-center mb-2">
                    <span className={`badge ${property.type === 'Subsidi' ? 'badge-subsidi' : 'badge-komersial'}`}>
                        {property.type}
                    </span>
                    {property.isPromo && (
                        <span className="badge" style={{ backgroundColor: 'var(--danger)', color: 'white' }}>Promo</span>
                    )}
                </div>

                <h3 className={`font-bold ${variant === 'grid' ? 'text-sm' : 'text-lg'} mb-1`} style={{ whiteSpace: variant === 'grid' ? 'nowrap' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis' }}>{property.title}</h3>
                <p className="flex items-center gap-1 text-xs text-muted mb-2" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <MapPin size={12} style={{ flexShrink: 0 }} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{property.location}</span>
                    {property.distance !== undefined && (
                        <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--primary)' }}>
                            {property.distance.toFixed(1)} km
                        </span>
                    )}
                </p>

                <div className={`flex ${variant === 'grid' ? 'gap-2 flex-wrap' : 'gap-4'} mb-3 text-xs text-muted`}>
                    <div className="flex items-center gap-1"><BedDouble size={14} /> {property.specifications.bedrooms}</div>
                    <div className="flex items-center gap-1"><Bath size={14} /> {property.specifications.bathrooms}</div>
                    <div className="flex items-center gap-1"><Maximize size={14} /> {property.specifications.landArea}m²</div>
                </div>

                <div>
                    {property.oldPrice && (
                        <div className="text-xs text-muted" style={{ textDecoration: 'line-through' }}>
                            {formatPrice(property.oldPrice)}
                        </div>
                    )}
                    <div className={`font-bold ${variant === 'grid' ? 'text-base' : 'text-xl'} text-primary`}>
                        {formatPrice(property.price)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
