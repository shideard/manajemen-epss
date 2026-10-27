import { Fragment, useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
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

// Menu ber-submenu: induknya tombol buka/tutup dropdown. Bubble aktif ada di induk saat salah satu
// submenunya dibuka, jadi tetap terlihat saat sidebar ringkas (submenu-nya tidak dirender)
function MenuGroup({ item, ringkas, sembunyikanSub, rk, onClose }) {
  const { pathname } = useLocation()
  const aktif = item.children.some((c) => pathname === c.path || pathname.startsWith(`${c.path}/`))
  const [buka, setBuka] = useState(aktif)

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setBuka(!buka)}
        aria-expanded={buka}
        title={ringkas ? item.label : undefined}
        layout="position"
        className={`relative flex w-[196px] shrink-0 items-center px-2 text-small font-semibold whitespace-nowrap text-grey-50 hover:text-white ${aktif ? 'h-[50px]' : 'h-6'} ${rk('lg:w-10')}`}
      >
        {aktif && <motion.span layoutId="sidebar-active-bubble" className="absolute inset-0 bg-grey-75/50" style={{ borderRadius: 10 }} />}
        <motion.span layout="position" className="relative flex items-center gap-2">
          <MenuIcon icon={item.icon} />
          <span className={rk('lg:sr-only')}>{item.label}</span>
        </motion.span>
        <img
          src={arrowDownIcon}
          alt=""
          width={24}
          height={24}
          className={`relative ml-auto shrink-0 transition-transform duration-300 ease-out-quint ${buka ? 'rotate-180' : ''} ${rk('lg:hidden')}`}
        />
      </motion.button>
      <AnimatePresence initial={false}>
        {buka && !sembunyikanSub && (
          // -mt-5 menetralkan gap nav, jadi saat tinggi 0 dropdown tidak memakan tempat dan menu di bawahnya
          // ikut turun/naik mengikuti tingginya (juga saat sidebar ringkas/melebar).
          // layout="position": saat induk berganti tinggi (pindah halaman masuk/keluar grup) submenu ikut meluncur
          // bersama menu lain, bukan melompat duluan
          <motion.div
            layout="position"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="-mt-5 w-full overflow-hidden"
          >
            <div className="flex flex-col gap-3 pt-3">
              {item.children.map((child) => (
                // Teks sama dengan menu utama; dot di kolom selebar ikon induk, jadi teksnya sejajar dengan label induk
                <NavLink
                  key={child.path}
                  to={child.path}
                  end
                  onClick={onClose}
                  className="group flex h-6 items-center gap-2 px-2 text-small font-semibold whitespace-nowrap text-grey-50 hover:text-white [&.active]:text-white"
                >
                  <span className="grid w-6 shrink-0 place-items-center">
                    <span className="size-1.5 rounded-full bg-grey-75 group-[.active]:bg-lime-300" />
                  </span>
                  {child.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// open/onClose = laci di layar kecil (di bawah lg); di layar besar sidebar selalu tampil,
// tetapRingkas = dipilih lewat tombol menu: di layar besar sidebar hanya logo + ikon dan melebar
// menutupi konten saat di-hover/difokus; laci di layar kecil tetap lebar penuh
function Sidebar({ user, onLogout, ringkas: tetapRingkas, open, onClose }) {
  const sections = getMenuForRole(user.role)
  const [hover, setHover] = useState(false)
  const ringkas = tetapRingkas && !hover
  // Class yang hanya berlaku saat ringkas; semuanya ber-prefix lg:. Posisi saat ringkas sengaja tidak
  // bergantung pada lebar sidebar (yang sedang beranimasi), supaya Motion tidak mengukur posisi sementara
  // dan ikon tidak memantul saat sidebar ditutup
  const rk = (cls) => (ringkas ? cls : '')
  const [menuOpen, setMenuOpen] = useState(false)
  const akunRef = useRef(null)

  // Kursor/fokus keluar sidebar: kalau sidebar-nya ikut mengecil, tombol Keluar ditutup juga
  // (kalau dikunci lebar lewat tombol menu, biarkan terbuka)
  function tutupHover() {
    setHover(false)
    if (tetapRingkas) setMenuOpen(false)
  }

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
    {/* Penahan tempat di layar besar, karena sidebar-nya fixed agar bisa melebar di atas konten */}
    <div aria-hidden className={`hidden shrink-0 transition-[width] duration-300 ease-out-quint lg:block ${tetapRingkas ? 'w-[88px]' : 'w-[242px]'}`} />
    <aside
      id="sidebar"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={tutupHover}
      onFocus={() => setHover(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && tutupHover()}
      className={`fixed inset-y-0 left-0 z-40 flex h-screen w-[242px] shrink-0 flex-col bg-grey-300 font-sans transition-[translate,visibility,width] duration-300 ease-out-quint lg:translate-x-0 lg:overflow-hidden ${ringkas ? 'lg:w-[88px]' : ''} ${tetapRingkas && hover ? 'lg:shadow-lg' : ''} ${
        open ? 'translate-x-0' : 'max-lg:invisible -translate-x-full'
      }`}
    >
      {/* Logo + nama aplikasi; rata kiri dan tidak menyusut, jadi saat sidebar melebar teksnya
          hanya tersingkap, tidak ikut bergeser. Logo sejajar dengan kolom ikon menu */}
      <div className="mt-7.5 flex h-12 items-center gap-2 pl-6.5">
        <img src={logo} alt="Logo Kota Bogor" className="size-[35px] shrink-0 object-cover" />
        <span className={`flex h-[33px] w-0 items-center justify-center ${rk('lg:hidden')}`}>
          <img src={logoLine} alt="" width={33} height={1} className="max-w-none rotate-90" />
        </span>
        <div className={`flex w-[155px] shrink-0 flex-col gap-2 text-grey-50 ${rk('lg:hidden')}`}>
          <p className="text-small font-bold">Sistem Manajemen EPSS</p>
          <p className="text-caption font-light">Diskominfo Kota Bogor</p>
        </div>
      </div>

      {/* Menu navigasi; reducedMotion="user" mematikan animasi jika user memilih "kurangi animasi" di OS */}
      <MotionConfig transition={bubbleTransition} reducedMotion="user">
        <nav className="mt-15 ml-6 flex w-[194px] flex-col items-start gap-5">
          {sections.map((section, index) => (
            <Fragment key={section.title}>
              {index > 0 && <motion.img layout="position" src={divider} alt="" width={192} height={1} className={rk('lg:w-10')} />}
              {/* invisible, bukan sr-only: judul tetap memakan tempat, jadi menu di bawahnya tidak bergeser saat melebar */}
              <SectionTitle className={rk('lg:invisible')}>{section.title}</SectionTitle>
              {section.items.map((item) =>
                item.children ? (
                  // ringkas juga true di layar kecil (tidak ada hover), jadi submenu tetap tampil selama laci terbuka
                  <MenuGroup key={item.label} item={item} ringkas={ringkas} sembunyikanSub={ringkas && !open} rk={rk} onClose={onClose} />
                ) : (
                <MotionNavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  title={ringkas ? item.label : undefined}
                  layout="position"
                  // NavLink otomatis memberi class "active" pada menu halaman saat ini
                  className={`relative flex h-6 w-[196px] shrink-0 items-center px-2 text-small font-semibold whitespace-nowrap text-grey-50 hover:text-white [&.active]:h-[50px] ${rk('lg:w-10')}`}
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
                ),
              )}
            </Fragment>
          ))}
        </nav>

        {/* Profil user; klik untuk membuka tombol Keluar */}
        <div
          ref={akunRef}
          className={`relative mt-auto mb-8.5 ml-5 w-[196px] transition-[margin] duration-300 ease-out-quint ${rk('lg:ml-2.5')}`}
        >
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
            className="flex w-full items-center rounded-sm px-2 text-left"
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
