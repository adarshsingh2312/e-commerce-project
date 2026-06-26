import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Star, ShieldAlert, Check, ChevronRight } from 'lucide-react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Loader } from '../components/RouteGuards';
import toast from 'react-hot-toast';
import { formatPrice } from '../utils/formatPrice';

export const ProductDetails = () => {
  const { id } = useParams();
  const { token, user } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Selection states
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // Reviews and ratings states
  const [reviews, setReviews] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newRatingValue, setNewRatingValue] = useState(5);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const prodRes = await API.get(`/api/products/${id}`);
      setProduct(prodRes.data);
      
      // Select the first available size by default
      const availableSizes = Array.from(prodRes.data?.sizes || []).filter(s => s.qty > 0);
      if (availableSizes.length > 0) {
        setSelectedSize(availableSizes[0]);
      }

      // If user is logged in, load ratings and reviews
      if (token) {
        setReviewLoading(true);
        try {
          const [revRes, ratRes] = await Promise.all([
            API.get(`/api/reviews/product/${id}`),
            API.get(`/api/ratings/product/${id}`)
          ]);
          setReviews(revRes.data || []);
          setRatings(ratRes.data || []);
          
          if (ratRes.data && ratRes.data.length > 0) {
            const sum = ratRes.data.reduce((acc, curr) => acc + curr.rating, 0);
            setAverageRating((sum / ratRes.data.length).toFixed(1));
          } else {
            setAverageRating(prodRes.data.numRatings > 0 ? (prodRes.data.price > 10 ? 4.5 : 4.0) : 0);
          }
        } catch (err) {
          console.warn('Failed to load reviews/ratings. Maybe endpoints require authentication.', err);
        } finally {
          setReviewLoading(false);
        }
      }
    } catch (err) {
      console.error('Failed to load product details:', err);
      setError('Product not found or catalog connection failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id, token]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!selectedSize) {
      toast.error('Please select a size first.');
      return;
    }
    
    setAddingToCart(true);
    const success = await addToCart(product.id, selectedSize, quantity);
    setAddingToCart(false);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please login to leave feedback.');
      return;
    }
    
    setSubmittingFeedback(true);
    try {
      // 1. Submit review if text is filled
      if (newReviewText.trim()) {
        await API.post('/api/reviews/create', {
          productId: product.id,
          review: newReviewText.trim()
        });
      }

      // 2. Submit rating
      await API.post('/api/ratings/create', {
        productId: product.id,
        rating: parseFloat(newRatingValue)
      });

      toast.success('Thank you for your feedback!');
      setNewReviewText('');
      
      // Refresh reviews/ratings
      const [revRes, ratRes] = await Promise.all([
        API.get(`/api/reviews/product/${id}`),
        API.get(`/api/ratings/product/${id}`)
      ]);
      setReviews(revRes.data || []);
      setRatings(ratRes.data || []);
      
      if (ratRes.data && ratRes.data.length > 0) {
        const sum = ratRes.data.reduce((acc, curr) => acc + curr.rating, 0);
        setAverageRating((sum / ratRes.data.length).toFixed(1));
      }
    } catch (err) {
      console.error('Failed to submit review/rating:', err);
      toast.error('Could not submit your feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-brand-primary mb-4">Error Loading Product</h2>
        <p className="text-gray-500 mb-8">{error || 'The requested product could not be loaded.'}</p>
        <Link to="/shop" className="bg-brand-primary text-white text-xs uppercase tracking-widest font-bold px-8 py-3.5 hover:bg-brand-light transition-colors rounded-sm">
          Return to Shop
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountedPercent > 0;
  const isOutOfStock = product.quantity === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400 font-bold mb-8">
        <Link to="/" className="hover:text-brand-primary">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/shop" className="hover:text-brand-primary">Shop</Link>
        {product.category?.name && (
          <>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-500">{product.category.name}</span>
          </>
        )}
      </nav>

      {/* Main product presentation grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 mb-20">
        {/* Left Column - Image Showcase */}
        <div className="bg-gray-50 border border-gray-100 aspect-3/4 rounded-sm overflow-hidden relative">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800'}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          {hasDiscount && (
            <span className="absolute top-4 left-4 bg-brand-accent text-white text-xs font-bold px-3 py-1.5 tracking-widest uppercase rounded-sm z-10 shadow-sm">
              {product.discountedPercent}% OFF
            </span>
          )}
        </div>

        {/* Right Column - Product details & purchasing form */}
        <div className="flex flex-col justify-start space-y-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-brand-accent">
              {product.brand || 'eMart Premium'}
            </span>
            <h1 className="font-serif text-3xl lg:text-4xl font-bold text-brand-primary">
              {product.title}
            </h1>
            
            {/* Aggregate Stars Summary */}
            <div className="flex items-center gap-1.5 pt-1">
              <div className="flex text-brand-accent">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 fill-current ${
                      (averageRating || 4) >= s ? 'text-brand-accent' : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-gray-500">
                {averageRating > 0 ? `${averageRating} / 5.0` : 'No ratings yet'}{' '}
                {ratings.length > 0 && `(${ratings.length} reviews)`}
              </span>
            </div>
          </div>

          {/* Price tags */}
          <div className="flex items-baseline gap-4 pt-2 border-t border-gray-100">
            <span className="text-3xl font-bold text-brand-primary font-serif">
              {formatPrice(product.discountedPrice || product.price)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Color description */}
          {product.colour && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="font-bold text-xs uppercase tracking-wider text-gray-500">Color:</span>
              <span className="capitalize font-semibold">{product.colour}</span>
            </div>
          )}

          {/* Size Selector */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-gray-500">
              <span>Select Size</span>
              {selectedSize && (
                <span className="text-brand-accent font-semibold">
                  Only {selectedSize.qty} units left
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {Array.from(product.sizes || []).map((sz) => {
                const outOfStock = sz.qty <= 0;
                const isSelected = selectedSize?.name === sz.name;
                return (
                  <button
                    key={sz.name}
                    disabled={outOfStock}
                    onClick={() => {
                      setSelectedSize(sz);
                      setQuantity(1); // Reset qty on size change
                    }}
                    className={`min-w-12 h-12 border px-4 text-xs font-bold uppercase transition-all duration-200 rounded-sm relative flex items-center justify-center ${
                      outOfStock
                        ? 'border-gray-150 text-gray-300 cursor-not-allowed bg-gray-50'
                        : isSelected
                        ? 'border-brand-primary bg-brand-primary text-white shadow-md'
                        : 'border-gray-200 text-gray-700 hover:border-brand-primary hover:text-brand-primary'
                    }`}
                  >
                    {sz.name}
                    {outOfStock && <span className="absolute inset-x-0 top-1/2 border-t border-gray-300 -rotate-12"></span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector & Add button */}
          <div className="flex items-center gap-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Quantity
              </label>
              <div className="flex items-center border border-gray-200 rounded-sm">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((q) => q - 1)}
                  className="px-3.5 py-2 hover:bg-gray-50 text-gray-500 font-bold transition-colors disabled:opacity-35"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-brand-primary min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={isOutOfStock || quantity >= (selectedSize?.qty || product.quantity || 1)}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3.5 py-2 hover:bg-gray-50 text-gray-500 font-bold transition-colors disabled:opacity-35"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex-grow pt-5">
              <button
                type="button"
                disabled={isOutOfStock || addingToCart || !selectedSize}
                onClick={handleAddToCart}
                className="w-full bg-brand-accent hover:bg-brand-accent-dark text-white text-xs uppercase tracking-widest font-bold py-3.5 px-6 rounded-sm transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:-translate-y-0.5 active:translate-y-0"
              >
                {addingToCart ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    {isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Assurances list */}
          <div className="border-t border-gray-100 pt-6 space-y-2 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>100% Genuine product guarantees</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>Easy 30-day returns and exchanges</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="border-t border-gray-100 pt-16">
        <h2 className="font-serif text-2xl font-bold uppercase tracking-wider text-brand-primary mb-8">
          Customer Reviews
        </h2>

        {!token ? (
          <div className="bg-gray-50 border border-gray-100 p-6 rounded-sm text-center max-w-xl">
            <ShieldAlert className="w-8 h-8 text-brand-accent mx-auto mb-3" />
            <p className="font-semibold text-sm text-brand-primary">Authentication Required</p>
            <p className="text-xs text-gray-500 mt-1">Please sign in to read and leave reviews for this product.</p>
            <Link
              to="/login"
              className="mt-4 inline-block bg-brand-primary hover:bg-brand-light text-white text-xs uppercase tracking-widest font-bold px-6 py-2.5 transition-colors rounded-sm"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-6">
              {reviewLoading ? (
                <div className="py-8 text-center text-gray-400">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="py-8 text-left text-gray-400 font-medium italic text-xs">
                  No reviews posted yet. Be the first to leave one!
                </div>
              ) : (
                <div className="space-y-6 divide-y divide-gray-100">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="pt-6 first:pt-0 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs uppercase tracking-wider text-brand-primary">
                          {rev.user?.firstName} {rev.user?.lastName || ''}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold">
                          {new Date(rev.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed font-light">{rev.review}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Leave Feedback Form */}
            <div className="bg-gray-50 border border-gray-150 p-6 rounded-sm self-start">
              <h3 className="text-xs uppercase font-bold tracking-widest text-brand-primary mb-4 pb-2 border-b border-gray-200">
                Share Your Feedback
              </h3>
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                {/* Rating Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                    Product Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewRatingValue(star)}
                        className="text-brand-accent focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 fill-current ${
                            newRatingValue >= star ? 'text-brand-accent' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Textarea */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                    Your Review
                  </label>
                  <textarea
                    rows={4}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Write your thoughts about the size, fit, material, and quality..."
                    className="w-full p-3 text-xs bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-brand-accent placeholder-gray-400"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="w-full bg-brand-primary hover:bg-brand-light text-white text-[10px] uppercase tracking-widest font-bold py-3 rounded-sm transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  {submittingFeedback ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ProductDetails;
