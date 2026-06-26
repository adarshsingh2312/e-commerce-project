import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!token) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const response = await API.get('/api/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to retrieve cart details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [token]);

  const addToCart = async (productId, sizeObj, quantity) => {
    if (!token) {
      toast.error('Please log in to add items to your cart.');
      return false;
    }
    try {
      await API.put('/api/cart/add', {
        productId,
        size: sizeObj, // { name, qty }
        quantity
      });
      toast.success('Item added to cart!');
      await fetchCart();
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add item to cart.';
      toast.error(errorMsg);
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await API.delete(`/api/cart/delete/${itemId}`);
      toast.success('Item removed from cart.');
      await fetchCart();
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to remove item.';
      toast.error(errorMsg);
      return false;
    }
  };

  const clearCart = () => {
    setCart(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
