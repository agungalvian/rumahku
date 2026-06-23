const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/properties/search', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort;
        
        let query = "SELECT * FROM properties WHERE jsonb_typeof(tipe_rumah) = 'array' AND jsonb_array_length(tipe_rumah) > 0";
        let values = [];
        let orderBy = 'ORDER BY created_at DESC';
        
        if (sort === 'tapak-dahulu') {
            orderBy = "ORDER BY CASE WHEN jenis_perumahan = 'Rumah Tapak' THEN 1 ELSE 2 END, created_at DESC";
        } else if (sort === 'susun-dahulu') {
            orderBy = "ORDER BY CASE WHEN jenis_perumahan = 'Rumah Susun' THEN 1 ELSE 2 END, created_at DESC";
        }
        
        query += ` ${orderBy} LIMIT $1`;
        values.push(limit);
        
        const result = await pool.query(query, values);
        
        const data = result.rows.map(r => ({
            idLokasi: r.id_lokasi,
            namaPerumahan: r.nama_perumahan,
            jenisPerumahan: r.jenis_perumahan,
            jumlahUnit: r.jumlah_unit,
            koordinatPerumahan: r.koordinat_perumahan,
            foto: r.foto || [],
            tipeRumah: r.tipe_rumah || [],
            wilayah: r.wilayah || {},
            pengembang: r.pengembang || {},
            kantorPemasaran: r.kantor_pemasaran || [],
            aktivasi: r.aktivasi,
            rating: r.rating
        }));
        
        res.json({ data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

// Set up PostgreSQL connection
const pool = new Pool({
    user: process.env.POSTGRES_USER || 'tapera_user',
    host: process.env.POSTGRES_HOST || 'db',
    database: process.env.POSTGRES_DB || 'tapera_db',
    password: process.env.POSTGRES_PASSWORD || 'tapera_password',
    port: 5432,
});

// Utility to generate random ID
const generateId = (prefix) => `${prefix}-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

// Health check
app.get('/api/peserta/health', (req, res) => {
    res.json({ status: 'OK', message: 'Peserta API is running' });
});

// Root route
app.get('/', (req, res) => {
    res.send('Rumahku API is running. Access the web app on port 3300.');
});

/**
 * 1. Check NIK status
 * Used on the first screen to see if they are a user, pre-registered ASN/Karyawan, or unregistered.
 */
app.post('/api/peserta/check', async (req, res) => {
    const { nik } = req.body;
    if (!nik) return res.status(400).json({ error: 'NIK is required' });

    try {
        const result = await pool.query('SELECT * FROM peserta WHERE nik = $1', [nik]);

        if (result.rows.length === 0) {
            return res.json({ registered: false, message: 'Bukan Peserta (NIK tidak ditemukan)' });
        }

        const user = result.rows[0];
        return res.json({
            registered: true,
            status: user.status,
            data: {
                id: user.id,
                nik: user.nik,
                nama_lengkap: user.nama_lengkap,
                tanggal_lahir: user.tanggal_lahir,
                id_peserta: user.id_peserta,
                instansi: user.instansi,
                // Do not return sensitive fields like saldo unless authenticated in a real app
                saldo_tabungan: user.saldo_tabungan,
                email: user.email,
                no_hp: user.no_hp,
                jenis_pekerjaan: user.jenis_pekerjaan,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * 1.5 Register Base Digital Account Only
 */
app.post('/api/auth/register', async (req, res) => {
    const { nik, nama_lengkap, password, email } = req.body;

    if (!nik || !nama_lengkap || !password || !email) {
        return res.status(400).json({ error: 'Missing core personal fields' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO peserta (nik, password, nama_lengkap, email, status)
             VALUES ($1, $2, $3, $4, 'Bukan Peserta')
             ON CONFLICT (nik) DO NOTHING
             RETURNING nik, nama_lengkap, email, status`,
            [nik, password, nama_lengkap, email]
        );

        if (result.rowLength === 0) {
            return res.status(409).json({ error: 'NIK ini sudah terdaftar' });
        }

        res.json({ success: true, message: 'Akun digital berhasil dibuat', data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * 2. Activate Pre-registered User (ASN/Karyawan)
 */
app.post('/api/peserta/activate', async (req, res) => {
    const { nik, password, email, no_hp } = req.body;
    if (!nik || !password || !email || !no_hp) return res.status(400).json({ error: 'Missing required fields including password' });

    try {
        // Generate new ID for activated user
        const newIdPeserta = generateId('TPR');

        const result = await pool.query(
            `UPDATE peserta 
             SET password = $1, status = 'Peserta', id_peserta = $2, email = $3, no_hp = $4, updated_at = CURRENT_TIMESTAMP
             WHERE nik = $5 AND status = 'Bukan Peserta'
             RETURNING id_peserta, status, nama_lengkap`,
            [password, newIdPeserta, email, no_hp, nik]
        );

        if (result.rowLength === 0) {
            return res.status(404).json({ error: 'User not found or already activated' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * 3. Register Independent Worker (Pekerja Mandiri)
 */
app.post('/api/peserta/register', async (req, res) => {
    const {
        nik, password, nama_lengkap, tanggal_lahir, email, no_hp,
        jenis_pekerjaan, estimasi_penghasilan, rekening_bank, alamat_domisili
    } = req.body;

    if (!nik || !password || !nama_lengkap || !tanggal_lahir) {
        return res.status(400).json({ error: 'Missing core personal fields or password' });
    }

    try {
        // Generate ID for independent worker
        const newIdPeserta = generateId('MND');

        // Upsert logically (in case they previously tried to register)
        const result = await pool.query(
            `INSERT INTO peserta (
                nik, password, nama_lengkap, tanggal_lahir, id_peserta, status, 
                email, no_hp, jenis_pekerjaan, estimasi_penghasilan, rekening_bank, alamat_domisili
            ) VALUES ($1, $2, $3, $4, $5, 'Peserta Pekerja Mandiri', $6, $7, $8, $9, $10, $11)
            ON CONFLICT (nik) DO UPDATE SET
                password = EXCLUDED.password,
                nama_lengkap = EXCLUDED.nama_lengkap,
                id_peserta = EXCLUDED.id_peserta,
                status = 'Peserta Pekerja Mandiri',
                email = EXCLUDED.email,
                no_hp = EXCLUDED.no_hp,
                jenis_pekerjaan = EXCLUDED.jenis_pekerjaan,
                estimasi_penghasilan = EXCLUDED.estimasi_penghasilan,
                rekening_bank = EXCLUDED.rekening_bank,
                alamat_domisili = EXCLUDED.alamat_domisili,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id_peserta, status, nama_lengkap`,
            [
                nik, password, nama_lengkap, tanggal_lahir, newIdPeserta,
                email, no_hp, jenis_pekerjaan, estimasi_penghasilan, rekening_bank, alamat_domisili
            ]
        );

        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error(err);
        if (err.constraint === 'peserta_nik_key') {
            return res.status(409).json({ error: 'NIK is already registered' });
        }
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * 4. Login Participant
 */
app.post('/api/peserta/login', async (req, res) => {
    const { nik, password } = req.body;
    if (!nik || !password) return res.status(400).json({ error: 'NIK dan Password wajib diisi' });

    try {
        const result = await pool.query('SELECT * FROM peserta WHERE nik = $1', [nik]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'NIK tidak ditemukan' });
        }

        const user = result.rows[0];

        // Dummy text-to-text comparison
        if (user.password !== password) {
            return res.status(401).json({ error: 'Password salah' });
        }

        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                id: user.id,
                nik: user.nik,
                nama_lengkap: user.nama_lengkap,
                email: user.email,
                id_peserta: user.id_peserta,
                status: user.status
            }
        });
    } catch (err) {
        console.error('Error login:', err);
        res.status(500).json({ error: 'Terjadi kesalahan pada server' });
    }
});


/**
 * 5. Check NIK Availability & Validity
 */
app.post('/api/auth/check-nik', async (req, res) => {
    const { nik } = req.body;
    if (!nik || nik.length !== 16) return res.status(400).json({ error: 'NIK must be 16 digits' });

    try {
        const userCheck = await pool.query("SELECT id, password, nama_lengkap FROM peserta WHERE nik = $1", [nik]);
        
        let status = 'available';
        let isRegistered = false;
        let name = '';

        if (userCheck.rows.length > 0) {
            name = userCheck.rows[0].nama_lengkap;
            if (userCheck.rows[0].password) {
                status = 'registered';
                isRegistered = true;
            } else {
                status = 'needs_activation';
            }
        }

        res.json({ 
            success: true, 
            status, 
            isRegistered,
            isDukcapilValid: true, // Simulation: In reality, call Dukcapil API
            name,
            message: status === 'registered' ? 'NIK sudah terdaftar' : 'NIK valid'
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * 8. Get Application History (KPR)
 */
app.get('/api/peserta/riwayat/pengajuan', async (req, res) => {
    const { nik } = req.query;
    if (!nik) return res.status(400).json({ error: 'NIK is required' });

    try {
        const result = await pool.query(
            `SELECT id as id_pengajuan, 'KPR Tapera' as jenis, property_title as deskripsi, 
             TO_CHAR(created_at, 'DD Mon YYYY') as tanggal, status 
             FROM kpr_applications 
             WHERE nik = $1 
             ORDER BY created_at DESC`,
            [nik]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * 8. Submit KPR Application
 */
app.post('/api/kpr/submit', async (req, res) => {
    const { nik, property_id, property_title, property_location, property_price, bank_name, appointment_date, appointment_time } = req.body;
    
    if (!nik || !property_id) {
        return res.status(400).json({ error: 'NIK and Property ID are required' });
    }

    try {
        // Check for active applications (not 'dibatalkan' and not 'ditolak'?) 
        // User says: "pengajuan tidak boleh double jika ada pengajuan yang sedang di proses"
        const activeCheck = await pool.query(
            "SELECT id FROM kpr_applications WHERE nik = $1 AND status = 'proses'",
            [nik]
        );

        if (activeCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Anda masih memiliki pengajuan yang sedang diproses.' });
        }

        const result = await pool.query(
            `INSERT INTO kpr_applications (nik, property_id, property_title, property_location, property_price, bank_name, appointment_date, appointment_time)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id`,
            [
                nik, 
                property_id, 
                property_title, 
                property_location, 
                property_price, 
                bank_name, 
                appointment_date || null, 
                appointment_time || null
            ]
        );

        res.json({ success: true, message: 'Pengajuan KPR berhasil dikirim', id: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * 9. Cancel KPR Application
 */
app.post('/api/kpr/cancel', async (req, res) => {
    const { id_pengajuan, nik } = req.body;
    if (!id_pengajuan || !nik) {
        return res.status(400).json({ error: 'ID Pengajuan and NIK are required' });
    }

    try {
        const result = await pool.query(
            "UPDATE kpr_applications SET status = 'dibatalkan', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND nik = $2 AND status = 'proses' RETURNING id",
            [id_pengajuan, nik]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pengajuan tidak ditemukan atau sudah tidak bisa dibatalkan.' });
        }

        res.json({ success: true, message: 'Pengajuan berhasil dibatalkan' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});
app.post('/api/peserta/update', async (req, res) => {
    const { nik, nama_lengkap, email, no_hp } = req.body;
    if (!nik) return res.status(400).json({ error: 'NIK is required' });

    try {
        const result = await pool.query(
            `UPDATE peserta 
             SET nama_lengkap = $1, email = $2, no_hp = $3, updated_at = CURRENT_TIMESTAMP
             WHERE nik = $4
             RETURNING nik, nama_lengkap, email, no_hp`,
            [nama_lengkap, email, no_hp, nik]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, message: 'Profil berhasil diperbarui', data: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * Riwayat Iuran Bulanan
 */
app.get('/api/peserta/riwayat/iuran', async (req, res) => {
    const { nik } = req.query;
    if (!nik) return res.status(400).json({ error: 'NIK is required' });

    try {
        const result = await pool.query(
            `SELECT bulan, tahun, nominal, tipe, status,
                    TO_CHAR(tanggal_bayar, 'DD Mon YYYY') AS tanggal_bayar
             FROM iuran WHERE nik = $1
             ORDER BY tahun DESC, 
                CASE bulan 
                    WHEN 'Januari' THEN 1 WHEN 'Februari' THEN 2 WHEN 'Maret' THEN 3
                    WHEN 'April' THEN 4 WHEN 'Mei' THEN 5 WHEN 'Juni' THEN 6
                    WHEN 'Juli' THEN 7 WHEN 'Agustus' THEN 8 WHEN 'September' THEN 9
                    WHEN 'Oktober' THEN 10 WHEN 'November' THEN 11 WHEN 'Desember' THEN 12
                END DESC`,
            [nik]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.listen(port, () => {
    console.log(`Peserta API running on port ${port}`);
});
