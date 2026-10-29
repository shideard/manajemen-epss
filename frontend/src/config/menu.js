import { Users } from 'lucide-react'
import dashboardIcon from '../assets/sidebar/dashboard-fill.svg'
import bookIcon from '../assets/sidebar/book-2-fill.svg'
import calendarIcon from '../assets/sidebar/calendar-fill.svg'
import folderIcon from '../assets/sidebar/folder-5-fill.svg'
import scalesIcon from '../assets/sidebar/scales-3-fill.svg'
import downloadIcon from '../assets/sidebar/download-fill.svg'
import folderSettingsIcon from '../assets/sidebar/folder-settings-fill.svg'

// Role sesuai enum backend: app/Enums/UserRole.php
export const ROLES = {
  SUPER_ADMIN_BIDANG: 'SUPER_ADMIN_BIDANG',
  OPERATOR: 'OPERATOR',
  VERIFIKATOR: 'VERIFIKATOR',
}

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN_BIDANG]: 'Super Admin Bidang',
  [ROLES.OPERATOR]: 'Operator',
  [ROLES.VERIFIKATOR]: 'Verifikator',
}

const { SUPER_ADMIN_BIDANG, OPERATOR, VERIFIKATOR } = ROLES

// icon: path SVG dari Figma, atau komponen React (untuk menu yang belum ada desainnya)
export const menuSections = [
  {
    title: 'Menu Utama',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: dashboardIcon, roles: [OPERATOR, VERIFIKATOR] },
      { label: 'Pedoman Indikator', path: '/pedoman-indikator', icon: bookIcon, roles: [OPERATOR, VERIFIKATOR] },
      {
        label: 'Rencana Kegiatan',
        icon: calendarIcon,
        roles: [OPERATOR, VERIFIKATOR],
        // Menu ber-submenu (dropdown di sidebar); submenu ikut roles induknya
        children: [
          { label: 'Rencana & Kalender', path: '/rencana-kegiatan' },
          { label: 'Peta Relasi Kegiatan', path: '/rencana-kegiatan/peta-relasi' },
        ],
      },
      {
        label: 'Bukti Dukung',
        icon: folderIcon,
        roles: [OPERATOR],
        children: [
          { label: 'Upload Bukti Dukung', path: '/repositori-bukti-dukung' },
          { label: 'Repositori Bukti Dukung', path: '/repositori-bukti-dukung/arsip' },
        ],
      },
      { label: 'Kelola Pengguna', path: '/users', icon: Users, roles: [SUPER_ADMIN_BIDANG] },
      { label: 'Verifikasi Bukti Dukung', path: '/verifikasi-bukti-dukung', icon: scalesIcon, roles: [VERIFIKATOR] },
    ],
  },
  {
    title: 'Tata Kelola',
    items: [
      { label: 'Export LKE & Bukti', path: '/export-lke', icon: downloadIcon, roles: [OPERATOR] },
      { label: 'Pengaturan Periode', path: '/pengaturan-periode', icon: folderSettingsIcon, roles: [VERIFIKATOR] },
    ],
  },
]

// Hanya section yang punya minimal satu menu untuk role tersebut
export function getMenuForRole(role) {
  return menuSections
    .map((section) => ({ ...section, items: section.items.filter((item) => item.roles.includes(role)) }))
    .filter((section) => section.items.length > 0)
}

// Semua path halaman di menu role tersebut, termasuk submenu
export const menuPathsForRole = (role) =>
  getMenuForRole(role).flatMap((section) => section.items.flatMap((item) => item.children ?? [item]).map((item) => item.path))

// Hak akses aksi di dalam halaman (akses halaman diatur oleh `roles` di menuSections).
//   Operator    : lihat Rencana Kegiatan; unggah & ajukan bukti hanya untuk kegiatan yang ia PIC-nya
//   Verifikator : kelola Rencana Kegiatan + pemetaan indikator, verifikasi bukti, kelola periode
//   Superadmin  : kelola pengguna saja
// Periode yang dikunci membuat semua data hanya-baca (lihat `bolehUbah`).
// ponytail: aturan ini hanya di UI; backend tetap wajib memeriksa role yang sama di setiap endpoint
const AKSI = {
  kelolaRencana: [VERIFIKATOR],
  unggahBukti: [OPERATOR],
  verifikasiBukti: [VERIFIKATOR],
  kelolaPeriode: [VERIFIKATOR],
  kelolaPengguna: [SUPER_ADMIN_BIDANG],
}

export const bisa = (user, aksi) => AKSI[aksi].includes(user.role)

// Aksi yang mengubah data periode berjalan: role-nya boleh DAN periode aktif belum dikunci
export const bolehUbah = (user, aksi, periode) => bisa(user, aksi) && !periode?.terkunci
