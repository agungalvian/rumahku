export type PropertyType = 'Komersial' | 'Subsidi';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  price: number;
  location: string;
  coordinates: { lat: number; lng: number };
  specifications: {
    bedrooms: number;
    bathrooms: number;
    landArea: number;   // Luas Tanah m2
    buildArea: number;  // Luas Bangunan m2
  };
  facilities: string[];
  imageUrl: string;
  galleryUrls: string[];
  features: string[]; // e.g. "Dekat Stasiun", "Bebas Banjir"
  isPromo: boolean;
  oldPrice?: number;
  distance?: number;
}

export const properties: Property[] = [
  {
    id: "p1",
    title: "Griya Tawangmangu Asri",
    type: "Subsidi",
    price: 162000000,
    location: "Karanganyar, Jawa Tengah",
    coordinates: { lat: -7.598, lng: 110.941 },
    specifications: { bedrooms: 2, bathrooms: 1, landArea: 60, buildArea: 30 },
    facilities: ["Dekat Jalan Raya", "Masjid Perumahan", "Air Tanah Bersih"],
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["Subsidi Pemerintah", "Bunga Flat 5%", "Angsuran Ringan"],
    isPromo: false,
  },
  {
    id: "p2",
    title: "Pesona Permata Bogor",
    type: "Komersial",
    price: 450000000,
    location: "Bojonggede, Bogor",
    coordinates: { lat: -6.495, lng: 106.795 },
    specifications: { bedrooms: 3, bathrooms: 2, landArea: 90, buildArea: 60 },
    facilities: ["3 Menit ke Stasiun", "Security 24 Jam", "Taman Bermain Anak"],
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["Dekat Stasiun", "Smart Home Ready", "Desain Modern Minimalis"],
    isPromo: true,
    oldPrice: 480000000
  },
  {
    id: "p3",
    title: "Cluster Harmoni Bekasi",
    type: "Komersial",
    price: 620000000,
    location: "Mustika Jaya, Bekasi",
    coordinates: { lat: -6.315, lng: 107.025 },
    specifications: { bedrooms: 3, bathrooms: 2, landArea: 105, buildArea: 75 },
    facilities: ["5 Menit ke Pintu Tol", "One Gate System", "Clubhouse"],
    imageUrl: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["Dekat Akses Tol", "Bebas Banjir", "Lingkungan Asri"],
    isPromo: false
  },
  {
    id: "p4",
    title: "Bumi Sejahtera Cikarang",
    type: "Subsidi",
    price: 181000000,
    location: "Cikarang Utara, Bekasi",
    coordinates: { lat: -6.257, lng: 107.168 },
    specifications: { bedrooms: 2, bathrooms: 1, landArea: 60, buildArea: 32 },
    facilities: ["Dekat Kawasan Industri", "Transportasi Umum", "Pasar Modern"],
    imageUrl: "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=800&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1599809275671-b5942cabc7a2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4ea0d?auto=format&fit=crop&w=800&q=80"
    ],
    features: ["Akses Transportasi Mudah", "Cocok untuk Pekerja"],
    isPromo: true,
    oldPrice: 190000000
  },
];
