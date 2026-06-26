import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Calendar, Info } from 'lucide-react';
import API from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { Loader } from '../components/RouteGuards';

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrderHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/api/orders/user');
      // Sort orders by id descending (most recent first)
      const sortedOrders = (response.data || []).sort((a, b) => b.id - a.id);
      setOrders(sortedOrders);
    } catch (err) {
      console.error('Failed to load order history:', err);
      setError('Could not retrieve your orders. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SHIPPED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'DELIVERED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 min-h-[75vh]">
      <h1 className="font-serif text-3xl font-bold uppercase tracking-wider text-brand-primary mb-8 text-center md:text-left">
        Order History
      </h1>

      {error ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-sm text-center max-w-xl mx-auto">
          <p className="font-bold uppercase tracking-wider text-xs">Failed to Fetch Orders</p>
          <p className="text-sm mt-1">{error}</p>
          <button
            onClick={fetchOrderHistory}
            className="mt-4 bg-brand-primary text-white text-xs font-bold uppercase tracking-wider px-4 py-2 hover:bg-brand-light transition-colors rounded-sm"
          >
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-200 rounded-sm max-w-xl mx-auto">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="font-serif text-xl text-gray-600 mb-2">No orders placed yet</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-8">When you buy items, they will appear here</p>
          <Link
            to="/shop"
            className="inline-block bg-brand-primary hover:bg-brand-light text-white text-xs uppercase tracking-widest font-bold px-8 py-3.5 transition-colors rounded-sm"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {orders.map((order) => {
            const items = order.orderItems || [];
            return (
              <div
                key={order.id}
                className="bg-white border border-gray-150 rounded-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              >
                {/* Order Top Panel */}
                <div className="bg-gray-50 border-b border-gray-150 px-6 py-4 flex flex-wrap justify-between items-center gap-4 text-xs">
                  <div className="flex gap-6">
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider">Order ID</p>
                      <p className="font-bold text-brand-primary mt-1">#{order.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider">Date Placed</p>
                      <div className="flex items-center gap-1.5 text-gray-600 font-semibold mt-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 font-bold uppercase tracking-wider">Total Amount</p>
                      <p className="font-bold text-brand-primary mt-1 font-serif">
                        {formatPrice(order.totalDiscountedPrice || order.totalPrice)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                    {order.status || 'PENDING'}
                  </span>
                </div>

                {/* Items Listing Preview */}
                <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="flex-grow min-w-0 space-y-4">
                    {items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex gap-4 text-xs items-center">
                        <div className="w-10 h-14 bg-gray-50 border border-gray-100 overflow-hidden rounded-sm flex-shrink-0">
                          <img
                            src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=100'}
                            alt={item.product?.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-brand-primary truncate max-w-md">{item.product?.title}</p>
                          <p className="text-gray-400 uppercase text-[10px] mt-0.5">
                            Qty: {item.quantity} | Size: {item.size?.name}
                          </p>
                        </div>
                      </div>
                    ))}
                    {items.length > 2 && (
                      <p className="text-xs text-brand-accent font-semibold uppercase tracking-wider pl-1">
                        + {items.length - 2} more items
                      </p>
                    )}
                  </div>

                  <Link
                    to={`/orders/${order.id}`}
                    className="w-full sm:w-auto text-center border border-gray-200 hover:border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-sm flex items-center justify-center gap-1.5"
                  >
                    <Info className="w-4 h-4" /> View Details <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
