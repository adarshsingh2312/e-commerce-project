import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';

export const ProductCard = ({ product }) => {
  if (!product) return null;

  const {
    id,
    title,
    price,
    discountedPrice,
    discountedPercent,
    brand,
    imageUrl,
    colour
  } = product;

  const hasDiscount = discountedPercent > 0;

  return (
    <div className="group flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative rounded-sm overflow-hidden">
      {/* Discount Badge */}
      {hasDiscount && (
        <span className="absolute top-3 left-3 bg-brand-accent text-white text-[9px] font-bold px-2.5 py-1 tracking-widest uppercase z-10 rounded-sm">
          {discountedPercent}% OFF
        </span>
      )}

      {/* Product Image */}
      <Link to={`/product/${id}`} className="block relative overflow-hidden bg-gray-50 aspect-3/4">
        <img
          src={imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=600'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <span className="bg-white/95 text-brand-primary text-[10px] tracking-widest font-bold px-4 py-2 border border-gray-100 uppercase hover:bg-brand-primary hover:text-white transition-all duration-300 shadow-sm rounded-sm">
            Quick View
          </span>
        </div>
      </Link>

      {/* Info Details */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] tracking-widest text-gray-400 font-bold uppercase">
            <span>{brand || 'eMart Premium'}</span>
            {colour && <span>{colour}</span>}
          </div>
          <Link to={`/product/${id}`} className="block">
            <h3 className="text-sm font-semibold text-brand-primary group-hover:text-brand-accent transition-colors duration-200 line-clamp-1">
              {title}
            </h3>
          </Link>
        </div>

        {/* Pricing & Cart Button */}
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-bold text-brand-primary font-serif">
              {formatPrice(discountedPrice || price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(price)}
              </span>
            )}
          </div>
          <Link
            to={`/product/${id}`}
            className="p-2 border border-gray-100 hover:border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white rounded-sm transition-all duration-300"
            title="View Details"
          >
            <ShoppingBag className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
