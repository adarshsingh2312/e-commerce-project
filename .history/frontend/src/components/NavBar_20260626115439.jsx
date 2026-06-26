import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { getProductsPath, SHOP_CATEGORIES } from '../utils/catalog'

const genderGroups = [
  { label: 'Men', value: 'MEN' },
  { label: 'Women', value: 'WOMEN' }
]

function DesktopDropdown({ group }) {
  return (
    <div className="group relative">
      <Link
        to={getProductsPath(group.value)}
        className="inline-flex h-16 items-center text-sm font-medium text-gray-800 transition hover:text-red-600"
      >
        {group.label}
      </Link>
      <div className="invisible absolute left-0 top-full z-30 w-56 translate-y-2 rounded-lg border border-gray-200 bg-white py-2 opacity-0 shadow-lg transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
        <Link
          to={getProductsPath(group.value)}
          className="block px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 hover:text-red-600"
        >
          All {group.label}
        </Link>
        {SHOP_CATEGORIES.map((category) => (
          <Link
            key={category}
            to={getProductsPath(group.value, category)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600"
          >
            {category}
          </Link>
        ))}
      </div>
    </div>
  )
}

function MobileAccordion({ group, expanded, onToggle, onNavigate }) {
  return (
    <div className="border-t border-gray-100">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-1 py-3 text-left text-sm font-semibold text-gray-900"
      >
        <span>{group.label}</span>
        <span className="text-lg leading-none">{expanded ? '-' : '+'}</span>
      </button>
      <div className={`grid transition-all duration-200 ${expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <Link
            to={getProductsPath(group.value)}
            onClick={onNavigate}
            className="block px-3 py-2 text-sm font-medium text-gray-800 hover:text-red-600"
          >
            All {group.label}
          </Link>
          {SHOP_CATEGORIES.map((category) => (
            <Link
              key={category}
              to={getProductsPath(group.value, category)}
              onClick={onNavigate}
              className="block px-3 py-2 text-sm text-gray-700 hover:text-red-600"
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function NavBar() {
  const { user, logout, isAuthenticated } = useContext(AuthContext)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [expandedGender, setExpandedGender] = useState('')

  const closeMobileMenu = () => {
    setMobileOpen(false)
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xl font-semibold">eMart</Link>
            <div className="hidden items-center gap-6 md:flex">
              <Link to="/" className="text-sm font-medium text-gray-800 transition hover:text-red-600">Home</Link>
              {genderGroups.map((group) => (
                <DesktopDropdown key={group.value} group={group} />
              ))}
            </div>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            {isAuthenticated() ? (
              <>
                <Link to="/profile" className="text-sm">{user?.email || 'Profile'}</Link>
                <button onClick={logout} className="text-sm text-red-600">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm">Login</Link>
                <Link to="/register" className="text-sm">Register</Link>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-800 md:hidden"
            aria-expanded={mobileOpen}
          >
            Menu
          </button>
        </div>
      </div>
      <div className={`border-t border-gray-100 bg-white md:hidden ${mobileOpen ? 'block' : 'hidden'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" onClick={closeMobileMenu} className="block px-1 py-3 text-sm font-medium text-gray-900">
            Home
          </Link>
          {genderGroups.map((group) => (
            <MobileAccordion
              key={group.value}
              group={group}
              expanded={expandedGender === group.value}
              onToggle={() => setExpandedGender((current) => (current === group.value ? '' : group.value))}
              onNavigate={closeMobileMenu}
            />
          ))}
          <div className="mt-2 border-t border-gray-100 pt-3">
            {isAuthenticated() ? (
              <>
                <Link to="/profile" onClick={closeMobileMenu} className="block px-1 py-2 text-sm text-gray-800">
                  {user?.email || 'Profile'}
                </Link>
                <button
                  onClick={() => {
                    closeMobileMenu()
                    logout()
                  }}
                  className="block px-1 py-2 text-sm text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={closeMobileMenu} className="block px-1 py-2 text-sm text-gray-800">Login</Link>
                <Link to="/register" onClick={closeMobileMenu} className="block px-1 py-2 text-sm text-gray-800">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
