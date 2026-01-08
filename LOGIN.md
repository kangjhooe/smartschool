# Data Login SmartSchool

## Informasi Login Default

### User Test (dari DatabaseSeeder)
Setelah menjalankan `php artisan db:seed`, akan tersedia user test berikut:

- **Email**: `test@example.com`
- **Password**: `password`
- **Role**: `guru` (default)
- **Catatan**: User ini dibuat tanpa instansi_id, jadi mungkin perlu dibuat ulang atau diupdate setelah sekolah dibuat

## Cara Mendapatkan Akses Login

### 1. Registrasi Sekolah Baru (Recommended)
Gunakan endpoint registrasi untuk membuat sekolah dan admin sekolah sekaligus:

**Endpoint**: `POST /api/register-sekolah`

**Request Body**:
```json
{
  "npsn": "12345678",
  "jenjang": "SMA/MA",
  "status_sekolah": "Negeri",
  "nama_sekolah": "SMA Negeri 1 Jakarta",
  "email_sekolah": "info@sman1jkt.sch.id",
  "name": "Admin Sekolah",
  "no_wa": "081234567890",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Catatan**:
- `npsn`: Nomor Pokok Sekolah Nasional (8 digit, harus unique)
- `jenjang`: Pilih salah satu: `SD/MI`, `SMP/MTs`, `SMA/MA`, `SMK/MAK`
- `status_sekolah`: Pilih salah satu: `Negeri` atau `Swasta`
- `email_sekolah`: Email sekolah (akan digunakan sebagai email login admin, harus unique)
- `no_wa`: Nomor WhatsApp admin sekolah

Setelah registrasi berhasil, Anda akan mendapatkan:
- User dengan role `admin_sekolah`
- Token authentication
- Data sekolah yang terhubung

### 2. Membuat User Manual (via Seeder atau Tinker)

#### Via Laravel Tinker
```bash
php artisan tinker
```

Kemudian jalankan:
```php
use App\Models\User;
use App\Models\Sekolah;
use Illuminate\Support\Facades\Hash;

// Buat sekolah terlebih dahulu (jika belum ada)
$sekolah = Sekolah::create([
    'npsn' => '12345678',
    'jenjang' => 'SMA/MA',
    'status_sekolah' => 'Negeri',
    'nama' => 'SMA Negeri 1 Jakarta',
    'email' => 'info@sman1jkt.sch.id',
    'status' => true
]);

// Buat user admin sekolah
$admin = User::create([
    'name' => 'Admin Sekolah',
    'email' => 'info@sman1jkt.sch.id',
    'no_wa' => '081234567890',
    'password' => Hash::make('password123'),
    'role' => 'admin_sekolah',
    'instansi_id' => $sekolah->id
]);

// Buat user guru
$guru = User::create([
    'name' => 'Guru Contoh',
    'email' => 'guru@sman1jkt.sch.id',
    'password' => Hash::make('password123'),
    'role' => 'guru',
    'instansi_id' => $sekolah->id
]);
```

### 3. Membuat Super Admin

**⚠️ Catatan Penting**: Super admin **TIDAK dibuat secara default**. Role `super_admin` tersedia di database, tetapi tidak ada seeder yang membuatnya secara otomatis.

#### Cara 1: Menggunakan Artisan Command (Recommended)
```bash
cd backend
php artisan admin:create-super
```

Command akan meminta:
- Nama Super Admin
- Email Super Admin
- Password (min 8 karakter)

**Atau dengan parameter langsung**:
```bash
php artisan admin:create-super --name="Super Admin" --email="superadmin@smartschool.com" --password="password123"
```

#### Cara 2: Via Laravel Tinker
```bash
php artisan tinker
```

Kemudian jalankan:
```php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Buat super admin
// Catatan: Super admin tidak terikat ke sekolah tertentu (instansi_id = null)
$superAdmin = User::create([
    'name' => 'Super Admin',
    'email' => 'superadmin@smartschool.com',
    'no_wa' => '081234567892',
    'password' => Hash::make('password123'),
    'role' => 'super_admin',
    'instansi_id' => null  // Super admin tidak terikat ke sekolah tertentu
]);
```

**Catatan**: 
- Super admin memiliki akses ke semua sekolah (multi-tenant management)
- `instansi_id` harus `null` karena super admin tidak terikat ke satu sekolah
- Super admin dapat mengelola daftar sekolah dan mengaktifkan/menonaktifkan sekolah
- Super admin **TIDAK** memiliki akses ke data internal sekolah (guru, siswa, kelas)

#### Troubleshooting: Email Salah Saat Login

Jika mendapatkan error "Email/NPSN atau password salah" saat login sebagai super admin:

1. **Verifikasi super admin sudah dibuat**:
```bash
php artisan tinker
```
```php
use App\Models\User;
User::where('role', 'super_admin')->get(['id', 'name', 'email', 'role']);
```

2. **Pastikan email yang digunakan benar** (case-insensitive, tapi pastikan tidak ada typo)

3. **Pastikan password benar** (password di-hash, jadi harus sama persis dengan yang digunakan saat membuat)

4. **Cek apakah email sudah terdaftar**:
```php
use App\Models\User;
User::where('email', 'superadmin@smartschool.com')->first();
```

5. **Buat ulang super admin jika perlu**:
```bash
php artisan admin:create-super
```

## Role yang Tersedia

1. **super_admin**: Admin platform
   - Mengelola daftar sekolah
   - Mengaktifkan/menonaktifkan sekolah
   - **TIDAK** memiliki akses ke data internal sekolah (siswa, guru, kelas)
   - Tidak terikat ke sekolah tertentu (instansi_id = null)

2. **admin_sekolah**: Admin untuk sekolah tertentu
   - Terikat ke satu sekolah (instansi_id)
   - Mengelola data internal sekolahnya sendiri (guru, siswa, kelas)
   - Tidak dapat melihat sekolah lain
   - Tidak dapat login jika sekolah dinonaktifkan

3. **guru**: Pengguna dengan role guru
   - Terikat ke satu sekolah (instansi_id)
   - Akses terbatas sesuai kebutuhan

## Endpoint Login

**URL**: `POST http://localhost:8000/api/login`

### Login Super Admin
**Request Body**:
```json
{
  "email": "superadmin@smartschool.com",
  "password": "password123"
}
```

**Response Success**:
```json
{
  "message": "Login berhasil",
  "user": {
    "id": 1,
    "name": "Super Admin",
    "email": "superadmin@smartschool.com",
    "role": "super_admin",
    "instansi_id": null,
    "instansi": null
  },
  "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Catatan**: 
- Super admin login menggunakan **email yang digunakan saat pembuatan user super admin** (via Tinker)
- Tidak bisa login menggunakan NPSN (hanya admin_sekolah yang bisa)
- Endpoint login sama dengan user lain: `POST /api/login`

### Login Admin Sekolah
**Request Body**:
```json
{
  "email": "info@sman1jkt.sch.id",
  "password": "password123"
}
```

**Atau menggunakan NPSN**:
```json
{
  "email": "12345678",
  "password": "password123"
}
```

**Response Success**:
```json
{
  "message": "Login berhasil",
  "user": {
    "id": 1,
    "name": "Admin Sekolah",
    "email": "info@sman1jkt.sch.id",
    "role": "admin_sekolah",
    "instansi_id": 1,
    "instansi": {
      "id": 1,
      "nama": "SMA Negeri 1 Jakarta",
      ...
    }
  },
  "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Catatan**: 
- Admin sekolah login menggunakan `email_sekolah` yang digunakan saat registrasi
- Bisa juga login menggunakan NPSN (8 digit) sebagai email
- Tidak dapat login jika sekolah dinonaktifkan oleh super admin

## Endpoint Super Admin

**Catatan**: Semua endpoint super admin memerlukan authentication dan role `super_admin`

### List Semua Sekolah
- **URL**: `GET http://localhost:8000/api/admin/sekolah`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Array semua sekolah

### Detail Sekolah
- **URL**: `GET http://localhost:8000/api/admin/sekolah/{id}`
- **Headers**: `Authorization: Bearer {token}`
- **Response**: Detail sekolah termasuk data users, gurus, siswas, kelas

### Aktifkan/Nonaktifkan Sekolah
- **URL**: `PUT http://localhost:8000/api/admin/sekolah/{id}/status`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
```json
{
  "status": true
}
```
- **Response**: Status sekolah berhasil diupdate

## Catatan Penting

1. **Password Default Factory**: Semua user yang dibuat melalui factory memiliki password default: `password`
2. **Multi-Tenant**: Setiap user (kecuali super_admin) terikat ke satu sekolah (instansi_id), dan hanya bisa mengakses data sekolahnya sendiri
3. **Super Admin**: Tidak terikat ke sekolah tertentu, dapat mengelola semua sekolah tetapi tidak dapat akses data internal sekolah
4. **Status Sekolah**: Admin sekolah tidak dapat login jika sekolah dinonaktifkan oleh super admin
5. **Token Authentication**: Setelah login berhasil, gunakan token yang diterima untuk request API selanjutnya dengan header:
   ```
   Authorization: Bearer {token}
   ```
6. **Frontend URL**: Login page tersedia di `http://localhost:3000/login`
7. **Backend URL**: API tersedia di `http://localhost:8000/api`

## Contoh Data Login untuk Testing

### Super Admin
- **Email**: `superadmin@smartschool.com`
- **Password**: `password123`
- **Role**: `super_admin`
- **Instansi ID**: `null`
- **Akses**: 
  - ✅ Mengelola daftar sekolah
  - ✅ Mengaktifkan/menonaktifkan sekolah
  - ❌ Tidak dapat akses data internal sekolah (guru, siswa, kelas)

### Admin Sekolah
- **Email**: `info@sekolah.sch.id` (email_sekolah dari registrasi)
- **Password**: `password123`
- **Role**: `admin_sekolah`
- **Instansi ID**: `1` (terikat ke sekolah tertentu)
- **Akses**: 
  - ✅ Mengelola data internal sekolahnya sendiri (guru, siswa, kelas)
  - ✅ Update data sekolah
  - ❌ Tidak dapat melihat sekolah lain
  - ❌ Tidak dapat login jika sekolah dinonaktifkan

### Guru
- **Email**: `guru@sekolah.sch.id`
- **Password**: `password123`
- **Role**: `guru`
- **Instansi ID**: `1` (terikat ke sekolah tertentu)
- **Akses**: Terbatas sesuai kebutuhan

**⚠️ PENTING**: 
- Ganti password default setelah setup untuk keamanan!
- Super admin harus dibuat manual, tidak dibuat secara default
- Admin sekolah login menggunakan email_sekolah yang digunakan saat registrasi
