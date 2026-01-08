# Panduan Deploy ke Shared Hosting

Panduan ini menjelaskan cara deploy aplikasi SmartSchool ke shared hosting yang **tidak mendukung npm install**.

## Konsep Solusi

Karena shared hosting tidak mendukung `npm install`, kita akan:
1. **Build frontend di komputer lokal** (yang sudah ada Node.js)
2. **Export sebagai static files** (HTML, CSS, JS)
3. **Upload static files ke shared hosting**
4. **Deploy backend Laravel** seperti biasa ke shared hosting

## Prerequisites

- Node.js 20+ terinstall di komputer lokal
- Composer terinstall di komputer lokal
- Akses FTP/cPanel ke shared hosting
- Shared hosting mendukung PHP 8.2+ dan MySQL

## Langkah-langkah Deployment

### 1. Build Frontend di Komputer Lokal

```bash
# Masuk ke direktori frontend
cd frontend

# Install dependencies (hanya sekali, di komputer lokal)
npm install

# Buat file .env.local dengan URL API production
# Ganti dengan URL backend Anda di shared hosting
echo "NEXT_PUBLIC_API_URL=https://yourdomain.com/api" > .env.local

# Build dan export sebagai static files
npm run export
```

Setelah build selesai, folder `frontend/out` akan berisi semua file static yang siap di-upload.

### 2. Upload Frontend ke Shared Hosting

**Opsi A: Upload ke subdomain atau folder terpisah**
```
public_html/
├── api/          (Backend Laravel)
└── frontend/     (Frontend static files dari folder out/)
```

**Opsi B: Upload ke root domain (jika frontend di root)**
```
public_html/      (Upload semua isi folder out/ ke sini)
```

**Opsi C: Upload ke subdomain**
```
subdomain.yourdomain.com/  (Upload semua isi folder out/ ke sini)
```

**Cara Upload:**
1. Buka File Manager di cPanel atau gunakan FTP client (FileZilla, WinSCP)
2. Upload semua file dari folder `frontend/out/` ke lokasi yang diinginkan
3. Pastikan file `.htaccess` (jika ada) juga di-upload

### 3. Konfigurasi .htaccess untuk Frontend (Opsional)

Jika frontend di root domain, buat file `.htaccess` di root:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Handle Next.js routing
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^(.*)$ /index.html [L]
</IfModule>
```

### 4. Deploy Backend Laravel

**Struktur folder di shared hosting:**
```
public_html/
├── api/                    # Backend Laravel
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/            # Public folder Laravel
│   │   ├── index.php
│   │   └── .htaccess
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   ├── .env
│   └── composer.json
└── frontend/              # Frontend static (dari folder out/)
```

**Langkah deploy backend:**

1. **Upload semua file backend** ke folder `public_html/api/` (kecuali folder `public`)

2. **Upload isi folder `public`** ke `public_html/api/public/`

3. **Edit file `public_html/api/public/index.php`** untuk menyesuaikan path:
   ```php
   // Ubah baris ini:
   require __DIR__.'/../vendor/autoload.php';
   $app = require_once __DIR__.'/../bootstrap/app.php';
   
   // Menjadi (sesuaikan dengan struktur folder Anda):
   require __DIR__.'/../../api/vendor/autoload.php';
   $app = require_once __DIR__.'/../../api/bootstrap/app.php';
   ```

4. **Buat file `.htaccess` di `public_html/api/public/`:**
   ```apache
   <IfModule mod_rewrite.c>
       <IfModule mod_negotiation.c>
           Options -MultiViews -Indexes
       </IfModule>

       RewriteEngine On

       # Handle Authorization Header
       RewriteCond %{HTTP:Authorization} .
       RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

       # Redirect Trailing Slashes If Not A Folder...
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteCond %{REQUEST_URI} (.+)/$
       RewriteRule ^ %1 [L,R=301]

       # Send Requests To Front Controller...
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteRule ^ index.php [L]
   </IfModule>
   ```

5. **Konfigurasi `.env` di shared hosting:**
   ```env
   APP_NAME=SmartSchool
   APP_ENV=production
   APP_KEY=base64:... (generate dengan: php artisan key:generate)
   APP_DEBUG=false
   APP_URL=https://yourdomain.com

   DB_CONNECTION=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_DATABASE=nama_database
   DB_USERNAME=username_database
   DB_PASSWORD=password_database

   # CORS - sesuaikan dengan domain frontend
   FRONTEND_URL=https://yourdomain.com
   ```

6. **Set permissions:**
   ```bash
   chmod -R 755 storage bootstrap/cache
   chmod -R 775 storage bootstrap/cache
   ```

7. **Jalankan migrations (via SSH atau cPanel Terminal):**
   ```bash
   cd public_html/api
   php artisan migrate --force
   ```

### 5. Konfigurasi CORS di Backend

Pastikan file `backend/config/cors.php` sudah dikonfigurasi:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
],
```

### 6. Update URL API di Frontend

Setelah build, pastikan file `.env.local` sudah berisi:
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

Lalu rebuild:
```bash
cd frontend
npm run export
```

Upload ulang folder `out/` ke shared hosting.

## Struktur Final di Shared Hosting

```
public_html/
├── .htaccess                    # Untuk routing frontend
├── index.html                   # Entry point frontend
├── _next/                       # Next.js assets
├── api/                         # Backend Laravel
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/
│   │   ├── index.php
│   │   └── .htaccess
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   └── .env
└── (file static lainnya dari frontend)
```

## Update Aplikasi di Masa Depan

Ketika ada update frontend:

1. **Di komputer lokal:**
   ```bash
   cd frontend
   npm install  # Jika ada dependency baru
   npm run export
   ```

2. **Upload folder `out/`** ke shared hosting (replace yang lama)

3. **Untuk backend:** Upload file yang berubah saja, atau full upload jika banyak perubahan

## Troubleshooting

### Frontend tidak bisa akses API
- Pastikan `NEXT_PUBLIC_API_URL` di `.env.local` sudah benar
- Pastikan CORS di backend sudah dikonfigurasi
- Cek apakah URL API bisa diakses langsung di browser

### 404 Error di halaman tertentu
- Pastikan `.htaccess` sudah dikonfigurasi dengan benar
- Pastikan semua file dari folder `out/` sudah di-upload

### Backend error 500
- Cek file `.env` sudah benar
- Cek permissions folder `storage` dan `bootstrap/cache`
- Cek error log di cPanel

### CORS Error
- Pastikan `FRONTEND_URL` di `.env` backend sudah benar
- Pastikan `allowed_origins` di `config/cors.php` sudah benar

## Catatan Penting

1. **Static Export Limitation:**
   - Tidak bisa menggunakan Next.js API Routes
   - Tidak bisa menggunakan Server Components (hanya Client Components)
   - Tidak bisa menggunakan Image Optimization (sudah di-disable)

2. **Build harus dilakukan di komputer lokal** setiap kali ada perubahan frontend

3. **Pastikan Node.js version** di komputer lokal sama dengan yang digunakan saat development

4. **Backup database** sebelum deploy ke production

## Alternatif: Menggunakan Vercel/Netlify untuk Frontend

Jika shared hosting terlalu rumit, pertimbangkan:
- **Frontend di Vercel/Netlify** (gratis, mudah, support Next.js)
- **Backend Laravel di shared hosting** (hanya perlu PHP + MySQL)

Ini akan lebih mudah karena Vercel/Netlify otomatis build dan deploy dari Git.
