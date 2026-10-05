import { Fragment } from 'react'
import { NavLink } from 'react-router-dom'
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

function SectionTitle({ children }) {
  return <p className="text-[13px] leading-[1.2] font-light text-white">{children}</p>
}

function Sidebar({ user }) {
  const sections = getMenuForRole(user.role)

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

      {/* Menu navigasi */}
      <nav className="mt-[60px] ml-[23px] flex w-[194px] flex-col items-start gap-[21px]">
        {sections.map((section, index) => (
          <Fragment key={section.title}>
            {index > 0 && <img src={divider} alt="" width={192} height={1} />}
            <SectionTitle>{section.title}</SectionTitle>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex w-[196px] shrink-0 items-center gap-[7px] rounded-[10px] px-[7px] text-[13px] leading-[1.2] font-semibold whitespace-nowrap text-on-dark ${
                    isActive ? 'h-[50px] bg-nav-active' : 'hover:text-white'
                  }`
                }
              >
                <MenuIcon icon={item.icon} />
                {item.label}
              </NavLink>
            ))}
          </Fragment>
        ))}
      </nav>

      {/* Profil user */}
      <button
        type="button"
        className="mt-auto mb-[34px] ml-[19px] flex w-[196px] items-center rounded-[10px] px-[7px] text-left"
        aria-label="Menu akun"
      >
        <span className="flex items-center gap-[7px]">
          <img src={accountIcon} alt="" width={53} height={53} className="shrink-0" />
          <span className="flex flex-col gap-[7px] text-[13px] leading-[1.2] whitespace-nowrap text-on-dark">
            <span className="font-semibold">{user.name}</span>
            <span className="font-light">{ROLE_LABELS[user.role]}</span>
          </span>
        </span>
        <img src={arrowDownIcon} alt="" width={24} height={24} className="ml-auto shrink-0" />
      </button>
    </aside>
  )
}

export default Sidebar
