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
| Rencana kegiatan: tabel, kalender, kanban, dan peta relasi kegiatan–indikator | lihat | kelola | |
| Unggah bukti dukung untuk kegiatan yang ia PIC-nya, dan repositori berkas | ✓ | | |
| Verifikasi bukti dukung: setujui atau minta perbaikan, beserta catatan | | ✓ | |
| Export LKE dan bukti dukung | ✓ | | |
| Pengaturan periode penilaian (siklus 2 tahunan, target IPS, kunci periode) | | ✓ | |
| Kelola pengguna | | | ✓ |

Semua role mendapat notifikasi tenggat kegiatan. Periode yang sudah dikunci membuat seluruh data hanya-baca.

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
docs/                  arsitektur dan konvensi kode
```

## Dokumentasi

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): modul dan aturan dependensi
- [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md): konvensi kode
- [`frontend/DESIGN.md`](frontend/DESIGN.md): design system; `node src/design.check.js` menolak warna, ukuran font,
  radius, shadow, atau spacing mentah di class

## Kontribusi

- Commit satu baris dengan format `type(scope): ringkasan`, misalnya `feat(kegiatan): tambah filter PIC`.
  Scope: dashboard, bukti, periode, kegiatan, users, auth, layout, lib, deps, ci, docs.
- Pastikan lint, build, dan test lolos sebelum membuka PR ke `main`.
