import { Fragment, useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { getMenuForRole, ROLE_LABELS } from '../../config/menu'
import logo from '../../assets/sidebar/logo-kota-bogor.png'
import logoLine from '../../assets/sidebar/logo-line.svg'
import divider from '../../assets/sidebar/divider.svg'
import accountIcon from '../../assets/sidebar/account-circle-fill.svg'
import arrowDownIcon from '../../assets/sidebar/arrow-down-s-line.svg'

function MenuIcon({ icon: Icon }) {
  if (typeof Icon === 'string') {
    return <img src={Icon} alt="" width={24} height={24} className="shrink-0" />
  }
  return <Icon size={24} className="shrink-0 text-grey-50" />
}

// Tinggi menu aktif (50px) beda dengan menu biasa (24px); layout="position" membuat
// elemen yang posisinya bergeser ikut beranimasi, bukan melompat
const MotionNavLink = motion.create(NavLink)

const bubbleTransition = { type: 'spring', stiffness: 500, damping: 38 }

function SectionTitle({ children, className }) {
  return (
    <motion.p layout="position" className={`text-small font-light text-white ${className}`}>
      {children}
    </motion.p>
  )
}

// open/onClose = laci di layar kecil (di bawah lg); di layar besar sidebar selalu tampil,
// Di layar besar sidebar ringkas (hanya logo + ikon) dan melebar menutupi konten saat di-hover/difokus;
// laci di layar kecil tetap lebar penuh
function Sidebar({ user, onLogout, open, onClose }) {
  const sections = getMenuForRole(user.role)
  const [ringkas, setRingkas] = useState(true)
  // Class yang hanya berlaku saat ringkas; semuanya ber-prefix lg:
  const rk = (cls) => (ringkas ? cls : '')
  const [menuOpen, setMenuOpen] = useState(false)
  const akunRef = useRef(null)

  // Menu akun tertutup saat klik di luar atau tekan Esc
  useEffect(() => {
    if (!menuOpen) return
    const tutupLuar = (e) => !akunRef.current.contains(e.target) && setMenuOpen(false)
    const tutupEsc = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('pointerdown', tutupLuar)
    document.addEventListener('keydown', tutupEsc)
    return () => {
      document.removeEventListener('pointerdown', tutupLuar)
      document.removeEventListener('keydown', tutupEsc)
    }
  }, [menuOpen])

  return (
    <>
    {open && <div onClick={onClose} aria-hidden className="fixed inset-0 z-30 bg-grey-500/40 lg:hidden" />}
    {/* Saat tertutup di layar kecil: geser keluar + invisible, jadi tidak bisa difokus keyboard */}
    {/* Penahan tempat 88px di layar besar, karena sidebar-nya fixed agar bisa melebar di atas konten */}
    <div aria-hidden className="hidden w-[88px] shrink-0 lg:block" />
    <aside
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      onPointerEnter={() => setRingkas(false)}
      onPointerLeave={() => setRingkas(true)}
      onFocus={() => setRingkas(false)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setRingkas(true)}
      className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[242px] shrink-0 flex-col bg-grey-300 font-sans transition-[translate,visibility,width] duration-300 ease-out-quint lg:translate-x-0 lg:overflow-hidden ${ringkas ? 'lg:w-[88px]' : 'lg:shadow-lg'} ${
        open ? 'translate-x-0' : 'max-lg:invisible -translate-x-full'
      }`}
    >
      {/* Logo + nama aplikasi */}
      <div className="mt-7.5 flex h-12 items-center justify-center gap-2">
        <img src={logo} alt="Logo Kota Bogor" className="size-[35px] object-cover" />
        <span className={`flex h-[33px] w-0 items-center justify-center ${rk('lg:hidden')}`}>
          <img src={logoLine} alt="" width={33} height={1} className="max-w-none rotate-90" />
        </span>
        <div className={`flex w-[155px] flex-col gap-2 text-grey-50 ${rk('lg:hidden')}`}>
          <p className="text-small font-bold">Sistem Manajemen EPSS</p>
          <p className="text-caption font-light">Diskominfo Kota Bogor</p>
        </div>
      </div>

      {/* Menu navigasi; reducedMotion="user" mematikan animasi jika user memilih "kurangi animasi" di OS */}
      <MotionConfig transition={bubbleTransition} reducedMotion="user">
        <nav className={`mt-15 ml-6 flex w-[194px] flex-col items-start gap-5 ${rk('lg:ml-0 lg:w-full lg:items-center')}`}>
          {sections.map((section, index) => (
            <Fragment key={section.title}>
              {index > 0 && <motion.img layout="position" src={divider} alt="" width={192} height={1} className={rk('lg:w-12')} />}
              <SectionTitle className={rk('lg:sr-only')}>{section.title}</SectionTitle>
              {section.items.map((item) => (
                <MotionNavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  title={ringkas ? item.label : undefined}
                  layout="position"
                  // NavLink otomatis memberi class "active" pada menu halaman saat ini
                  className={`relative flex h-6 w-[196px] shrink-0 items-center px-2 text-small font-semibold whitespace-nowrap text-grey-50 hover:text-white [&.active]:h-[50px] ${rk('lg:w-[50px] lg:justify-center')}`}
                >
                  {({ isActive }) => (
                    <>
                      {/* Satu bubble dengan layoutId yang sama, jadi Motion menganimasikannya pindah antar menu */}
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active-bubble"
                          className="absolute inset-0 bg-grey-75/50"
                          style={{ borderRadius: 10 }}
                        />
                      )}
                      <motion.span layout="position" className="relative flex items-center gap-2">
                        <MenuIcon icon={item.icon} />
                        {/* sr-only, bukan hidden: nama menu tetap terbaca screen reader */}
                        <span className={rk('lg:sr-only')}>{item.label}</span>
                      </motion.span>
                    </>
                  )}
                </MotionNavLink>
              ))}
            </Fragment>
          ))}
        </nav>

        {/* Profil user; klik untuk membuka tombol Keluar */}
        <div ref={akunRef} className={`relative mt-auto mb-8.5 ml-5 w-[196px] ${rk('lg:ml-0 lg:w-full')}`}>
          <AnimatePresence>
            {menuOpen && (
              <motion.button
                type="button"
                onClick={onLogout}
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-full mb-2 w-full origin-bottom rounded-sm bg-grey-75/50 px-3.5 py-3 text-left text-small font-semibold text-grey-50"
              >
                Keluar
              </motion.button>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label="Menu akun"
            title={ringkas ? user.name : undefined}
            className={`flex w-full items-center rounded-sm px-2 text-left ${rk('lg:justify-center')}`}
          >
            <span className="flex items-center gap-2">
              <img src={accountIcon} alt="" width={53} height={53} className="shrink-0" />
              <span className={`flex flex-col gap-2 text-small whitespace-nowrap text-grey-50 ${rk('lg:sr-only')}`}>
                <span className="font-semibold">{user.name}</span>
                <span className="font-light">{ROLE_LABELS[user.role]}</span>
              </span>
            </span>
            <img
              src={arrowDownIcon}
              alt=""
              width={24}
              height={24}
              className={`ml-auto shrink-0 transition-transform duration-300 ease-out-quint ${menuOpen ? 'rotate-180' : ''} ${rk('lg:hidden')}`}
            />
          </button>
        </div>
      </MotionConfig>
    </aside>
    </>
  )
}

export default Sidebar
