# SmartSchool - Aplikasi Sosial Media Internal Sekolah

Aplikasi web untuk sosial media internal sekolah dengan konsep multi-tenant, dimana setiap sekolah memiliki ruang tertutup sendiri dan data tidak bercampur.

## Teknologi

- **Backend**: Laravel 12 dengan Sanctum untuk API authentication
- **Frontend**: Next.js 16 dengan TypeScript dan Tailwind CSS
- **Database**: MySQL/MariaDB

## Fitur

### MVP (Minimum Viable Product)
- ✅ Pendaftaran sekolah mandiri
- ✅ Login pengguna
- ✅ Dashboard sekolah
- ✅ Kelola data guru (CRUD)
- ✅ Kelola data siswa (CRUD)
- ✅ Kelola kelas (CRUD)

### Konsep Multi-Tenant
- Setiap sekolah memiliki data terisolasi
- Pengguna terikat ke satu sekolah
- Data tidak bercampur antar sekolah

### Role Pengguna
- **Super Admin**: Admin platform (untuk development)
- **Admin Sekolah**: Admin untuk sekolah tertentu
- **Guru**: Pengguna dengan role guru

## Instalasi

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 20+
- MySQL/MariaDB

### Backend Setup

1. Masuk ke direktori backend:
```bash
cd backend
```

2. Install dependencies:
```bash
composer install
```

3. Copy file environment:
```bash
cp .env.example .env
```

4. Generate application key:
```bash
php artisan key:generate
```

5. Konfigurasi database di `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=smartschool
DB_USERNAME=root
DB_PASSWORD=
```

6. Jalankan migrations:
```bash
php artisan migrate
```

7. Jalankan server:
```bash
php artisan serve
```

Backend akan berjalan di `http://localhost:8000`

### Frontend Setup

1. Masuk ke direktori frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Buat file `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

4. Jalankan development server:
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:3000`

## Struktur Database

### Tabel Utama
- `sekolah` - Data sekolah/instansi
- `users` - Data pengguna dengan role
- `guru` - Data guru
- `siswa` - Data siswa
- `kelas` - Data kelas
- `kelas_siswa` - Pivot table untuk relasi kelas-siswa

**Catatan**: Semua nama tabel menggunakan singular (tanpa 's' di akhir) sesuai preferensi.

## API Endpoints

### Authentication
- `POST /api/register-sekolah` - Daftar sekolah baru
- `POST /api/login` - Login pengguna
- `POST /api/logout` - Logout (requires auth)
- `GET /api/me` - Get current user (requires auth)

### Sekolah
- `GET /api/sekolah` - Get data sekolah (requires auth)
- `PUT /api/sekolah` - Update data sekolah (requires auth)

### Guru
- `GET /api/guru` - List semua guru (requires auth)
- `POST /api/guru` - Tambah guru baru (requires auth)
- `GET /api/guru/{id}` - Get detail guru (requires auth)
- `PUT /api/guru/{id}` - Update guru (requires auth)
- `DELETE /api/guru/{id}` - Hapus guru (requires auth)

### Siswa
- `GET /api/siswa` - List semua siswa (requires auth)
- `POST /api/siswa` - Tambah siswa baru (requires auth)
- `GET /api/siswa/{id}` - Get detail siswa (requires auth)
- `PUT /api/siswa/{id}` - Update siswa (requires auth)
- `DELETE /api/siswa/{id}` - Hapus siswa (requires auth)

### Kelas
- `GET /api/kelas` - List semua kelas (requires auth)
- `POST /api/kelas` - Tambah kelas baru (requires auth)
- `GET /api/kelas/{id}` - Get detail kelas (requires auth)
- `PUT /api/kelas/{id}` - Update kelas (requires auth)
- `DELETE /api/kelas/{id}` - Hapus kelas (requires auth)
- `POST /api/kelas/{id}/siswa` - Tambah siswa ke kelas (requires auth)
- `DELETE /api/kelas/{id}/siswa/{siswaId}` - Hapus siswa dari kelas (requires auth)

## Keamanan

- Authentication menggunakan Laravel Sanctum
- Multi-tenant isolation - setiap user hanya bisa akses data sekolahnya sendiri
- Token-based authentication untuk API
- CORS dikonfigurasi untuk frontend

## Pengembangan

### Menambah Fitur Baru

1. Buat migration untuk tabel baru (jika diperlukan)
2. Buat Model dengan relationships
3. Buat Controller di `app/Http/Controllers/API/`
4. Tambahkan routes di `routes/api.php`
5. Buat service di frontend `lib/services.ts`
6. Buat page/component di frontend

### Format Tanggal
Semua tanggal menggunakan format Indonesia: DD-MM-YYYY

## Deployment ke Shared Hosting

Jika shared hosting Anda **tidak mendukung npm install**, aplikasi ini sudah dikonfigurasi untuk static export.

### Quick Start

1. **Build frontend di komputer lokal:**
   ```powershell
   .\build-for-shared-hosting.ps1
   ```

2. **Upload folder `frontend/out/`** ke shared hosting

3. **Deploy backend Laravel** seperti biasa

Lihat **[DEPLOY_SHARED_HOSTING.md](./DEPLOY_SHARED_HOSTING.md)** untuk panduan lengkap deployment ke shared hosting.

### Catatan Penting

- Frontend harus di-build di komputer lokal (yang punya Node.js)
- Hasil build adalah static files yang bisa di-upload ke shared hosting
- Backend Laravel tetap perlu PHP + MySQL di shared hosting

## Lisensi

Proyek ini dibuat untuk keperluan internal sekolah.
