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
const ALL_ROLES = Object.values(ROLES)

// icon: path SVG dari Figma, atau komponen React (untuk menu yang belum ada desainnya)
export const menuSections = [
  {
    title: 'Menu Utama',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: dashboardIcon, roles: ALL_ROLES },
      { label: 'Pedoman Indikator', path: '/pedoman-indikator', icon: bookIcon, roles: [OPERATOR, VERIFIKATOR] },
      { label: 'Rencana Kegiatan', path: '/rencana-kegiatan', icon: calendarIcon, roles: [OPERATOR, VERIFIKATOR] },
      { label: 'Repositori Bukti Dukung', path: '/repositori-bukti-dukung', icon: folderIcon, roles: [OPERATOR] },
      { label: 'Verifikasi Bukti Dukung', path: '/verifikasi-bukti-dukung', icon: scalesIcon, roles: [VERIFIKATOR] },
    ],
  },
  {
    title: 'Tata Kelola',
    items: [
      { label: 'Export LKE & Bukti', path: '/export-lke', icon: downloadIcon, roles: [OPERATOR] },
      { label: 'Pengaturan Periode', path: '/pengaturan-periode', icon: folderSettingsIcon, roles: [VERIFIKATOR] },
      { label: 'Kelola User', path: '/users', icon: Users, roles: [SUPER_ADMIN_BIDANG] },
    ],
  },
]

// Hanya section yang punya minimal satu menu untuk role tersebut
export function getMenuForRole(role) {
  return menuSections
    .map((section) => ({ ...section, items: section.items.filter((item) => item.roles.includes(role)) }))
    .filter((section) => section.items.length > 0)
}
