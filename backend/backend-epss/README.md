<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

# Backend EPSS

Backend aplikasi EPSS menggunakan Laravel 12, PostgreSQL,
dan autentikasi sesi melalui Laravel Sanctum.

## Persyaratan lokal

- PHP yang memenuhi persyaratan composer.json; minimum PHP 8.2.
- Composer 2.
- PostgreSQL.
- Extension PHP pdo_pgsql aktif.

Seluruh command berikut dijalankan dari root Laravel:
folder yang memiliki artisan dan composer.json.

## Database

Siapkan dua database PostgreSQL melalui pgAdmin:

- epss_db untuk pengembangan.
- epss_testing khusus pengujian otomatis.

Database epss_testing harus boleh dibangun ulang.
Jangan menyimpan data penting di dalamnya.

## Setup pengembangan pada instalasi baru

1. Pasang dependensi sesuai composer.lock:

```powershell
composer install
```

2. Jika file .env belum ada, salin template:

```powershell
Copy-Item .env.example .env
```

3. Isi DB_HOST, DB_PORT, DB_USERNAME, dan DB_PASSWORD pada .env.
   Pastikan DB_DATABASE=epss_db.

4. Bersihkan cache konfigurasi dan buat application key:

```powershell
php artisan config:clear
php artisan key:generate
```

Jangan membuat ulang application key pada instalasi yang sudah
memiliki data terenkripsi tanpa memahami dampaknya.

5. Jalankan migration dan server lokal:

```powershell
php artisan migrate
php artisan serve
```

Gunakan http://127.0.0.1:8000 secara konsisten.
Sesuaikan port pada konfigurasi jika server memakai port berbeda.

## Setup pengujian pada instalasi baru

1. Jika .env.testing belum ada, salin template:

```powershell
Copy-Item .env.testing.example .env.testing
```

2. Isi kredensial PostgreSQL pada .env.testing.
   Pastikan DB_DATABASE=epss_testing.

3. Siapkan application key khusus testing:

```powershell
php artisan config:clear
php artisan key:generate --env=testing
```

4. Verifikasi koneksi sebelum menjalankan test:

```powershell
php artisan tinker --env=testing
```

Di dalam Tinker:

```php
app()->environment();
config('database.default');
DB::selectOne('SELECT current_database() AS database')->database;
exit
```

Hasil harus berurutan: testing, pgsql, epss_testing.
Jika berbeda, perbaiki konfigurasi sebelum menjalankan test.

phpunit.xml juga menetapkan koneksi pgsql dan database epss_testing
ketika PHPUnit dijalankan.

5. Jalankan pengujian autentikasi:

```powershell
php artisan test tests/Feature/Auth
```

Tidak perlu menjalankan php artisan serve untuk Feature Test.

Test menggunakan RefreshDatabase dan dapat membangun ulang tabel
database testing. Session driver array digunakan selama test;
pertukaran cookie browser dan penyimpanan sesi database juga perlu
diverifikasi melalui pengujian HTTP manual.

## Endpoint autentikasi saat ini

| Metode | Path | Fungsi |
|---|---|---|
| GET | /sanctum/csrf-cookie | Menyiapkan cookie CSRF |
| POST | /login | Login akun aktif melalui sesi |
| GET | /api/user | Membaca pengguna yang terautentikasi dan aktif |
| POST | /logout | Mengakhiri sesi login saat ini |

Frontend mengirim cookie sesi dan header Accept: application/json.
Request POST juga memerlukan token CSRF yang sesuai.

Konfigurasi lintas origin untuk frontend React belum disiapkan.
Akun awal pengembangan belum dibuat melalui seeder.

## Konfigurasi lokal

.env dan .env.testing berisi konfigurasi lokal dan tidak masuk Git.
File .example tidak boleh berisi password, token, atau application key.

Konfigurasi HTTP dan APP_DEBUG=true pada template ditujukan untuk
pengembangan lokal, bukan konfigurasi production.

---