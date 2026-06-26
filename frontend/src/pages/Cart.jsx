import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';
import { Loader } from '../components/RouteGuards';
import API from '../services/api';
import toast from 'react-hot-toast';

export const Cart = () => {
  const { cart, loading, fetchCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const cartItems = cart?.cartItems ? Array.from(cart.cartItems) : [];

  const handleUpdateQuantity = async (item, newQty) => {
    if (newQty <= 0) {
      handleRemove(item.id);
      return;
    }
    
    // Find the product's max available qty for the selected size
    const sizeInProduct = Array.from(item.product?.sizes || []).find(s => s.name === item.size?.name);
    const maxQty = sizeInProduct ? sizeInProduct.qty : item.product?.quantity || 10;
    
    if (newQty > maxQty) {
      toast.error(`Only ${maxQty} units available in size ${item.size?.name}`);
      return;
    }

    setUpdatingItemId(item.id);
    try {
      // Step 1: Remove the current item
      await API.delete(`/api/cart/delete/${item.id}`);
      
      // Step 2: Re-add with the new quantity
      await API.put('/api/cart/add', {
        productId: item.product.id,
        size: item.size,
        quantity: newQty
      });
      
      await fetchCart();
    } catch (err) {
      console.error('Failed to update cart quantity:', err);
      toast.error('Could not update quantity. Please try again.');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (itemId) => {
    setUpdatingItemId(itemId);
    await removeFromCart(itemId);
    setUpdatingItemId(null);
  };

  if (loading && cartItems.length === 0) {
    return <Loader />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 min-h-[75vh]">
      <h1 className="font-serif text-3xl font-bold uppercase tracking-wider text-brand-primary mb-8 text-center md:text-left">
        Shopping Bag
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-200 rounded-sm max-w-2xl mx-auto">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="font-serif text-xl text-gray-600 mb-2">Your bag is empty</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-8">Items you add will appear here</p>
          <Link
            to="/shop"
            className="inline-block bg-brand-primary hover:bg-brand-light text-white text-xs uppercase tracking-widest font-bold px-8 py-3.5 transition-colors rounded-sm"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="divide-y divide-gray-150 border-t border-b border-gray-200">
              {cartItems.map((item) => {
                const isItemUpdating = updatingItemId === item.id;
                const activePrice = item.product?.discountedPrice || item.product?.price || item.price / item.quantity;
                return (
                  <div key={item.id} className="py-6 flex flex-col sm:flex-row gap-6 relative">
                    {isItemUpdating && (
                      <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {/* Image */}
                    <div className="w-24 h-32 bg-gray-50 border border-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                      <img
                        src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200'}
                        alt={item.product?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-semibold text-brand-primary hover:text-brand-accent transition-colors">
                            <Link to={`/product/${item.product?.id}`}>{item.product?.title}</Link>
                          </h3>
                          <span className="text-sm font-bold text-brand-primary font-serif ml-4">
                            {formatPrice(item.discountedPrice || item.price)}
                          </span>
                        </div>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
                          {item.product?.brand || 'eMart Premium'}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2 text-xs text-gray-500 font-medium">
                          {item.size?.name && (
                            <div>
                              <span>Size: </span>
                              <span className="uppercase text-brand-primary font-bold">{item.size.name}</span>
                            </div>
                          )}
                          {item.product?.colour && (
                            <div>
                              <span>Color: </span>
                              <span className="capitalize text-brand-primary font-bold">{item.product.colour}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center border border-gray-200 rounded-sm">
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                            className="px-2.5 py-1 hover:bg-gray-50 text-gray-500 font-bold transition-colors text-xs"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-bold text-brand-primary min-w-[1.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                            className="px-2.5 py-1 hover:bg-gray-50 text-gray-500 font-bold transition-colors text-xs"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                to="/shop"
                className="text-xs font-bold uppercase tracking-widest text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1.5"
              >
                &larr; Continue Shopping
              </Link>
            </div>
          </div>

          {/* Checkout Panel */}
          <aside className="bg-gray-50 border border-gray-150 p-6 md:p-8 rounded-sm space-y-6">
            <h3 className="font-serif text-xl font-bold uppercase tracking-wider text-brand-primary border-b border-gray-200 pb-3">
              Order Summary
            </h3>
            
            <div className="space-y-4 text-xs font-medium text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span className="text-brand-primary font-bold">{formatPrice(cart.totalPrice || 0)}</span>
              </div>
              
              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Product Discount</span>
                  <span>-{formatPrice(cart.discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="text-brand-primary font-bold">FREE</span>
              </div>

              <div className="border-t border-gray-200 my-4"></div>
              
              <div className="flex justify-between text-sm text-brand-primary font-bold uppercase tracking-wider">
                <span>Total Amount</span>
                <span className="text-lg font-serif font-black">{formatPrice(cart.totalDiscountedPrice || 0)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-brand-accent hover:bg-brand-accent-dark text-white text-xs uppercase tracking-widest font-bold py-4 rounded-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider pt-2">
              <ShieldCheck className="w-4 h-4 text-green-500" /> Secure checkout checkout
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default Cart;
