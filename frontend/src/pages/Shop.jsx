import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, Trash2, ArrowUpDown } from 'lucide-react';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import { Loader } from '../components/RouteGuards';
import { formatPrice } from '../utils/formatPrice';

const AVAILABLE_COLORS = ['Black', 'White', 'Blue', 'Red', 'Green', 'Grey', 'Beige', 'Pink', 'Yellow', 'Brown', 'Navy'];
const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // All products fetched from the database
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sidebar open for mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Active filters derived from URL searchParams
  const gender = searchParams.get('gender') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = parseInt(searchParams.get('page') || '0', 10);
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const searchQuery = searchParams.get('search') || '';
  const colors = searchParams.getAll('colors');
  const sizes = searchParams.getAll('sizes');

  // Input states for price range
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  const pageSize = 12;

  // Fetch all products once on mount (or if searchParams triggers re-fetch, keep it clean)
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        // Fetch all products (e.g. 1000 items) to enable client-side high-fidelity multi-faceted filtering
        const response = await API.get('/api/products', {
          params: { pageSize: 1000 }
        });
        setAllProducts(response.data?.content || []);
      } catch (err) {
        console.error('Failed to load shop catalog:', err);
        setError('Could not retrieve product catalog. Check connection to API.');
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  // Sync inputs with URL changes
  useEffect(() => {
    setMinPriceInput(minPrice);
    setMaxPriceInput(maxPrice);
  }, [minPrice, maxPrice]);

  // Helper to extract gender from a product
  const getProductGender = (product) => {
    let cat = product?.category;
    while (cat && cat.parentCategory) {
      cat = cat.parentCategory;
    }
    return cat?.name || ''; // Should return 'Male' or 'Female'
  };

  // Process all filtering, sorting, and pagination on client side
  const { paginatedProducts, totalElements, totalPages } = useMemo(() => {
    let items = [...allProducts];

    // 1. Search Query Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.brand?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      );
    }

    // 2. Gender Filter (Men -> Male, Women -> Female)
    if (gender) {
      const targetGender = gender.toLowerCase() === 'men' ? 'male' : 'female';
      items = items.filter(
        (item) => getProductGender(item).toLowerCase() === targetGender
      );
    }

    // 3. Category Filter (Clothing, Shoes, Accessories, etc.)
    if (category) {
      const catLower = category.toLowerCase();
      items = items.filter((item) => {
        const l3 = item.category?.name?.toLowerCase() || '';
        const l2 = item.category?.parentCategory?.name?.toLowerCase() || '';
        const l1 = item.category?.parentCategory?.parentCategory?.name?.toLowerCase() || '';

        return (
          l3 === catLower ||
          l2 === catLower ||
          l1 === catLower ||
          (catLower === 'shoes' && l2 === 'footwear') ||
          (catLower === 'footwear' && l2 === 'footwear')
        );
      });
    }

    // 4. Colors Filter
    if (colors.length > 0) {
      const colorsLower = colors.map((c) => c.toLowerCase());
      items = items.filter((item) =>
        colorsLower.includes(item.colour?.toLowerCase())
      );
    }

    // 5. Sizes Filter
    if (sizes.length > 0) {
      items = items.filter((item) => {
        const itemSizes = Array.from(item.sizes || []);
        return itemSizes.some((sz) => sizes.includes(sz.name) && sz.qty > 0);
      });
    }

    // 6. Price range filter
    if (minPrice) {
      items = items.filter(
        (item) => (item.discountedPrice || item.price) >= parseInt(minPrice, 10)
      );
    }
    if (maxPrice) {
      items = items.filter(
        (item) => (item.discountedPrice || item.price) <= parseInt(maxPrice, 10)
      );
    }

    // 7. Sorting
    if (sort === 'price_low') {
      items.sort((a, b) => (a.discountedPrice || a.price) - (b.discountedPrice || b.price));
    } else if (sort === 'price_high') {
      items.sort((a, b) => (b.discountedPrice || b.price) - (a.discountedPrice || a.price));
    } else {
      // Default: Latest products (newer id or createdAt first)
      items.sort((a, b) => b.id - a.id);
    }

    // 8. Pagination calculation
    const totalCount = items.length;
    const pagesCount = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = page * pageSize;
    const paginated = items.slice(startIndex, startIndex + pageSize);

    return {
      paginatedProducts: paginated,
      totalElements: totalCount,
      totalPages: pagesCount
    };
  }, [allProducts, searchQuery, gender, category, colors, sizes, minPrice, maxPrice, sort, page]);

  // Helper to update specific param in URL search query
  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '0'); // Reset page when query changes

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  // Helper to toggle checkbox array param in URL (e.g. colors, sizes)
  const toggleArrayParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '0');

    const currentValues = params.getAll(key);
    if (currentValues.includes(value)) {
      const updated = currentValues.filter((v) => v !== value);
      params.delete(key);
      updated.forEach((v) => params.append(key, v));
    } else {
      params.append(key, value);
    }
    setSearchParams(params);
  };

  const handlePriceSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set('page', '0');

    if (minPriceInput) params.set('minPrice', minPriceInput);
    else params.delete('minPrice');

    if (maxPriceInput) params.set('maxPrice', maxPriceInput);
    else params.delete('maxPrice');

    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setMinPriceInput('');
    setMaxPriceInput('');
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 min-h-screen">
      {/* Title Header */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-serif text-3xl md:text-4xl font-bold uppercase tracking-wider text-brand-primary">
          {gender ? `${gender}'s` : searchQuery ? `Search: "${searchQuery}"` : 'Shop All'}{' '}
          {category ? ` - ${category}` : ''}
        </h1>
        <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest font-semibold">
          Showing {totalElements} items matching your selection
        </p>
      </div>

      {/* Filter Options Bar */}
      <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-sm p-4 mb-8">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden flex items-center gap-2 text-xs uppercase tracking-wider font-bold text-brand-primary hover:text-brand-accent transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase">
          <SlidersHorizontal className="w-3.5 h-3.5 text-brand-accent" /> Filters active
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">Sort By:</span>
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="text-xs font-bold uppercase tracking-wider text-gray-700 bg-transparent border-none focus:ring-0 focus:outline-none cursor-pointer"
          >
            <option value="latest">Newest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Active Chips */}
      {(gender || category || colors.length > 0 || sizes.length > 0 || minPrice || maxPrice || searchQuery) && (
        <div className="flex flex-wrap gap-2 items-center mb-8">
          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mr-2">Active filters:</span>
          {gender && (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-brand-primary text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              Gender: {gender}
              <button onClick={() => updateParam('gender', '')} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-brand-primary text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              Category: {category}
              <button onClick={() => updateParam('category', '')} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-brand-primary text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              Search: {searchQuery}
              <button onClick={() => updateParam('search', '')} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
            </span>
          )}
          {colors.map((col) => (
            <span key={col} className="inline-flex items-center gap-1.5 bg-gray-100 text-brand-primary text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              Color: {col}
              <button onClick={() => toggleArrayParam('colors', col)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
            </span>
          ))}
          {sizes.map((sz) => (
            <span key={sz} className="inline-flex items-center gap-1.5 bg-gray-100 text-brand-primary text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              Size: {sz}
              <button onClick={() => toggleArrayParam('sizes', sz)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
            </span>
          ))}
          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-brand-primary text-xs px-3 py-1 rounded-full uppercase tracking-wider font-semibold">
              Price: {formatPrice(minPrice || 0)} - {maxPrice ? formatPrice(maxPrice) : '∞'}
              <button onClick={() => { updateParam('minPrice', ''); updateParam('maxPrice', ''); }} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3" /></button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs font-bold text-brand-accent hover:text-brand-accent-dark flex items-center gap-1 uppercase tracking-wider ml-auto py-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        </div>
      )}

      {/* Grid Layout */}
      <div className="flex gap-10">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
          {/* Gender Filter */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-brand-primary border-b border-gray-100 pb-2">Gender</h3>
            <div className="space-y-2">
              {['women', 'men'].map((gen) => (
                <label key={gen} className="flex items-center gap-2.5 text-sm text-gray-700 capitalize cursor-pointer hover:text-brand-accent transition-colors font-medium">
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === gen}
                    onChange={() => updateParam('gender', gender === gen ? '' : gen)}
                    className="w-4 h-4 text-brand-accent border-gray-300 focus:ring-brand-accent accent-brand-accent cursor-pointer"
                  />
                  {gen}
                </label>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-brand-primary border-b border-gray-100 pb-2">Categories</h3>
            <div className="space-y-2">
              {['clothing', 'shoes', 'accessories'].map((cat) => (
                <label key={cat} className="flex items-center gap-2.5 text-sm text-gray-700 capitalize cursor-pointer hover:text-brand-accent transition-colors font-medium">
                  <input
                    type="radio"
                    name="category"
                    checked={category === cat}
                    onChange={() => updateParam('category', category === cat ? '' : cat)}
                    className="w-4 h-4 text-brand-accent border-gray-300 focus:ring-brand-accent accent-brand-accent cursor-pointer"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-brand-primary border-b border-gray-100 pb-2">Colors</h3>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
              {AVAILABLE_COLORS.map((col) => (
                <label key={col} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:text-brand-accent transition-colors font-medium">
                  <input
                    type="checkbox"
                    checked={colors.includes(col)}
                    onChange={() => toggleArrayParam('colors', col)}
                    className="w-3.5 h-3.5 rounded-sm text-brand-accent border-gray-300 focus:ring-brand-accent accent-brand-accent cursor-pointer"
                  />
                  {col}
                </label>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-brand-primary border-b border-gray-100 pb-2">Sizes</h3>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SIZES.map((sz) => {
                const isActive = sizes.includes(sz);
                return (
                  <button
                    key={sz}
                    onClick={() => toggleArrayParam('sizes', sz)}
                    className={`w-9 h-9 border text-xs font-bold uppercase transition-all duration-200 rounded-sm flex items-center justify-center ${isActive
                        ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                        : 'border-gray-200 text-gray-700 hover:border-brand-primary'
                      }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-bold tracking-wider text-brand-primary border-b border-gray-100 pb-2">Price Range</h3>
            <form onSubmit={handlePriceSubmit} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-brand-accent"
                />
                <span className="text-gray-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-brand-accent"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-primary hover:bg-brand-light text-white text-[10px] uppercase tracking-widest font-bold py-2 rounded-sm transition-colors"
              >
                Apply Price
              </button>
            </form>
          </div>
        </aside>

        {/* Product Grid Panel */}
        <div className="flex-grow">
          {loading ? (
            <Loader />
          ) : error ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-sm text-center">
              <p className="font-bold uppercase tracking-wider text-xs">Failed to Fetch Catalog</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-250 rounded-sm">
              <p className="font-serif text-lg text-gray-500">No products found matching your selection.</p>
              <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest">Try adjusting or clearing your filters.</p>
              <button
                onClick={clearAllFilters}
                className="mt-6 inline-block bg-brand-primary hover:bg-brand-light text-white text-xs uppercase tracking-widest font-bold px-6 py-3 transition-colors rounded-sm"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
                {paginatedProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 gap-2 border-t border-gray-100 pt-8">
                  <button
                    disabled={page === 0}
                    onClick={() => handlePageChange(page - 1)}
                    className="px-4 py-2 border border-gray-200 text-xs font-bold uppercase tracking-wider hover:bg-brand-primary hover:text-white hover:border-brand-primary disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-brand-primary disabled:hover:border-gray-200 rounded-sm transition-colors duration-200"
                  >
                    Previous
                  </button>
                  <span className="text-xs tracking-wider font-semibold text-gray-500 px-4">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    disabled={page === totalPages - 1}
                    onClick={() => handlePageChange(page + 1)}
                    className="px-4 py-2 border border-gray-200 text-xs font-bold uppercase tracking-wider hover:bg-brand-primary hover:text-white hover:border-brand-primary disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-brand-primary disabled:hover:border-gray-200 rounded-sm transition-colors duration-200"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Drawer filter panel */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/55 backdrop-blur-xs"></div>
          <div className="relative w-80 max-w-xs bg-white h-full flex flex-col p-6 overflow-y-auto shadow-2xl ml-auto z-10">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <h2 className="font-serif text-xl font-bold uppercase tracking-wider text-brand-primary">Filters</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-1 text-gray-400 hover:text-brand-primary">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Gender */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold tracking-wider text-brand-primary">Gender</h3>
                <div className="space-y-2">
                  {['women', 'men'].map((gen) => (
                    <label key={gen} className="flex items-center gap-2.5 text-sm text-gray-700 capitalize cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="gender-mobile"
                        checked={gender === gen}
                        onChange={() => { updateParam('gender', gender === gen ? '' : gen); setSidebarOpen(false); }}
                        className="w-4 h-4 text-brand-accent focus:ring-brand-accent accent-brand-accent"
                      />
                      {gen}
                    </label>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold tracking-wider text-brand-primary">Categories</h3>
                <div className="space-y-2">
                  {['clothing', 'shoes', 'accessories'].map((cat) => (
                    <label key={cat} className="flex items-center gap-2.5 text-sm text-gray-700 capitalize cursor-pointer font-medium">
                      <input
                        type="radio"
                        name="category-mobile"
                        checked={category === cat}
                        onChange={() => { updateParam('category', category === cat ? '' : cat); setSidebarOpen(false); }}
                        className="w-4 h-4 text-brand-accent focus:ring-brand-accent accent-brand-accent"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold tracking-wider text-brand-primary">Colors</h3>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_COLORS.map((col) => (
                    <label key={col} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={colors.includes(col)}
                        onChange={() => toggleArrayParam('colors', col)}
                        className="w-3.5 h-3.5 text-brand-accent rounded-sm"
                      />
                      {col}
                    </label>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold tracking-wider text-brand-primary">Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SIZES.map((sz) => {
                    const isActive = sizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        onClick={() => toggleArrayParam('sizes', sz)}
                        className={`w-9 h-9 border text-xs font-bold uppercase rounded-sm flex items-center justify-center ${isActive
                            ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
                            : 'border-gray-200 text-gray-700'
                          }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h3 className="text-xs uppercase font-bold tracking-wider text-brand-primary">Price Range</h3>
                <form onSubmit={(e) => { handlePriceSubmit(e); setSidebarOpen(false); }} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-sm focus:outline-none"
                    />
                    <span className="text-gray-400 text-xs">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-sm focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-brand-primary text-white text-[10px] uppercase tracking-widest font-bold py-2.5 rounded-sm"
                  >
                    Apply Price
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;