import React from 'react';
import type { Property } from '../data/mockData';
import { useAppContext } from '../context/AppContext';
import { Heart, MapPin, BedDouble, Bath, Maximize } from 'lucide-react';

interface PropertyCardProps {
    property: Property;
    onClick: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick }) => {
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
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                />
                {property.type === 'Subsidi' && (
                    <div style={{
                        position: 'absolute', top: '8px', left: '8px',
                        backgroundColor: 'rgba(255,255,255,0.92)', padding: '4px',
                        borderRadius: '6px', display: 'flex', alignItems: 'center',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
                    }}>
                        <img src="/subsidi-logo.png" alt="Subsidi" style={{ height: '32px', width: '32px', objectFit: 'contain' }} />
                    </div>
                )}
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

                <h3 className="font-bold text-lg mb-1">{property.title}</h3>
                <p className="flex items-center gap-1 text-sm text-muted mb-2">
                    <MapPin size={14} /> {property.location}
                    {property.distance !== undefined && (
                        <span style={{ marginLeft: 'auto', fontWeight: 600, color: '#2563EB' }}>
                            {property.distance.toFixed(1)} km
                        </span>
                    )}
                </p>

                <div className="flex gap-4 mb-3 text-sm text-muted">
                    <div className="flex items-center gap-1"><BedDouble size={16} /> {property.specifications.bedrooms} KT</div>
                    <div className="flex items-center gap-1"><Bath size={16} /> {property.specifications.bathrooms} KM</div>
                    <div className="flex items-center gap-1"><Maximize size={16} /> {property.specifications.landArea}m²</div>
                </div>

                <div>
                    {property.oldPrice && (
                        <div className="text-xs text-muted" style={{ textDecoration: 'line-through' }}>
                            {formatPrice(property.oldPrice)}
                        </div>
                    )}
                    <div className="font-bold text-xl text-primary">
                        {formatPrice(property.price)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyCard;
