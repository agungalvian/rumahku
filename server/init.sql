CREATE TABLE IF NOT EXISTS peserta (
    id SERIAL PRIMARY KEY,
    nik VARCHAR(16) UNIQUE NOT NULL,
    password VARCHAR(255),
    nama_lengkap VARCHAR(100) NOT NULL,
    tanggal_lahir DATE,
    id_peserta VARCHAR(20) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'Bukan Peserta', -- 'Peserta', 'Peserta Pekerja Mandiri'
    instansi VARCHAR(255),                                -- Untuk ASN/Karyawan
    saldo_tabungan NUMERIC(15, 2) DEFAULT 0,
    email VARCHAR(255),
    no_hp VARCHAR(20),
    jenis_pekerjaan VARCHAR(100),                         -- Untuk Pekerja Mandiri
    estimasi_penghasilan NUMERIC(15, 2),                  -- Untuk Pekerja Mandiri
    rekening_bank VARCHAR(50),                            -- Untuk Pekerja Mandiri
    alamat_domisili TEXT,                                 -- Untuk Pekerja Mandiri
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Akun 1: Sudah terdaftar sebagai Budi PA (Karyawan/ASN)
INSERT INTO peserta (nik, password, nama_lengkap, tanggal_lahir, id_peserta, status, instansi, saldo_tabungan, email, no_hp)
VALUES
    ('1111222233334444', 'password123', 'Budi PA', '1985-07-25', 'TPR-0012345678', 'Peserta', 'PT Telkom Indonesia', 15000000.00, 'budi.aktif@example.com', '081111111111')
ON CONFLICT (nik) DO NOTHING;

-- Akun 2: Terdaftar sebagai Rina PM
INSERT INTO peserta (nik, password, nama_lengkap, tanggal_lahir, id_peserta, status, saldo_tabungan, email, no_hp, jenis_pekerjaan, estimasi_penghasilan, rekening_bank, alamat_domisili)
VALUES
    ('5555666677778888', 'password123', 'Rina PM', '1995-11-08', 'MND-0098765432', 'Peserta Pekerja Mandiri', 2500000.00, 'rina.mandiri@example.com', '082222222222', 'Freelancer', 6000000.00, 'BCA - 1234567890', 'Jl. Sudirman No 12, Jakarta')
ON CONFLICT (nik) DO NOTHING;

-- Akun 4: Belum terdaftar aktif, namun NIK disupport oleh Instansi (Perlu Aktivasi)
INSERT INTO peserta (nik, nama_lengkap, tanggal_lahir, status, instansi)
VALUES
    ('9999000011112222', 'Siti PR', '1990-05-15', 'Bukan Peserta', 'Kementerian Keuangan RI')
ON CONFLICT (nik) DO NOTHING;

-- Akun 3: Belum terdaftar (Pekerja Mandiri yang baru mendaftar)
INSERT INTO peserta (nik, password, nama_lengkap, tanggal_lahir, status)
VALUES
    ('3333444455556666', 'password123', 'Ahmad Belum Daftar', '2000-01-01', 'Bukan Peserta')
ON CONFLICT (nik) DO NOTHING;
