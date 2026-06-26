import React from 'react'
import { Link } from 'react-router-dom'
import { getProductsPath } from '../utils/catalog'

const CATEGORY_LINKS = [
  { label: 'Men', path: getProductsPath('MEN') },
  { label: 'Women', path: getProductsPath('WOMEN') },
  { label: 'Kids', path: getProductsPath('', 'Kids') },
  { label: 'Home & Living', path: getProductsPath('', 'Home & Living') },
  { label: 'Beauty', path: getProductsPath('', 'Beauty') },
]

export default function CategoryMenu() {
  return (
    <div className="border-t border-gray-200 bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 overflow-x-auto px-4 py-2 text-sm sm:px-6 lg:px-8">
        {CATEGORY_LINKS.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-white hover:text-red-600"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
