const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
    const { nik, nama_lengkap, password } = req.body;

    if (!nik || !nama_lengkap || !password) {
        return res.status(400).json({ error: 'Missing core personal fields' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO peserta (nik, password, nama_lengkap, status)
             VALUES ($1, $2, $3, 'Bukan Peserta')
             ON CONFLICT (nik) DO NOTHING
             RETURNING nik, nama_lengkap, status`,
            [nik, password, nama_lengkap]
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
 * 5. Riwayat Pengajuan Pembiayaan by NIK
 */
app.get('/api/peserta/riwayat/pengajuan', async (req, res) => {
    const { nik } = req.query;
    if (!nik) return res.status(400).json({ error: 'NIK is required' });

    try {
        const result = await pool.query(
            `SELECT id_pengajuan, jenis, deskripsi, 
                    TO_CHAR(tanggal_pengajuan, 'DD Mon YYYY') AS tanggal, status
             FROM pengajuan WHERE peserta_nik = $1
             ORDER BY tanggal_pengajuan DESC`,
            [nik]
        );
        res.json({ success: true, data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

/**
 * 6. Riwayat Iuran Bulanan by NIK
 */
app.get('/api/peserta/riwayat/iuran', async (req, res) => {
    const { nik } = req.query;
    if (!nik) return res.status(400).json({ error: 'NIK is required' });

    try {
        const result = await pool.query(
            `SELECT bulan, tahun, nominal, tipe, status,
                    TO_CHAR(tanggal_bayar, 'DD Mon YYYY') AS tanggal_bayar
             FROM iuran WHERE peserta_nik = $1
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
