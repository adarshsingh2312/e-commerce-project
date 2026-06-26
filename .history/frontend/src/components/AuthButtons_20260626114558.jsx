import React from 'react'
import { Link } from 'react-router-dom'

export default function AuthButtons({ isLoggedIn, userLabel, onLogout }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {isLoggedIn ? (
        <>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
          >
            <span>{userLabel || 'Profile'}</span>
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Logout
          </button>
        </>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}
