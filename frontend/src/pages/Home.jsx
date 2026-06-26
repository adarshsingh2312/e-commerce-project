import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import API from '../services/api';
import ProductCard from '../components/ProductCard';
import { Loader } from '../components/RouteGuards';

export const Home = () => {
  const [products, setProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 8;

  const fetchHomeData = async () => {
    setLoading(true);
    setError('');
    try {
      // 1. Fetch paginated products for the bottom grid
      const paginatedRes = await API.get('/api/products', {
        params: { pageNumber: page, pageSize }
      });
      setProducts(paginatedRes.data?.content || []);
      setTotalPages(paginatedRes.data?.totalPages || 0);

      // 2. Fetch all products to carve out trending/new collections
      const allRes = await API.get('/api/products', {
        params: { pageSize: 50 }
      });
      const allProducts = allRes.data?.content || [];

      // Sort and partition products
      // Trending: items with high ratings/discount
      const trending = [...allProducts]
        .sort((a, b) => (b.discountedPercent || 0) - (a.discountedPercent || 0))
        .slice(0, 4);
      setTrendingProducts(trending);

      // New Arrivals: items created latest
      const arrivals = [...allProducts]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 4);
      setNewArrivals(arrivals);

    } catch (err) {
      console.error('Failed to load home page products:', err);
      setError('Could not connect to eMart catalog. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
  }, [page]);

  if (loading && products.length === 0) {
    return <Loader />;
  }

  return (
    <div className="w-full bg-white pb-16">
      {/* Hero Banner Section */}
      <section className="relative h-[80vh] w-full overflow-hidden bg-brand-primary">
        {/* Background Image */}
        <div className="absolute inset-0 bg-cover bg-center opacity-75 transform scale-105 transition-transform duration-[10000ms] hover:scale-100" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1600')`
        }}></div>
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
        {/* Hero Content */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 md:px-8 flex flex-col justify-center text-white z-10">
          <div className="max-w-xl space-y-6">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-brand-accent flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Season Sale
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight tracking-wide text-white uppercase drop-shadow-md">
              Elevate <br />Your Style
            </h1>
            <p className="text-sm md:text-base text-gray-200 tracking-wide font-light max-w-md">
              Discover timeless aesthetics, curated silhouettes, and premium fabrics engineered for modern life.
            </p>
            <div className="pt-4 flex gap-4">
              <Link
                to="/shop"
                className="bg-brand-accent hover:bg-brand-accent-dark text-white text-xs uppercase tracking-widest font-bold px-8 py-4 transition-all duration-300 shadow-lg rounded-sm hover:-translate-y-0.5"
              >
                Shop Now
              </Link>
              <Link
                to="/shop?gender=women"
                className="bg-white/10 hover:bg-white/20 text-white text-xs uppercase tracking-widest font-bold px-8 py-4 border border-white/30 transition-all duration-300 rounded-sm hover:-translate-y-0.5 backdrop-blur-xs"
              >
                View Lookbook
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Error State */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-12">
          <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 rounded-sm">
            <div>
              <p className="font-bold uppercase tracking-wider text-xs">Catalog Connection Offline</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={fetchHomeData}
              className="flex items-center gap-2 bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-brand-light transition-colors rounded-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* Category Quick Links Row */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Women */}
          <Link to="/shop?gender=women" className="group relative h-80 overflow-hidden bg-gray-100 rounded-sm">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600')`
            }}></div>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-300"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <h3 className="font-serif text-2xl font-bold uppercase tracking-wide">Women</h3>
              <p className="text-[10px] tracking-widest uppercase font-semibold text-brand-accent mt-1 flex items-center gap-1.5">
                Explore Collection <ArrowRight className="w-3 h-3 group-hover:translate-x-1.5 transition-transform" />
              </p>
            </div>
          </Link>

          {/* Men */}
          <Link to="/shop?gender=men" className="group relative h-80 overflow-hidden bg-gray-100 rounded-sm">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600')`
            }}></div>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-300"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <h3 className="font-serif text-2xl font-bold uppercase tracking-wide">Men</h3>
              <p className="text-[10px] tracking-widest uppercase font-semibold text-brand-accent mt-1 flex items-center gap-1.5">
                Explore Collection <ArrowRight className="w-3 h-3 group-hover:translate-x-1.5 transition-transform" />
              </p>
            </div>
          </Link>

          {/* Accessories */}
          <Link to="/shop?category=accessories" className="group relative h-80 overflow-hidden bg-gray-100 rounded-sm">
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105" style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600')`
            }}></div>
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors duration-300"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
              <h3 className="font-serif text-2xl font-bold uppercase tracking-wide">Accessories</h3>
              <p className="text-[10px] tracking-widest uppercase font-semibold text-brand-accent mt-1 flex items-center gap-1.5">
                Explore Collection <ArrowRight className="w-3 h-3 group-hover:translate-x-1.5 transition-transform" />
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Trending Section */}
      {trendingProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 border-t border-gray-50">
          <div className="flex flex-col items-center mb-10">
            <h2 className="font-serif text-3xl font-bold uppercase tracking-wider text-brand-primary">
              Trending Pieces
            </h2>
            <p className="text-xs text-brand-accent tracking-[0.2em] font-semibold uppercase mt-2">
              Popular designs chosen by our stylists
            </p>
            <div className="w-12 h-0.5 bg-brand-accent mt-4"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {trendingProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 border-t border-gray-50">
          <div className="flex flex-col items-center mb-10">
            <h2 className="font-serif text-3xl font-bold uppercase tracking-wider text-brand-primary">
              New Arrivals
            </h2>
            <p className="text-xs text-brand-accent tracking-[0.2em] font-semibold uppercase mt-2">
              Hot off the press styles for this season
            </p>
            <div className="w-12 h-0.5 bg-brand-accent mt-4"></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {newArrivals.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Full Catalog Section */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 border-t border-gray-50">
          <div className="flex flex-col items-center mb-10">
            <h2 className="font-serif text-3xl font-bold uppercase tracking-wider text-brand-primary">
              Browse All
            </h2>
            <p className="text-xs text-brand-accent tracking-[0.2em] font-semibold uppercase mt-2">
              Our complete catalog selection
            </p>
            <div className="w-12 h-0.5 bg-brand-accent mt-4"></div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-4 py-2 border border-gray-200 text-xs font-bold uppercase tracking-wider hover:bg-brand-primary hover:text-white hover:border-brand-primary disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-brand-primary disabled:hover:border-gray-200 rounded-sm transition-colors duration-200"
              >
                Previous
              </button>
              <span className="text-xs tracking-wider font-semibold text-gray-500 px-4">
                Page {page + 1} of {totalPages}
              </span>
              <button
                disabled={page === totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="px-4 py-2 border border-gray-200 text-xs font-bold uppercase tracking-wider hover:bg-brand-primary hover:text-white hover:border-brand-primary disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-brand-primary disabled:hover:border-gray-200 rounded-sm transition-colors duration-200"
              >
                Next
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Home;
