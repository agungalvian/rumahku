import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom house SVG icon
const houseIcon = L.divIcon({
    className: '',
    html: `
        <div style="
            display:flex; align-items:center; justify-content:center;
            width:40px; height:40px;
            background: #5bb24a;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
            border: 2px solid white;
        ">
            <span style="transform:rotate(45deg); font-size:18px; line-height:1;">🏠</span>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -44],
});

// Helper to re-center map when coords change
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], 15);
    }, [lat, lng, map]);
    return null;
}

interface PropertyMapProps {
    lat: number;
    lng: number;
    title: string;
    location: string;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ lat, lng, title, location }) => {
    const hasCoords = lat !== 0 || lng !== 0;

    if (!hasCoords) {
        return (
            <div style={{
                height: '200px', backgroundColor: '#F3F4F6',
                borderRadius: 'var(--radius-md)',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', fontSize: '0.875rem',
            }}>
                <span style={{ fontSize: '2rem', marginBottom: '8px' }}>📍</span>
                <p>Koordinat tidak tersedia</p>
            </div>
        );
    }

    const gmapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

    return (
        <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem' }}>
            {/* Map */}
            <MapContainer
                center={[lat, lng]}
                zoom={15}
                style={{ height: '200px', width: '100%' }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <RecenterMap lat={lat} lng={lng} />
                <Marker position={[lat, lng]} icon={houseIcon}>
                    <Popup>
                        <strong>{title}</strong><br />
                        <small style={{ color: '#6B7280' }}>{location}</small>
                    </Popup>
                </Marker>
            </MapContainer>

            {/* Google Maps overlay button */}
            <a
                href={gmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                    position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: '#5bb24a', color: 'white',
                    padding: '6px 18px', borderRadius: '20px',
                    fontSize: '0.8rem', fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                    zIndex: 800, whiteSpace: 'nowrap',
                    textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: '6px',
                }}
            >
                📍 Buka Google Maps
            </a>
        </div>
    );
};

export default PropertyMap;
