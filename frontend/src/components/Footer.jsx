import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail) {
      toast.error('Please enter a valid email address.');
      return;
    }
    toast.success('Thank you for subscribing to our newsletter!');
    setNewsletterEmail('');
  };
  return (
    <footer className="bg-brand-primary text-gray-400 text-sm mt-auto border-t border-gray-900">
      {/* Upper Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="space-y-4">
          <Link to="/" className="flex flex-col items-start select-none">
            <span className="font-serif font-bold text-2xl tracking-widest text-white uppercase">
              eMart
            </span>
            <span className="text-[9px] tracking-[0.25em] text-brand-accent uppercase -mt-1 font-semibold">
              EST. 2026
            </span>
          </Link>
          <p className="text-xs leading-relaxed max-w-xs">
            Premium apparel and accessories designed for modern styles. We merge quality fabrics with timeless design aesthetics.
          </p>
          <div className="space-y-2 pt-2 text-xs">
            <div className="flex items-center gap-2.5">
              <Phone className="w-3.5 h-3.5 text-brand-accent" />
              <span>+1 (800) 555-EMART</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-3.5 h-3.5 text-brand-accent" />
              <span>support@emart.com</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-brand-accent" />
              <span>100 Fashion Blvd, Suite 400, NY</span>
            </div>
          </div>
        </div>

        {/* Collections Column */}
        <div className="space-y-4">
          <h4 className="text-white font-bold tracking-widest text-xs uppercase">Collections</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/shop?gender=women" className="hover:text-white transition-colors">Women's Apparel</Link></li>
            <li><Link to="/shop?gender=men" className="hover:text-white transition-colors">Men's Apparel</Link></li>
            <li><Link to="/shop?category=shoes" className="hover:text-white transition-colors">Premium Footwear</Link></li>
            <li><Link to="/shop?category=accessories" className="hover:text-white transition-colors">Accessories</Link></li>
            <li><Link to="/shop" className="hover:text-white transition-colors">New Arrivals</Link></li>
          </ul>
        </div>

        {/* Customer Support Column */}
        <div className="space-y-4">
          <h4 className="text-white font-bold tracking-widest text-xs uppercase">Customer Care</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
            <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping & Returns</Link></li>
            <li><Link to="/size-guide" className="hover:text-white transition-colors">Size Guide</Link></li>
            <li><Link to="/faqs" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="space-y-4">
          <h4 className="text-white font-bold tracking-widest text-xs uppercase">Newsletter</h4>
          <p className="text-xs leading-relaxed">
            Subscribe to receive updates, access to exclusive deals, and more.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="space-y-2">
            <input
              type="email"
              placeholder="Enter your email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-brand-light border border-gray-800 text-white rounded-sm placeholder-gray-500 focus:outline-none focus:border-brand-accent transition-colors"
            />
            <button
              type="submit"
              className="w-full bg-brand-accent hover:bg-brand-accent-dark text-white text-xs uppercase tracking-widest font-bold py-2.5 rounded-sm transition-colors duration-200"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Footer Area */}
      <div className="bg-brand-light py-6 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <div>
            &copy; 2026 eMart Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gray-300">Terms of Use</Link>
            <Link to="/sitemap" className="hover:text-gray-300">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
