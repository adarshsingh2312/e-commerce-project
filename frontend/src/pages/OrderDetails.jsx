import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Phone, User, Package, Check, ChevronLeft } from 'lucide-react';
import API from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { Loader } from '../components/RouteGuards';

export const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get(`/api/orders/${id}`);
      setOrder(response.data);
    } catch (err) {
      console.error('Failed to load order details:', err);
      setError('Could not retrieve order details. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const getStatusSteps = (status) => {
    const steps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    if (status === 'CANCELLED') return ['PENDING', 'CANCELLED'];
    return steps;
  };

  const isStepActive = (step, currentStatus) => {
    const steps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
    if (currentStatus === 'CANCELLED') {
      return step === 'PENDING' || step === 'CANCELLED';
    }
    const currentIndex = steps.indexOf(currentStatus);
    const stepIndex = steps.indexOf(step);
    return stepIndex <= currentIndex;
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-brand-primary mb-4">Error Loading Order</h2>
        <p className="text-gray-500 mb-8">{error || 'The requested order details could not be loaded.'}</p>
        <Link to="/orders" className="bg-brand-primary text-white text-xs uppercase tracking-widest font-bold px-8 py-3.5 hover:bg-brand-light transition-colors rounded-sm">
          Back to Orders
        </Link>
      </div>
    );
  }

  const items = order.orderItems || [];
  const statusSteps = getStatusSteps(order.status);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 min-h-screen">
      <Link
        to="/orders"
        className="text-xs font-bold uppercase tracking-widest text-brand-primary hover:text-brand-accent transition-colors flex items-center gap-1.5 mb-8"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Orders
      </Link>

      {/* Order Summary Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-250 pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-brand-primary">
            Order #{order.id}
          </h1>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-gray-500 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Placed: {new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString()}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-brand-accent">
              Status: {order.status || 'PENDING'}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Total Amount</p>
          <p className="font-serif text-2xl font-black text-brand-primary mt-1">
            {formatPrice(order.totalDiscountedPrice || order.totalPrice)}
          </p>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="bg-white border border-gray-150 p-6 md:p-8 rounded-sm mb-8">
        <h3 className="text-xs uppercase font-bold tracking-widest text-gray-500 mb-8 flex items-center gap-2">
          <Package className="w-4 h-4 text-brand-accent" /> Shipment Progress
        </h3>
        
        {/* Timeline Line */}
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-4 md:px-12">
          {/* Background bar */}
          <div className="hidden md:block absolute left-12 right-12 top-4.5 h-0.5 bg-gray-200 z-0"></div>

          {statusSteps.map((step, index) => {
            const isActive = isStepActive(step, order.status);
            return (
              <div key={step} className="flex md:flex-col items-center gap-4 md:gap-2.5 relative z-10">
                {/* Node circle */}
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                    isActive
                      ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  {isActive ? <Check className="w-5 h-5" /> : index + 1}
                </div>
                {/* Label text */}
                <div className="text-left md:text-center">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-brand-primary font-black' : 'text-gray-400'}`}>
                    {step}
                  </p>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold mt-0.5">
                    {isActive ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Address Details and Items */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          {order.address && (
            <div className="bg-white border border-gray-150 p-6 md:p-8 rounded-sm">
              <h3 className="text-xs uppercase font-bold tracking-widest text-brand-primary border-b border-gray-150 pb-3 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-accent" /> Delivery Address
              </h3>
              
              <div className="space-y-4 text-xs font-semibold text-gray-700">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-brand-primary text-sm font-bold uppercase tracking-wide">
                    {order.address.firstName} {order.address.lastName}
                  </span>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    {order.address.streetAddress},<br />
                    {order.address.cityName}, {order.address.state} - {order.address.zipCode}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{order.address.mobileNumber}</span>
                </div>
              </div>
            </div>
          )}

          {/* Items detailed breakdown */}
          <div className="bg-white border border-gray-150 p-6 md:p-8 rounded-sm">
            <h3 className="text-xs uppercase font-bold tracking-widest text-brand-primary border-b border-gray-150 pb-3 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-accent" /> Itemized details
            </h3>

            <div className="divide-y divide-gray-150">
              {items.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 text-xs">
                  <div className="w-14 h-20 bg-gray-50 border border-gray-100 overflow-hidden rounded-sm flex-shrink-0">
                    <img
                      src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=200'}
                      alt={item.product?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="font-bold text-brand-primary truncate max-w-sm">{item.product?.title}</p>
                      <p className="text-[10px] text-gray-400 uppercase mt-0.5">
                        Brand: {item.product?.brand || 'eMart Premium'}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase mt-0.5 font-bold">
                        Qty: {item.quantity} | Size: {item.size?.name}
                      </p>
                    </div>
                    <span className="font-bold text-brand-accent font-serif mt-1">
                      {formatPrice(item.discountedPrice || item.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Billing summary */}
        <aside className="bg-gray-50 border border-gray-150 p-6 md:p-8 rounded-sm space-y-6">
          <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-brand-primary border-b border-gray-250 pb-3">
            Payment Summary
          </h3>

          <div className="space-y-4 text-xs font-semibold text-gray-600">
            <div className="flex justify-between">
              <span>Items Total Price</span>
              <span className="text-brand-primary">{formatPrice(order.totalPrice || 0)}</span>
            </div>
            
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Product Discounts</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="text-brand-primary font-bold">FREE</span>
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            <div className="flex justify-between text-brand-primary text-sm font-black uppercase tracking-wider">
              <span>Total Charge</span>
              <span className="text-lg font-serif">{formatPrice(order.totalDiscountedPrice || order.totalPrice)}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 text-xs text-gray-500 space-y-3">
            <div>
              <p className="font-bold uppercase text-[10px] text-gray-400">Payment Status</p>
              <p className="font-bold uppercase text-brand-primary mt-0.5">Cash on Delivery (COD) - Unpaid</p>
            </div>
            <div>
              <p className="font-bold uppercase text-[10px] text-gray-400">Delivery Status</p>
              <p className="font-bold uppercase text-brand-accent mt-0.5">{order.status || 'PENDING'}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default OrderDetails;
