const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

// Node 18+ has global fetch. If not, use https.

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'tapera_user',
    host: process.env.POSTGRES_HOST || 'db',
    database: process.env.POSTGRES_DB || 'tapera_db',
    password: process.env.POSTGRES_PASSWORD || 'tapera_password',
    port: 5432,
});

const UPLOADS_DIR = path.join(__dirname, 'uploads', 'properties');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Download image and return local path
const downloadImage = (url) => {
    return new Promise((resolve, reject) => {
        if (!url) return resolve(null);
        
        let targetUrl = url;
        if (targetUrl.startsWith('/')) {
            targetUrl = `https://sikumbang.tapera.go.id${targetUrl}`;
        }
        
        // Skip invalid URLs
        if (!targetUrl.startsWith('http')) return resolve(null);

        // create a unique filename based on hash of url to prevent duplicates
        const ext = path.extname(new URL(targetUrl).pathname) || '.jpg';
        const hash = crypto.createHash('md5').update(targetUrl).digest('hex');
        const filename = `${hash}${ext}`;
        const localPath = path.join(UPLOADS_DIR, filename);
        const relativePath = `/uploads/properties/${filename}`;

        if (fs.existsSync(localPath)) {
            // Already downloaded
            return resolve(relativePath);
        }

        https.get(targetUrl, (res) => {
            if (res.statusCode !== 200) {
                console.log(`Failed to download ${targetUrl}: ${res.statusCode}`);
                return resolve(null);
            }
            const fileStream = fs.createWriteStream(localPath);
            res.pipe(fileStream);
            fileStream.on('finish', () => {
                fileStream.close();
                resolve(relativePath);
            });
            fileStream.on('error', (err) => {
                console.error(`Error writing ${localPath}:`, err);
                resolve(null);
            });
        }).on('error', (err) => {
            console.error(`Error downloading ${targetUrl}:`, err);
            resolve(null);
        });
    });
};

const processTipeRumahImages = async (tipeRumahArray) => {
    if (!tipeRumahArray || !Array.isArray(tipeRumahArray)) return tipeRumahArray;
    
    const processed = [];
    for (const tipe of tipeRumahArray) {
        const newTipe = { ...tipe };
        if (newTipe.fotoTampak) {
            newTipe.fotoTampak = await downloadImage(newTipe.fotoTampak) || newTipe.fotoTampak;
        }
        if (newTipe.fotoDenah) {
            newTipe.fotoDenah = await downloadImage(newTipe.fotoDenah) || newTipe.fotoDenah;
        }
        processed.push(newTipe);
    }
    return processed;
};

const processFotoImages = async (fotoArray) => {
    if (!fotoArray || !Array.isArray(fotoArray)) return fotoArray;
    const processed = [];
    for (const url of fotoArray) {
        const local = await downloadImage(url);
        if (local) processed.push(local);
        else processed.push(url);
    }
    return processed;
};

const fetchAndSave = async (queryName, queryParams) => {
    console.log(`\n--- Fetching: ${queryName} ---`);
    const qs = new URLSearchParams(queryParams).toString();
    const url = `https://sikumbang.tapera.go.id/ajax/lokasi/search?${qs}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();
        const locations = data.data || [];
        
        console.log(`Found ${locations.length} properties for ${queryName}`);
        
        for (const loc of locations) {
            console.log(`Processing ID: ${loc.idLokasi} - ${loc.namaPerumahan}`);
            
            // Download images
            const localFoto = await processFotoImages(loc.foto);
            const localTipeRumah = await processTipeRumahImages(loc.tipeRumah);
            
            // Upsert into DB
            await pool.query(
                `INSERT INTO properties (
                    id_lokasi, nama_perumahan, jenis_perumahan, jumlah_unit, 
                    koordinat_perumahan, foto, tipe_rumah, wilayah, 
                    pengembang, kantor_pemasaran, aktivasi, rating, updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP)
                ON CONFLICT (id_lokasi) DO UPDATE SET
                    nama_perumahan = EXCLUDED.nama_perumahan,
                    jenis_perumahan = EXCLUDED.jenis_perumahan,
                    jumlah_unit = EXCLUDED.jumlah_unit,
                    koordinat_perumahan = EXCLUDED.koordinat_perumahan,
                    foto = EXCLUDED.foto,
                    tipe_rumah = EXCLUDED.tipe_rumah,
                    wilayah = EXCLUDED.wilayah,
                    pengembang = EXCLUDED.pengembang,
                    kantor_pemasaran = EXCLUDED.kantor_pemasaran,
                    aktivasi = EXCLUDED.aktivasi,
                    rating = EXCLUDED.rating,
                    updated_at = CURRENT_TIMESTAMP`,
                [
                    loc.idLokasi,
                    loc.namaPerumahan,
                    loc.jenisPerumahan,
                    loc.jumlahUnit,
                    loc.koordinatPerumahan,
                    JSON.stringify(localFoto),
                    JSON.stringify(localTipeRumah),
                    JSON.stringify(loc.wilayah),
                    JSON.stringify(loc.pengembang),
                    JSON.stringify(loc.kantorPemasaran),
                    loc.aktivasi,
                    loc.rating
                ]
            );
        }
        console.log(`Finished processing ${queryName}`);
    } catch (err) {
        console.error(`Error fetching ${queryName}:`, err);
    }
};

const run = async () => {
    // We fetch 40 data for each filter as requested.
    const queries = [
        { name: 'terbaru', params: { page: '1', limit: '40', sort: 'terbaru' } },
        { name: 'tapak', params: { page: '1', limit: '40', selectedSearch: 'wilayah', skalaPerumahan: 'semua', sort: 'tapak-dahulu', searchBy: 'nama-perumahan' } },
        { name: 'rusun', params: { page: '1', limit: '40', selectedSearch: 'wilayah', skalaPerumahan: 'semua', sort: 'susun-dahulu', searchBy: 'nama-perumahan' } },
        // Terdekat doesn't have an API filter, so we'll fetch page 2 of terbaru to get more data
        { name: 'terdekat_fallback', params: { page: '2', limit: '40', sort: 'terbaru' } },
        // Komersil also doesn't have a direct API filter we know of, fetching page 3 of terbaru
        { name: 'komersil_fallback', params: { page: '3', limit: '40', sort: 'terbaru' } },
    ];

    for (const q of queries) {
        await fetchAndSave(q.name, q.params);
    }

    console.log('\n--- Seeding Complete ---');
    pool.end();
};

run();
