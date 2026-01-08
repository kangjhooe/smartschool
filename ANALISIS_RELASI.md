# Analisis Relasi Database dan Struktur Aplikasi SmartSchool

## 📋 Ringkasan Eksekutif

Aplikasi SmartSchool menggunakan arsitektur multi-tenant dengan isolasi data per sekolah. Semua relasi database telah didefinisikan dengan baik, namun terdapat beberapa masalah minor yang perlu diperbaiki.

---

## 🗄️ Struktur Database

### Tabel Utama

1. **sekolah** - Master data sekolah/instansi
2. **users** - Data pengguna dengan role
3. **guru** - Data guru
4. **siswa** - Data siswa
5. **kelas** - Data kelas
6. **kelas_siswa** - Pivot table untuk relasi many-to-many kelas-siswa

---

## 🔗 Relasi Database

### 1. Sekolah (Sekolah Model)

**Relasi yang didefinisikan:**
- ✅ `hasMany(User)` → `users()` - Satu sekolah memiliki banyak user
- ✅ `hasMany(Guru)` → `gurus()` - Satu sekolah memiliki banyak guru
- ✅ `hasMany(Siswa)` → `siswas()` - Satu sekolah memiliki banyak siswa
- ✅ `hasMany(Kelas)` → `kelas()` - Satu sekolah memiliki banyak kelas

**Foreign Key:**
- Semua tabel (users, guru, siswa, kelas) memiliki `instansi_id` yang merujuk ke `sekolah.id`
- Semua foreign key menggunakan `onDelete('cascade')` untuk menjaga integritas data

### 2. User (User Model)

**Relasi yang didefinisikan:**
- ✅ `belongsTo(Sekolah)` → `instansi()` - User terikat ke satu sekolah
- ✅ `hasOne(Guru)` → `guru()` - User bisa memiliki satu profil guru
- ✅ `hasOne(Siswa)` → `siswa()` - User bisa memiliki satu profil siswa

**Foreign Key:**
- `instansi_id` → `sekolah.id` (nullable, dengan cascade delete)
- `guru.user_id` → `users.id` (cascade delete)
- `siswa.user_id` → `users.id` (nullable, cascade delete)

### 3. Guru (Guru Model)

**Relasi yang didefinisikan:**
- ✅ `belongsTo(User)` → `user()` - Guru terikat ke satu user
- ✅ `belongsTo(Sekolah)` → `instansi()` - Guru terikat ke satu sekolah
- ✅ `hasMany(Kelas)` → `kelasWali()` - Guru bisa menjadi wali kelas untuk banyak kelas

**Foreign Key:**
- `user_id` → `users.id` (required, cascade delete)
- `instansi_id` → `sekolah.id` (required, cascade delete)
- `kelas.wali_kelas_id` → `guru.id` (nullable, set null on delete)

### 4. Siswa (Siswa Model)

**Relasi yang didefinisikan:**
- ✅ `belongsTo(User)` → `user()` - Siswa terikat ke satu user (nullable)
- ✅ `belongsTo(Sekolah)` → `instansi()` - Siswa terikat ke satu sekolah
- ✅ `belongsToMany(Kelas)` → `kelas()` - Siswa bisa berada di banyak kelas (many-to-many)

**Foreign Key:**
- `user_id` → `users.id` (nullable, cascade delete)
- `instansi_id` → `sekolah.id` (required, cascade delete)
- Pivot table `kelas_siswa` menghubungkan siswa dan kelas

### 5. Kelas (Kelas Model)

**Relasi yang didefinisikan:**
- ✅ `belongsTo(Sekolah)` → `instansi()` - Kelas terikat ke satu sekolah
- ✅ `belongsTo(Guru)` → `waliKelas()` - Kelas memiliki satu wali kelas (nullable)
- ✅ `belongsToMany(Siswa)` → `siswa()` - Kelas memiliki banyak siswa (many-to-many)

**Foreign Key:**
- `instansi_id` → `sekolah.id` (required, cascade delete)
- `wali_kelas_id` → `guru.id` (nullable, set null on delete)
- Pivot table `kelas_siswa` menghubungkan kelas dan siswa

### 6. Pivot Table: kelas_siswa

**Struktur:**
- `kelas_id` → `kelas.id` (cascade delete)
- `siswa_id` → `siswa.id` (cascade delete)
- `tahun_ajaran` (string, nullable)
- `semester` (enum: 'ganjil', 'genap', nullable)
- Unique constraint: `['kelas_id', 'siswa_id', 'tahun_ajaran', 'semester']`

---

## ✅ Relasi yang Sudah Benar

### 1. Multi-Tenant Isolation
- ✅ Semua tabel memiliki `instansi_id` yang merujuk ke `sekolah.id`
- ✅ Semua query di controller menggunakan filter `instansi_id` untuk isolasi data
- ✅ Foreign key constraints memastikan integritas data

### 2. User-Guru-Siswa Relationship
- ✅ User bisa memiliki profil guru atau siswa (one-to-one)
- ✅ Relasi bidirectional sudah benar (User → Guru/Siswa dan sebaliknya)

### 3. Kelas-Siswa Many-to-Many
- ✅ Pivot table `kelas_siswa` sudah benar
- ✅ Unique constraint mencegah duplikasi
- ✅ Pivot fields (tahun_ajaran, semester) sudah didefinisikan

### 4. Wali Kelas Relationship
- ✅ Kelas memiliki wali_kelas_id yang merujuk ke Guru
- ✅ Menggunakan `onDelete('set null')` untuk mencegah cascade delete yang tidak diinginkan

---

## ⚠️ Masalah yang Ditemukan

### 1. **Migrasi Duplikat** ⚠️ KRITIS
**File:** `2026_01_07_124325_create_siswas_table.php`

**Masalah:**
- Migrasi ini membuat tabel `siswas` (plural) yang kosong
- Tabel yang sebenarnya digunakan adalah `siswa` (singular) dari migrasi `2026_01_07_124408_create_siswa_table.php`
- Migrasi duplikat ini bisa menyebabkan konflik

**Solusi:**
- Hapus migrasi `2026_01_07_124325_create_siswas_table.php` karena tidak digunakan

### 2. **Validasi Wali Kelas di Controller** ✅ SUDAH BENAR
**File:** `KelasController.php`

**Status:**
- ✅ Sudah ada validasi bahwa wali_kelas_id harus dari instansi yang sama
- ✅ Validasi dilakukan di method `store()` dan `update()`

### 3. **Validasi Siswa di Kelas** ✅ SUDAH BENAR
**File:** `KelasController.php`

**Status:**
- ✅ Sudah ada validasi bahwa siswa_id harus dari instansi yang sama
- ✅ Validasi dilakukan di method `attachSiswa()`

### 4. **User_id pada Guru dan Siswa**
**Status:**
- ✅ Guru: `user_id` adalah required (tidak nullable)
- ✅ Siswa: `user_id` adalah nullable (benar, karena siswa mungkin belum punya akun)

---

## 🔍 Pengecekan Konsistensi

### 1. Naming Convention
- ✅ Semua tabel menggunakan singular (sekolah, user, guru, siswa, kelas)
- ✅ Pivot table menggunakan snake_case (kelas_siswa)
- ✅ Foreign key menggunakan pattern `{table}_id` (instansi_id, user_id, wali_kelas_id)

### 2. Foreign Key Constraints
- ✅ Semua foreign key sudah didefinisikan di migrations
- ✅ Cascade delete sudah diterapkan dengan benar
- ✅ Set null untuk wali_kelas_id sudah benar

### 3. Model Relationships
- ✅ Semua relasi sudah didefinisikan di model
- ✅ Return type sudah didefinisikan dengan benar (BelongsTo, HasMany, BelongsToMany)
- ✅ Pivot fields sudah didefinisikan dengan `withPivot()`

### 4. Controller Usage
- ✅ Semua controller menggunakan eager loading (`with()`) untuk relasi
- ✅ Filter berdasarkan `instansi_id` sudah konsisten
- ✅ Validasi multi-tenant sudah diterapkan

---

## 📊 Diagram Relasi

```
sekolah (1)
  ├── users (N) ──→ user (1)
  │                   ├── guru (1) ──→ guru (1)
  │                   │                   └── kelas (N) [wali_kelas_id]
  │                   └── siswa (1) ──→ siswa (1)
  │                                       └── kelas (N) [many-to-many via kelas_siswa]
  ├── gurus (N) ──→ guru (1)
  │                   ├── user (1)
  │                   └── kelas (N) [wali_kelas_id]
  ├── siswas (N) ──→ siswa (1)
  │                   ├── user (1) [nullable]
  │                   └── kelas (N) [many-to-many via kelas_siswa]
  └── kelas (N) ──→ kelas (1)
                      ├── wali_kelas (1) [nullable]
                      └── siswa (N) [many-to-many via kelas_siswa]
```

---

## 🎯 Rekomendasi

### Prioritas Tinggi
1. **Hapus migrasi duplikat** `create_siswas_table.php`
2. **Verifikasi database** - Pastikan tidak ada tabel `siswas` yang tersisa

### Prioritas Sedang
1. **Tambahkan index** pada kolom yang sering digunakan untuk query:
   - `users.instansi_id`
   - `guru.instansi_id`
   - `siswa.instansi_id`
   - `kelas.instansi_id`
   - `kelas.wali_kelas_id`

2. **Tambahkan soft deletes** (opsional) untuk:
   - `sekolah` - untuk arsip data
   - `guru` - untuk riwayat data
   - `siswa` - untuk riwayat data

### Prioritas Rendah
1. **Tambahkan relasi inverse** yang mungkin berguna:
   - `Sekolah::siswaAktif()` - untuk mendapatkan siswa aktif
   - `Sekolah::guruAktif()` - untuk mendapatkan guru aktif

---

## ✅ Kesimpulan

**Status Relasi:** ✅ **SEMUA RELASI SUDAH BENAR**

Semua relasi database sudah didefinisikan dengan benar dan konsisten. Aplikasi menggunakan pola multi-tenant dengan isolasi data yang baik. Hanya ada satu masalah minor (migrasi duplikat) yang perlu diperbaiki.

**Relasi yang Terverifikasi:**
- ✅ Sekolah ↔ User (1:N)
- ✅ Sekolah ↔ Guru (1:N)
- ✅ Sekolah ↔ Siswa (1:N)
- ✅ Sekolah ↔ Kelas (1:N)
- ✅ User ↔ Guru (1:1)
- ✅ User ↔ Siswa (1:1)
- ✅ Guru ↔ Kelas (1:N) sebagai wali kelas
- ✅ Kelas ↔ Siswa (N:M) via pivot table

**Integritas Data:**
- ✅ Foreign key constraints sudah benar
- ✅ Cascade delete sudah diterapkan dengan tepat
- ✅ Multi-tenant isolation sudah diimplementasikan dengan baik

---

*Dokumen ini dibuat pada: 2026-01-07*
*Versi Aplikasi: 1.0.0*
