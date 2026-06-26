import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Search, ChevronDown, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Header = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const cartItemCount = cart?.totalItems || 0;

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Utility Bar */}
      <div className="bg-brand-primary text-gray-300 text-xs py-2 px-4 md:px-8 flex justify-between items-center tracking-wide">
        <div>FREE STANDARD SHIPPING ON ORDERS OVER ₹499</div>
        <div className="flex gap-6 items-center">
          <Link to="/contact" className="hover:text-white transition-colors duration-200">Contact</Link>
          <span className="text-gray-600">|</span>
          <Link to="/about" className="hover:text-white transition-colors duration-200">Our Story</Link>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex flex-col items-start select-none">
          <span className="font-serif font-bold text-2xl tracking-widest text-brand-primary ">
            e-MART
          </span>
          <span className="text-[9px] tracking-[0.25em] text-brand-accent uppercase -mt-1 font-semibold">
            EST. 2026
          </span>
        </Link>

        {/* Center Links - Desktop */}
        <nav className="hidden lg:flex space-x-8 items-center h-full">
          <Link to="/" className="text-sm font-semibold tracking-wider text-brand-primary hover:text-brand-accent uppercase transition-colors duration-200">
            Home
          </Link>

          {/* Shop Dropdown */}
          <div className="relative group h-full flex items-center">
            <Link to="/shop" className="text-sm font-semibold tracking-wider text-brand-primary hover:text-brand-accent uppercase flex items-center gap-1 transition-colors duration-200">
              Shop <ChevronDown className="w-3.5 h-3.5" />
            </Link>
            <div className="absolute top-[80%] left-0 w-48 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:top-[100%] transition-all duration-300 py-3 rounded-sm z-50">
              <Link to="/shop" className="block px-5 py-2 text-xs uppercase tracking-wider font-semibold text-gray-700 hover:text-brand-accent hover:bg-gray-50 transition-colors">
                Shop All
              </Link>
              <Link to="/shop?gender=women" className="block px-5 py-2 text-xs uppercase tracking-wider font-semibold text-gray-700 hover:text-brand-accent hover:bg-gray-50 transition-colors">
                Women's Collection
              </Link>
              <Link to="/shop?gender=men" className="block px-5 py-2 text-xs uppercase tracking-wider font-semibold text-gray-700 hover:text-brand-accent hover:bg-gray-50 transition-colors">
                Men's Collection
              </Link>
            </div>
          </div>

          {/* Women Dropdown */}
          <div className="relative group h-full flex items-center">
            <Link to="/shop?gender=women" className="text-sm font-semibold tracking-wider text-brand-primary hover:text-brand-accent uppercase flex items-center gap-1 transition-colors duration-200">
              Women <ChevronDown className="w-3.5 h-3.5" />
            </Link>
            <div className="absolute top-[80%] left-0 w-48 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:top-[100%] transition-all duration-300 py-3 rounded-sm z-50">
              <Link to="/shop?gender=women&category=clothing" className="block px-5 py-2 text-xs uppercase tracking-wider font-semibold text-gray-700 hover:text-brand-accent hover:bg-gray-50 transition-colors">
                Clothing
              </Link>
              <Link to="/shop?gender=women&category=shoes" className="block px-5 py-2 text-xs uppercase tracking-wider font-semibold text-gray-700 hover:text-brand-accent hover:bg-gray-50 transition-colors">
                Shoes
              </Link>
              <Link to="/shop?gender=women&category=accessories" className="block px-5 py-2 text-xs uppercase tracking-wider font-semibold text-gray-700 hover:text-brand-accent hover:bg-gray-50 transition-colors">
                Accessories
              </Link>
            </div>
          </div>

          {/* Men Dropdown */}
          <div className="relative group h-full flex items-center">
            <Link to="/shop?gender=men" className="text-sm font-semibold tracking-wider text-brand-primary hover:text-brand-accent uppercase flex items-center gap-1 transition-colors duration-200">
              Men <ChevronDown className="w-3.5 h-3.5" />
            </Link>
            <div className="absolute top-[80%] left-0 w-48 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:top-[100%] transition-all duration-300 py-3 rounded-sm z-50">
              <Link to="/shop?gender=men&category=clothing" className="block px-5 py-2 text-xs uppercase tracking-wider font-semibold text-gray-700 hover:text-brand-accent hover:bg-gray-50 transition-colors">
                Clothing
              </Link>
              <Link to="/shop?gender=men&category=shoes" className="block px-5 py-2 text-xs uppercase tracking-wider font-semibold text-gray-700 hover:text-brand-accent hover:bg-gray-50 transition-colors">
                Shoes
              </Link>
              <Link to="/shop?gender=men&category=accessories" className="block px-5 py-2 text-xs uppercase tracking-wider font-semibold text-gray-700 hover:text-brand-accent hover:bg-gray-50 transition-colors">
                Accessories
              </Link>
            </div>
          </div>

          <Link to="/news" className="text-sm font-semibold tracking-wider text-brand-primary hover:text-brand-accent uppercase transition-colors duration-200">
            News
          </Link>
        </nav>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-6">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative border border-gray-200 rounded-sm bg-gray-50 hover:bg-white transition-all px-3 py-1.5 w-60">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs w-full text-brand-primary placeholder-gray-400 focus:outline-none"
            />
            <button type="submit" className="text-gray-400 hover:text-brand-primary ml-1">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* User Menu */}
          <div className="relative group flex items-center h-20">
            {user ? (
              <div className="flex items-center gap-1 cursor-pointer text-brand-primary hover:text-brand-accent">
                <User className="w-5 h-5" />
                <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider">
                  Hi, {user.firstName}
                </span>
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            ) : (
              <Link to="/login" className="flex items-center gap-1.5 text-brand-primary hover:text-brand-accent">
                <User className="w-5 h-5" />
                <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider">
                  Login
                </span>
              </Link>
            )}

            {/* User Dropdown */}
            {user && (
              <div className="absolute top-[80%] right-0 w-48 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:top-[100%] transition-all duration-300 py-2 rounded-sm z-50">
                <Link to="/profile" className="block px-5 py-2 text-xs uppercase tracking-wider font-semibold text-gray-700 hover:text-brand-accent hover:bg-gray-50 transition-colors">
                  My Profile
                </Link>
                <Link to="/orders" className="block px-5 py-2 text-xs uppercase tracking-wider font-semibold text-gray-700 hover:text-brand-accent hover:bg-gray-50 transition-colors">
                  Order History
                </Link>
                {user.role === 'ADMIN' && (
                  <Link to="/admin" className="block px-5 py-2 text-xs uppercase tracking-wider font-semibold text-brand-accent hover:text-brand-accent-dark hover:bg-gray-50 transition-colors">
                    Admin Dashboard
                  </Link>
                )}
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={logout}
                  className="w-full text-left flex items-center gap-2 px-5 py-2 text-xs uppercase tracking-wider font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </div>
            )}
          </div>

          {/* Cart Icon */}
          <Link to="/cart" className="relative p-1 text-brand-primary hover:text-brand-accent transition-colors duration-200">
            <ShoppingBag className="w-5.5 h-5.5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-accent text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center tracking-tighter">
                {cartItemCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1 text-brand-primary hover:text-brand-accent"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center relative border border-gray-200 rounded-sm bg-gray-50 px-3 py-2 w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm w-full text-brand-primary placeholder-gray-400 focus:outline-none"
            />
            <button type="submit" className="text-gray-400">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <nav className="flex flex-col space-y-3 font-semibold uppercase tracking-wider text-sm">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-brand-accent">
              Home
            </Link>
            <div className="border-t border-gray-100 pt-3">
              <span className="text-xs text-gray-400 font-bold">SHOP CATEGORIES</span>
              <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="block pl-2 mt-2 hover:text-brand-accent">
                Shop All
              </Link>
              <Link to="/shop?gender=women" onClick={() => setMobileMenuOpen(false)} className="block pl-2 mt-2 hover:text-brand-accent">
                Women's Collection
              </Link>
              <Link to="/shop?gender=men" onClick={() => setMobileMenuOpen(false)} className="block pl-2 mt-2 hover:text-brand-accent">
                Men's Collection
              </Link>
            </div>
            <Link to="/news" onClick={() => setMobileMenuOpen(false)} className="border-t border-gray-100 pt-3 hover:text-brand-accent">
              News
            </Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="border-t border-gray-100 pt-3 hover:text-brand-accent">
              Contact Us
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
