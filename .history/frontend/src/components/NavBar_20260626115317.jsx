import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { getProductsPath } from '../utils/catalog'

const navigationData = {
  categories: [
    {
      id: 'Male',
      name: 'Men',
      sections: [
        {
          id: 'Clothing',
          name: 'Clothing',
          items: [
            { name: 'Shirt', id: 'shirt' },
            { name: 'Jeans', id: 'jeans' },
            { name: 'Kurta', id: 'kurta' }
          ]
        },
        {
          id: 'Footwear',
          name: 'Footwear',
          items: [
            { name: 'Shoes', id: 'shoes' },
            { name: 'Sneakers', id: 'sneakers' }
          ]
        }
      ]
    },
    {
      id: 'Female',
      name: 'Women',
      sections: [
        {
          id: 'Clothing',
          name: 'Clothing',
          items: [
            { name: 'Saree', id: 'saree' },
            { name: 'Lehenga Choli', id: 'lehenga_choli' },
            { name: 'Gowns', id: 'gowns' },
            { name: 'Top Wear', id: 'top_wear' },
            { name: 'Bottom Wear', id: 'bottom_wear' }
          ]
        }
      ]
    }
  ]
};

const genderMap = {
  Male: 'MEN',
  Female: 'WOMEN'
}

export default function NavBar() {
  const { user, logout, isAuthenticated } = useContext(AuthContext)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  const authActive = isLoggedIn || isAuthenticated()
  const userLabel = user?.email ? user.email.split('@')[0] : 'Profile'

  const handleSearch = (event) => {
    event.preventDefault()
    const term = searchTerm.trim()
    if (!term) return
    navigate(`/products?search=${encodeURIComponent(term)}`)
  }

  const buildPath = (categoryId, itemName = '') => {
    const gender = genderMap[categoryId] || ''
    return getProductsPath(gender, itemName)
  }

  const handleLogout = () => {
    if (isLoggedIn) {
      setIsLoggedIn(false)
    } else {
      logout()
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
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
              onClick={() => setMobileOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 lg:hidden"
            >
              Menu <span className="text-lg">{mobileOpen ? '×' : '☰'}</span>
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <form onSubmit={handleSearch} className="relative">
              <label htmlFor="nav-search" className="sr-only">Search products</label>
              <input
                id="nav-search"
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search for products, brands, or categories"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-4 pr-28 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 flex h-10 -translate-y-1/2 items-center justify-center rounded-xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-900"
              >
                Search
              </button>
            </form>
          </div>

          <div className="hidden items-center justify-end gap-3 lg:flex">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              <span className="text-lg">🛒</span>
              Cart
            </button>
            {authActive ? (
              <>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                >
                  <span>👤</span>
                  <span>{userLabel}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-900 transition hover:text-red-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-gray-900 transition hover:text-red-600"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className={`mt-4 rounded-3xl border border-gray-200 bg-slate-50 p-4 shadow-sm lg:hidden ${mobileOpen ? 'block' : 'hidden'}`}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                <span className="text-lg">🛒</span>
                Cart
              </button>
            </div>
            <div className="border-t border-gray-200 pt-4">
              {authActive ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                  >
                    👤 {userLabel}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout()
                      setMobileOpen(false)
                    }}
                    className="mt-3 w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            {navigationData.categories.map((category) => (
              <div key={category.id} className="group relative">
                <Link
                  to={buildPath(category.id)}
                  className="inline-flex items-center rounded-full px-4 py-2 font-medium text-gray-700 transition hover:bg-white hover:text-red-600"
                >
                  {category.name}
                </Link>
                <div className="invisible absolute left-0 top-full z-30 mt-2 hidden min-w-[20rem] overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-lg transition group-hover:block lg:min-w-[24rem]">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {category.sections.map((section) => (
                      <div key={section.id}>
                        <p className="text-sm font-semibold text-gray-900">{section.name}</p>
                        <div className="mt-3 space-y-2">
                          {section.items.map((item) => (
                            <Link
                              key={item.id}
                              to={buildPath(category.id, item.name)}
                              className="block rounded-xl px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-red-600"
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
