import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProductById } from '../services/productService'
import { GENDER_LABELS } from '../utils/catalog'
import { formatCurrency, getPricing } from '../utils/pricing'

const buildLegacyBreadcrumb = (category) => {
  const crumbs = []
  let current = category

  while (current) {
    if (current.name) crumbs.unshift(current.name)
    current = current.parentCategory
  }

  return crumbs
}

const buildBreadcrumb = (product) => {
  if (!product) return []

  const normalizedCrumbs = [
    GENDER_LABELS[product.gender] || product.gender,
    product.productCategory,
    product.subCategory
  ].filter(Boolean)

  return normalizedCrumbs.length > 0 ? normalizedCrumbs : buildLegacyBreadcrumb(product.category)
}

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    const loadProduct = async () => {
      setLoading(true)
      setError('')
      setProduct(null)
      setSelectedSize('')
      setQuantity(1)

      try {
        const response = await getProductById(id)
        if (!ignore) {
          setProduct(response.data)
        }
      } catch (err) {
        if (!ignore) {
          const status = err?.response?.status
          const message =
            status === 404
              ? 'Product not found.'
              : err?.response?.data?.message || err.message || 'Unable to load product.'
          setError(message)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    loadProduct()

    return () => {
      ignore = true
    }
  }, [id])

  const sizes = useMemo(() => Array.from(product?.sizes || []), [product])
  const breadcrumb = useMemo(() => buildBreadcrumb(product), [product])
  const pricing = useMemo(() => getPricing(product), [product])

  useEffect(() => {
    if (!selectedSize && sizes.length > 0) {
      setSelectedSize(sizes[0].name)
    }
  }, [selectedSize, sizes])

  const handleAddToCart = () => {
    console.log('Add to cart', {
      productId: product.id,
      size: selectedSize,
      quantity
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse rounded-2xl bg-gray-200" />
          <div className="space-y-6">
            <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
            <div className="space-y-3">
              <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-24 animate-pulse rounded bg-gray-200" />
            <div className="h-12 w-56 animate-pulse rounded bg-gray-200" />
            <div className="h-12 w-full animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-xl font-semibold text-red-800">Unable to load product</p>
          <p className="mt-3 text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {breadcrumb.length > 0 && (
          <nav className="mb-6 text-sm font-medium text-gray-500">
            {breadcrumb.map((crumb, index) => (
              <span key={`${crumb}-${index}`}>
                <span className={index === breadcrumb.length - 1 ? 'text-gray-900' : ''}>{crumb}</span>
                {index < breadcrumb.length - 1 && <span className="mx-2 text-gray-300">/</span>}
              </span>
            ))}
          </nav>
        )}

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>

          <section className="flex flex-col">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                {product.brand || 'Emart'}
              </p>
              <h1 className="mt-2 text-3xl font-bold text-gray-950 sm:text-4xl">
                {product.title}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-bold text-emerald-600">
                  {formatCurrency(pricing.discountedPrice)}
                </span>
                {pricing.hasDiscount && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatCurrency(pricing.originalPrice)}
                  </span>
                )}
                {pricing.discountPercent > 0 && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700">
                    {pricing.discountPercent}% off
                  </span>
                )}
              </div>

              <p className="mt-6 leading-7 text-gray-700">
                {product.description || 'No description available for this product.'}
              </p>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-8">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Size</h2>
                  {selectedSize && <span className="text-sm text-gray-500">Selected: {selectedSize}</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizes.length > 0 ? (
                    sizes.map((size) => {
                      const isSelected = selectedSize === size.name
                      const isOutOfStock = size.qty <= 0

                      return (
                        <button
                          key={size.name}
                          type="button"
                          onClick={() => setSelectedSize(size.name)}
                          disabled={isOutOfStock}
                          className={`min-w-14 rounded-lg border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                            isSelected
                              ? 'border-black bg-black text-white'
                              : 'border-gray-300 bg-white text-gray-900 hover:border-gray-900'
                          }`}
                        >
                          {size.name}
                        </button>
                      )
                    })
                  ) : (
                    <p className="text-sm text-gray-500">No sizes available.</p>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Quantity</h2>
                <div className="mt-3 inline-flex items-center rounded-lg border border-gray-300 bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="h-11 w-11 text-xl font-semibold text-gray-700 transition hover:bg-gray-100"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-gray-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.min(product.quantity || 1, current + 1))}
                    className="h-11 w-11 text-xl font-semibold text-gray-700 transition hover:bg-gray-100"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-500">{product.quantity} in stock</p>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={sizes.length > 0 && !selectedSize}
                className="mt-8 w-full rounded-lg bg-black px-6 py-3 text-base font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add to Cart
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}