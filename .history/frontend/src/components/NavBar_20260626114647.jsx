import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import AuthButtons from './AuthButtons'
import SearchBar from './SearchBar'
import CategoryMenu from './CategoryMenu'

const TOP_NAV_LINKS = [
  { label: 'Men', to: '/products?gender=MEN' },
  { label: 'Women', to: '/products?gender=WOMEN' },
  { label: 'Kids', to: '/products?category=Kids' },
  { label: 'Home & Living', to: '/products?category=Home%20%26%20Living' },
  { label: 'Beauty', to: '/products?category=Beauty' },
]

export default function NavBar() {
  const { user, logout, isAuthenticated } = useContext(AuthContext)
  const [isLoggedIn] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const authState = isAuthenticated() || isLoggedIn
  const userLabel = user?.email ? user.email.split('@')[0] : 'Profile'

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/"
              className="text-2xl font-semibold tracking-tight text-gray-900 transition hover:text-red-600"
            >
              eMart
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 lg:hidden"
            >
              Menu
              <span className="text-lg">{mobileOpen ? '×' : '☰'}</span>
            </button>
          </div>

          <div className="flex-1 min-w-0 lg:mx-6">
            <SearchBar />
          </div>

          <div className="hidden min-w-[220px] items-center justify-end gap-3 lg:flex">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              <span className="text-lg">🛒</span>
              Cart
            </button>
            <AuthButtons isLoggedIn={authState} userLabel={userLabel} onLogout={handleLogout} />
          </div>
        </div>

        <div className={`mt-4 ${mobileOpen ? 'block' : 'hidden'} lg:hidden`}>
          <div className="space-y-4 rounded-3xl border border-gray-200 bg-slate-50 p-4">
            <button
              type="button"
              className="w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              <span className="inline-flex items-center gap-2">
                <span className="text-lg">🛒</span>
                Cart
              </span>
            </button>
            <AuthButtons isLoggedIn={authState} userLabel={userLabel} onLogout={handleLogout} />
          </div>
        </div>
      </div>

      <CategoryMenu />

      <div className="hidden bg-slate-50 border-t border-gray-200 lg:block">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            {TOP_NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="whitespace-nowrap rounded-full px-4 py-2 font-medium text-gray-700 transition hover:bg-white hover:text-red-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
