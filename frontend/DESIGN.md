# Design System EPSS

Aturan tampilan untuk semua layar di `frontend/`. Kalau Figma dan aturan ini berbeda, **aturan ini yang dipakai**: Figma
Hifi tidak selalu konsisten (judul halaman 31px di satu layar, 25px di layar lain), jadi di sini dipilih satu.

- **Figma:** [Design.md](https://www.figma.com/design/35LnH8M69NxGE7JhUIdTeY/Design.md). Halaman *Design System* = sumber
  skala tipografi dan color style; halaman *Hifi Design* = layar dan komponen.
- **Token:** `src/index.css` (blok `@theme`). Nilai bawaan Tailwind (`text-sm`, `red-600`, `rounded-lg` bawaan, ...)
  dimatikan, jadi hanya token di dokumen ini yang berlaku.
- **Komponen:** `src/components/ui.jsx`, class bersama (`buttonClass`, `fieldClass`) di `src/components/classes.js`.
  Pakai yang ada sebelum menulis markup baru.
- **Penjaga:** `node src/design.check.js` gagal jika `src/` memakai ukuran font, warna, radius, shadow, atau spacing mentah.

## 1. Warna

Semua warna 1:1 dengan color style Figma. Jangan menulis hex di class (`bg-[#...]`); kalau butuh warna baru, tambahkan
dulu ke Figma lalu ke `@theme`.

| Palet | 50 | 75 | 100 | 200 | 300 | 400 | 500 |
|---|---|---|---|---|---|---|---|
| `lime` | `#fdfff4` | `#f8fdd3` | `#f5fcc1` | `#f1fba6` | `#eefa94` | `#a7af68` | `#878f52` |
| `grey` | `#e8e8e8` | `#a0a0a2` | `#78797b` | `#3e3f43` | `#17181c` | `#101114` | `#0e0f11` |
| `grey2` | `#fdfdfd` | `#f6f8f6` | `#f2f5f3` | `#edf1ee` | `#e9eeea` | `#a3a7a4` | `#8e918f` |
| `green` | `#effdec` | `#bdf5b1` | `#a1f191` | `#79ea61` | `#5de641` | `#41a12e` | `#398c28` |
| `red` | `#fdecec` | `#f5b1b1` | `#f19191` | `#ea6161` | `#e64141` | `#a12e2e` | `#8c2828` |
| `yellow` | `#fefbec` | `#f9edb2` | `#f6e591` | `#f3da62` | `#f0d342` | `#a8942e` | `#806104` |

Ditambah `white` dan satu pengecualian: `blue-50` `#c8ebfa` / `blue-500` `#2b51bb` untuk status *info* (komponen Status
Kegiatan di Figma memakai biru walau tidak ada di color style). Warna kategori kegiatan di kalender/peta (`WARNA` di
`lib/epss.js`) adalah warna data, bukan warna UI, dan tidak dipakai di luar itu.

### Peran warna

| Peran | Token |
|---|---|
| Latar halaman | `grey2-100` (sudah diatur di layout) |
| Permukaan terang (kartu, modal, tabel) | `white`; tabel di dalam kotak lime: `grey2-50` |
| Permukaan gelap (sidebar, panel, kepala modal) | `grey-300` atau `grey-500` |
| Area kerja (kotak list/peta) | `bg-lime-300` + `border-5 border-dashed border-lime-500` |
| Teks utama | `grey-500` (default `body`, tidak perlu ditulis) |
| Teks sekunder (subjudul, meta, kosong, bantuan) | `grey-200` |
| Placeholder, ikon/garis nonaktif | `grey-75` |
| Teks di permukaan gelap | judul/aksen `lime-300`, isi `white` atau `grey-50` |
| Garis | `grey-75` (input, `hr`, kepala tabel), `grey-75/50` (pemisah baris), `grey-500` (tegas/terpilih) |
| Status | `red` / `yellow` / `blue` / `green`: latar `-50`, teks & garis `-500` (lewat `Badge` / `Notice`) |
| Error teks | `red-400` (lewat `FormError`) |
| Aksi merusak | `red-400` (tombol `danger`), ikon hapus di `red-200` |

Jangan pakai `grey-100` untuk teks: kontrasnya di latar putih 4.36:1, di bawah batas WCAG AA (4.5:1).

## 2. Tipografi

Font **Plus Jakarta Sans**. Skala Figma: dasar 16px, rasio 1.25. Semua line-height **1.2** (sudah default, jangan
tulis `leading-*` kecuali `leading-snug` untuk paragraf panjang di dialog/notifikasi).

| Class | Ukuran | Weight bawaan | Dipakai untuk |
|---|---|---|---|
| `text-display-1` | 61px | (atur sendiri) | Angka utama dashboard (skor IPS) |
| `text-display-2` | 49px | (atur sendiri) | Angka kartu statistik |
| `text-display-3` | 39px | (atur sendiri) | Angka pendamping |
| `text-h1` | 31px | Bold 700 | Judul halaman, **satu per halaman** |
| `text-h2` | 25px | Semibold 600 | Judul bagian di halaman, judul kartu besar |
| `text-h3` | 20px | Semibold 600 | Judul kartu, panel gelap, modal, daftar |
| `text-lead` | 20px | Regular 400 | Subjudul halaman |
| `text-body` | 16px | Regular 400 | Teks biasa, tombol, field, badge (default `body`) |
| `text-small` | 13px | Regular 400 | Meta, bantuan, error, tabel padat, sidebar |
| `text-caption` | 10px | Regular 400 | Keterangan kecil (ukuran file, sub-label) |

- Weight yang dipakai: `font-light` (teks pelengkap, placeholder), `font-normal`, `font-medium` (angka, tombol kecil),
  `font-semibold` (label, judul kecil, kepala tabel), `font-bold` (hanya `text-h1` dan nama aplikasi).
- Label field dan judul kecil di dalam kartu = `font-semibold` dengan ukuran body, bukan heading baru.
- Ukuran di luar tabel ini (14px, 18px, 24px, `text-[..px]`) tidak boleh.

## 3. Spacing

Skala Tailwind (1 = 4px) dengan langkah setengah (2px): `gap-2`, `px-2.5`, `py-3.5`. Tidak ada `p-[..px]` / `gap-[..px]`.

| Pola | Nilai |
|---|---|
| Jarak antar blok halaman (akar halaman) | `gap-8` |
| Jarak judul bagian → isinya | `gap-6` |
| Jarak antar field form | `gap-6` |
| Label → field | `gap-2` (di `Field`) |
| Padding kartu | `p-6` (kartu besar `px-6 py-8`) |
| Padding modal | `px-8.5 pt-7 pb-8` |
| Item list/tabel | `px-7 py-4` (baris), `py-2.5`–`py-3.5` (sel tabel) |
| Antar tombol | `gap-4` (aksi modal), `gap-2` (ikon aksi di tabel) |

Ukuran tata letak (lebar kolom, tinggi kartu) boleh memakai nilai `w-[...]`/`h-[...]` dari Figma.
**Tinggi kontrol form = 45px** (`h-[45px]`): input, select, search, filter.

## 4. Radius, garis, shadow

| Class | Nilai | Dipakai untuk |
|---|---|---|
| `rounded-xs` | 5px | Tombol ikon 24px, kotak ikon kecil |
| `rounded-sm` | 10px | Tombol kecil, badge, baris berkas, sel kalender |
| `rounded-md` | 16px | Tombol, field, item list, kotak di dalam kartu |
| `rounded-lg` | 20px | Kartu, panel, modal, tabel |
| `rounded-xl` | 40px | Panel besar halaman login |
| `rounded-full` | pil | Chip bobot, avatar, titik |

Garis: `border` (1px) default, `border-2` untuk terpilih/penekanan, `border-dashed` untuk area unggah (`border-2`) dan
area kerja lime (`border-5`).

| Class | Dipakai untuk |
|---|---|
| `shadow-sm` | Node peta, panel kecil mengambang |
| `shadow-md` | Hover kartu yang bisa diklik (`hover:-translate-y-0.5 hover:shadow-md`) |
| `shadow-lg` | Modal, popover notifikasi, panel samping |

## 5. Komponen (`src/components/ui.jsx`, `src/components/classes.js`)

### Kepala halaman

```jsx
<PageHeader title="Kelola Pengguna" subtitle="Kelola peran dan akses ..." back="/pengaturan-periode">
  <button className={buttonClass()}>Buat Akun Baru</button>
</PageHeader>
<PageHeader as="h2" title="Status per Indikator"><SearchBox ... /></PageHeader>
```

Setiap halaman dimulai dengan `PageHeader` (h1 + subjudul `text-lead`, tombol Kembali lewat `back`, aksi di kanan).
Bagian di dalam halaman memakai `as="h2"` (h2 + subjudul `text-body`). Jangan menulis `<h1>` sendiri.

### Tombol: `buttonClass(variant, size)`

Satu sumber class untuk `<button>`, `<Link>`, dan `<a>` (komponen *Button* dan *Button kecil* di Figma).

| Varian | Tampilan | Dipakai untuk |
|---|---|---|
| `primary` (default) | `grey-300` + teks `lime-300` | Aksi utama: Simpan, Tambah, Ajukan |
| `secondary` | `lime-300` + teks `grey-500` | Batal, aksi pendamping, aksi di permukaan gelap |
| `outline` | garis `grey-500` | Aksi ringan di permukaan terang |
| `danger` | `red-400` + teks putih | Hapus, Kunci Periode |

Ukuran `md` (default, `px-5 py-2.5`, 16px) atau `sm` (tinggi 24px, `font-medium`). Ikon 19–24px di kiri label; panah di
kanan pakai `justify-between!`. Lebar tetap ditambah lewat class (`min-w-30`, `w-full`). Hover sudah diatur varian;
jangan menambah `hover:scale-*`. `ArrowLink` = tombol primary dengan panah panjang.

Tombol ikon di tabel: `grid size-6 place-items-center rounded-xs` dengan `bg-lime-300` (edit/lihat) atau `bg-red-200`
(hapus), ikon 18–24px dan `aria-label` wajib.

### Form

- `Field` (label `font-semibold` + `gap-2`) membungkus `Input`, `Select`, atau `<textarea className={`${fieldClass} ...`}>`.
- Field = garis 1px `grey-75`, latar putih, `rounded-md`, placeholder `font-light grey-75`, fokus garis `grey-500`.
- `Select`: opsi `value=""` yang terpilih otomatis tampil seperti placeholder.
- `SearchBox` untuk pencarian (`variant="grey"` di dalam area kerja lime).
- `FormError` untuk error form (merender kosong jika tidak ada error).
- `ModalActions` untuk pasangan Batal + Simpan di akhir form modal.

### Status & pesan

- `Badge tone="red|yellow|blue|green"` untuk status; `StatusBukti status="..."` untuk status bukti dukung.
  Makna: merah = belum/perlu perbaikan, kuning = menunggu/berjalan, biru = info/diunggah, hijau = selesai/terverifikasi.
- `Notice tone="..."` untuk pesan berkotak (periode terkunci, catatan verifikator, error muat).
- `Memuat dari={[...]}` untuk status muat/error dari hook data.
- Keadaan kosong: kalimat `text-grey-200` di tengah (`py-10 text-center`), di dalam kartu putih jika daftar berupa kartu.

### Dialog

- `Modal` (judul `text-h3` putih di `DialogHeader` gelap, `shadow-lg`, backdrop `grey-500/40`).
- `ConfirmDialog` lewat `useConfirm()` untuk konfirmasi; `danger` untuk tindakan merusak.
- Pop-up yang tidak memakai `Modal` (form Rencana Kegiatan) tetap memakai `DialogHeader`.

### Tabel

Panel gelap (`rounded-lg bg-grey-500`) dengan judul `text-h3 text-lime-300`, isi `rounded-md bg-white`. Kepala tabel
`font-semibold` dengan `border-b border-grey-75`, baris `border-b border-grey-75/50 last:border-0`, isi `font-medium`.

### Lainnya

`DomainPanel` (kartu domain gelap), `Pagination`, `ChecklistItem`, `Collapse`, `CountUp`, `Spinner`, `BackButton`.

## 6. Ikon

- Ikon dari Figma (Remix Icon) disimpan sebagai SVG di `src/assets/`; pakai `<img alt="" width height>` dengan ukuran
  dari tabel: 15px (di badge/tombol kecil), 19–24px (tombol, menu, aksi), 31–39px (ikon dekoratif besar).
- `lucide-react` hanya untuk ikon yang tidak ada di Figma (tombol menu mobile).
- Ikon dekoratif `alt=""`; tombol yang hanya berisi ikon wajib punya `aria-label`.

## 7. Gerak

Satu kurva untuk semua gerak: `ease-out-quint`. Animasi yang tersedia: `animate-rise` (blok halaman muncul berurutan
lewat class `stagger` di layout), `animate-pop` (dialog), `animate-drop`, `animate-reveal-x` (bar skor),
`animate-settle` (gambar login). Tombol mengecil 3% saat ditekan dan warnanya berganti halus saat hover (global di
`index.css`). Semua animasi mati jika pengguna memilih *kurangi gerak* (`prefers-reduced-motion`).

## 8. Larangan

- Nilai mentah di class: `text-[..px]`, `bg-[#...]`, `rounded-[..px]`, `shadow-[...]`, `p-[..px]`, `leading-[...]`.
- Ukuran/warna bawaan Tailwind: `text-sm`, `text-lg`, `text-black`, `red-600`, `blue-600`, dst. (sudah dimatikan).
- Lebih dari satu `h1` per halaman, atau `h1` yang bukan lewat `PageHeader`.
- Tombol dengan class buatan sendiri; selalu `buttonClass(...)`.
- Teks `grey-100` / teks di bawah kontras 4.5:1.

Cek sebelum commit: `node src/design.check.js`.
