import { Fragment, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, MotionConfig } from 'motion/react'
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
  return <Icon size={24} className="shrink-0 text-on-dark" />
}

// Tinggi menu aktif (50px) beda dengan menu biasa (24px); layout="position" membuat
// elemen yang posisinya bergeser ikut beranimasi, bukan melompat
const MotionNavLink = motion.create(NavLink)

const bubbleTransition = { type: 'spring', stiffness: 500, damping: 38 }

function SectionTitle({ children }) {
  return (
    <motion.p layout="position" className="text-[13px] leading-[1.2] font-light text-white">
      {children}
    </motion.p>
  )
}

function Sidebar({ user, onLogout }) {
  const sections = getMenuForRole(user.role)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <aside className="sticky top-0 flex h-screen w-[242px] shrink-0 flex-col bg-grey-300 font-sans">
      {/* Logo + nama aplikasi */}
      <div className="mt-[30px] flex h-12 items-center justify-center gap-[7px]">
        <img src={logo} alt="Logo Kota Bogor" className="size-[35px] object-cover" />
        <span className="flex h-[33px] w-0 items-center justify-center">
          <img src={logoLine} alt="" width={33} height={1} className="max-w-none rotate-90" />
        </span>
        <div className="flex w-[155px] flex-col gap-[7px] leading-[1.2] text-on-dark">
          <p className="text-[13px] font-bold">Sistem Manajemen EPPS</p>
          <p className="text-[10px] font-light">Diskominfo Kota Bogor</p>
        </div>
      </div>

      {/* Menu navigasi; reducedMotion="user" mematikan animasi jika user memilih "kurangi animasi" di OS */}
      <MotionConfig transition={bubbleTransition} reducedMotion="user">
        <nav className="mt-[60px] ml-[23px] flex w-[194px] flex-col items-start gap-[21px]">
          {sections.map((section, index) => (
            <Fragment key={section.title}>
              {index > 0 && <motion.img layout="position" src={divider} alt="" width={192} height={1} />}
              <SectionTitle>{section.title}</SectionTitle>
              {section.items.map((item) => (
                <MotionNavLink
                  key={item.path}
                  to={item.path}
                  layout="position"
                  // NavLink otomatis memberi class "active" pada menu halaman saat ini
                  className="relative flex h-6 w-[196px] shrink-0 items-center px-[7px] text-[13px] leading-[1.2] font-semibold whitespace-nowrap text-on-dark hover:text-white [&.active]:h-[50px]"
                >
                  {({ isActive }) => (
                    <>
                      {/* Satu bubble dengan layoutId yang sama, jadi Motion menganimasikannya pindah antar menu */}
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active-bubble"
                          className="absolute inset-0 bg-nav-active"
                          style={{ borderRadius: 10 }}
                        />
                      )}
                      <motion.span layout="position" className="relative flex items-center gap-[7px]">
                        <MenuIcon icon={item.icon} />
                        {item.label}
                      </motion.span>
                    </>
                  )}
                </MotionNavLink>
              ))}
            </Fragment>
          ))}
        </nav>
      </MotionConfig>

      {/* Profil user; klik untuk membuka tombol Keluar */}
      <div className="relative mt-auto mb-[34px] ml-[19px] w-[196px]">
        {menuOpen && (
          <button
            type="button"
            onClick={onLogout}
            className="absolute bottom-full mb-2 w-full rounded-[10px] bg-nav-active px-[14px] py-3 text-left text-[13px] font-semibold text-on-dark"
          >
            Keluar
          </button>
        )}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label="Menu akun"
          className="flex w-full items-center rounded-[10px] px-[7px] text-left"
        >
          <span className="flex items-center gap-[7px]">
            <img src={accountIcon} alt="" width={53} height={53} className="shrink-0" />
            <span className="flex flex-col gap-[7px] text-[13px] leading-[1.2] whitespace-nowrap text-on-dark">
              <span className="font-semibold">{user.name}</span>
              <span className="font-light">{ROLE_LABELS[user.role]}</span>
            </span>
          </span>
          <img
            src={arrowDownIcon}
            alt=""
            width={24}
            height={24}
            className={`ml-auto shrink-0 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
