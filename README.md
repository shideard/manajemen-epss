# Manajemen EPSS

Aplikasi web untuk mengelola **Evaluasi Penyelenggaraan Statistik Sektoral (EPSS)** di tingkat OPD: merencanakan
kegiatan statistik, mengumpulkan dan memverifikasi bukti dukung per indikator, memantau skor
**Indeks Pembangunan Statistik (IPS)**, dan menyiapkan Lembar Kerja Evaluasi (LKE) untuk penilaian.
Instrumen dan bobot indikator mengikuti Peraturan BPS No. 3 Tahun 2022.

## Fitur

Akses menu diatur per role (`frontend/src/config/menu.js`).

| Fitur | Operator | Verifikator | Super Admin Bidang |
|---|:-:|:-:|:-:|
| Dashboard: skor IPS bayangan, predikat, dan simulasi kenaikan level | ✓ | ✓ | |
| Pedoman indikator per domain | ✓ | ✓ | |
| Rencana kegiatan: tabel, kalender, kanban, peta relasi; tiap indikator tertaut diberi level target dan output bukti (dengan contoh berkas) | lihat | kelola | |
| Unggah bukti dukung dan isi checklist level target untuk kegiatan yang ia PIC-nya, repositori berkas | ✓ | | |
| Verifikasi bukti dukung per level target: setujui atau minta perbaikan, beserta catatan | | ✓ | |
| Export LKE (CSV) dan paket ZIP bukti dukung | ✓ | | |
| Pengaturan periode penilaian (siklus 2 tahunan, target IPS, kunci periode) | | ✓ | |
| Kelola pengguna | | | ✓ |

Semua role mendapat notifikasi tenggat kegiatan. Periode yang sudah dikunci membuat seluruh data hanya-baca.

**Level indikator dan IPS.** Verifikator menetapkan level yang dipenuhi tiap kegiatan untuk setiap indikator tertautnya
(mis. "Forum Satu Data" → Indikator 19 Level 3). Operator hanya mengisi checklist level itu, dan verifikator hanya
memeriksa level itu. Level indikator = level berurutan dari level 1 yang sudah terverifikasi: jika level 1, 2, dan 4
terverifikasi tetapi level 3 belum, indikator dihitung level 2; begitu level 3 terverifikasi, langsung level 4.
Indikator yang belum punya level terverifikasi dihitung level 1 dalam IPS.

## Teknologi

- **Frontend** (`frontend/`): React 19, Vite, Tailwind CSS 4, React Router, Motion, React Flow (peta relasi).
- **Backend** (`backend/backend-epss/`): Laravel 12, PostgreSQL, autentikasi sesi dengan Laravel Sanctum.

Frontend memanggil API lewat proxy Vite (`/api`, `/sanctum`, `/login`, `/logout` → `http://127.0.0.1:8000`),
jadi cookie sesi berjalan tanpa pengaturan CORS.

## Menjalankan secara lokal

Persyaratan: Node.js 20.19+, PHP 8.2+, Composer 2, dan PostgreSQL (dengan extension `pdo_pgsql`).

1. **Backend.** Ikuti [`backend/backend-epss/README.md`](backend/backend-epss/README.md) untuk membuat database,
   mengisi `.env`, dan menjalankan migration. Lalu jalankan server di `http://127.0.0.1:8000`:

   ```bash
   cd backend/backend-epss
   php artisan serve
   ```

2. **Frontend.** Di terminal lain:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Buka alamat yang ditampilkan Vite (biasanya `http://localhost:5173`).

## Deploy produksi

Frontend (hasil build) dan API Laravel dilayani dari **satu domain**, supaya cookie sesi Sanctum berjalan tanpa CORS.
Contoh konfigurasi nginx ada di [`deploy/nginx.conf.example`](deploy/nginx.conf.example): `frontend/dist` sebagai root,
sedangkan `/api`, `/sanctum`, `POST /login`, `/logout`, dan `/up` diteruskan ke `backend/backend-epss/public/index.php`.

Persyaratan server: PHP 8.2+ dengan `pdo_pgsql`, `zip`, `fileinfo`, `opcache`; Composer 2; Node.js 20.19+ (hanya untuk
build); PostgreSQL; nginx + PHP-FPM.

1. **Backend** (`backend/backend-epss`):

   ```bash
   composer install --no-dev --optimize-autoloader
   cp .env.example .env          # instalasi pertama
   php artisan key:generate      # instalasi pertama saja
   ```

   Isi `.env` produksi:

   ```dotenv
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://epss.example.go.id
   LOG_LEVEL=warning
   DB_HOST=... DB_DATABASE=... DB_USERNAME=... DB_PASSWORD=...
   SESSION_SECURE_COOKIE=true
   SANCTUM_STATEFUL_DOMAINS=epss.example.go.id
   FILESYSTEM_DISK=local         # atau s3 untuk MinIO (isi AWS_*, AWS_USE_PATH_STYLE_ENDPOINT=true)
   ```

   Lalu:

   ```bash
   php artisan migrate --force
   php artisan db:seed --force             # OPD + kriteria/persyaratan level bawaan
   php artisan epss:create-super-admin     # akun super admin pertama
   php artisan config:cache && php artisan route:cache && php artisan view:cache
   ```

   Folder `storage/` dan `bootstrap/cache/` harus bisa ditulis user PHP-FPM (`www-data`). Berkas bukti dukung
   tersimpan di `storage/app/private` (disk `local`), jadi folder itu wajib ikut dicadangkan.

2. **Instrumen EPSS.** Versi instrumen, domain, aspek, indikator, dan bobotnya harus ada di database sebelum periode
   dibuat. `DemoInstrumenEPSSSeeder` hanya untuk environment `local` (bobot contoh), jadi untuk produksi isi instrumen
   resmi Peraturan BPS No. 3/2022. Setelah indikator ada, `php artisan db:seed --class=KriteriaLevelBawaanSeeder --force`
   melengkapi kriteria dan persyaratan level yang belum diisi (level yang sudah ada tidak diubah).

3. **Frontend** (`frontend/`):

   ```bash
   npm ci
   npm run build                 # hasil di frontend/dist
   ```

4. **Pembaruan berikutnya:** `git pull`, ulangi `composer install --no-dev --optimize-autoloader`,
   `php artisan migrate --force`, `php artisan config:cache && php artisan route:cache`, dan `npm ci && npm run build`.

## Perintah frontend

Dijalankan dari `frontend/`.

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi ke `frontend/dist/` |
| `npm run lint` | ESLint |
| `node src/lib/epss.check.js && node src/pages/rencana-kegiatan/kegiatan.check.js && node src/design.check.js` | Test (skrip `node:assert`, tanpa framework) |

## Struktur

```
frontend/
  src/
    pages/<fitur>/     layar per fitur (bukti, periode, rencana-kegiatan); fitur tidak saling import
    pages/*.jsx        halaman satu layar (Dashboard, Login, Users, ...)
    components/        UI bersama (ui.jsx, layout/)
    lib/               logika bersama, client API, hook data (epss.js, api.js, store.js)
    config/            menu dan hak akses per role
  DESIGN.md            design system: token warna, tipografi, spacing, komponen
backend/backend-epss/  API Laravel
```

## Dokumentasi

- [`frontend/DESIGN.md`](frontend/DESIGN.md): design system; `node src/design.check.js` menolak warna, ukuran font,
  radius, shadow, atau spacing mentah di class

## Kontribusi

- Commit satu baris dengan format `type(scope): ringkasan`, misalnya `feat(kegiatan): tambah filter PIC`.
  Scope: dashboard, bukti, periode, kegiatan, users, auth, layout, lib, deps, ci, docs.
- Pastikan lint, build, dan test lolos sebelum membuka PR ke `main`.
