import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice';
import { Loader } from '../components/RouteGuards';
import { ShieldCheck, ChevronRight, CreditCard, Home, Smartphone, MapPin } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    cityName: '',
    state: '',
    zipCode: '',
    mobileNumber: '',
  });

  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const handleSelectAddress = (addr) => {
    if (addr) {
      setSelectedAddressId(addr.id);
      setFormData({
        firstName: addr.firstName || '',
        lastName: addr.lastName || '',
        streetAddress: addr.streetAddress || '',
        cityName: addr.cityName || '',
        state: addr.state || '',
        zipCode: addr.zipCode || '',
        mobileNumber: addr.mobileNumber || '',
      });
    } else {
      setSelectedAddressId(null);
      setFormData({
        firstName: '',
        lastName: '',
        streetAddress: '',
        cityName: '',
        state: '',
        zipCode: '',
        mobileNumber: '',
      });
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');

  const cartItems = cart?.cartItems ? Array.from(cart.cartItems) : [];

  if (!cart || cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-brand-primary mb-4">Your Bag is Empty</h2>
        <p className="text-gray-500 mb-8">You cannot checkout with an empty bag.</p>
        <Link to="/shop" className="bg-brand-primary text-white text-xs uppercase tracking-widest font-bold px-8 py-3.5 hover:bg-brand-light transition-colors rounded-sm">
          Shop Catalog
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Form validation
    const { firstName, lastName, streetAddress, cityName, state, zipCode, mobileNumber } = formData;
    if (!firstName || !lastName || !streetAddress || !cityName || !state || !zipCode || !mobileNumber) {
      setError('Please fill in all the shipping address fields.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await API.post('/api/orders', formData, {
        headers: {
          'X-Payment-Method': paymentMethod
        }
      });
      const createdOrder = response.data;

      if (paymentMethod === 'COD') {
        toast.success('Order placed successfully (Cash on Delivery)!');
        await fetchCart();
        navigate(`/orders/${createdOrder.id}`);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load Razorpay SDK. Please check your internet connection.');
        setSubmitting(false);
        return;
      }

      const orderRes = await API.post(`/api/payments/create-order/${createdOrder.id}`);
      const paymentDetails = orderRes.data;

      const options = {
        key: 'rzp_test_T75cz57uStNvTk',
        amount: createdOrder.totalDiscountedPrice * 100,
        currency: 'INR',
        name: 'eMART',
        description: `Checkout Payment for Order #${createdOrder.id}`,
        order_id: paymentDetails.razorpayPaymentLinkId,
        handler: async function (paymentRes) {
          try {
            await API.post('/api/payments/verify', {
              razorpay_payment_id: paymentRes.razorpay_payment_id,
              razorpay_order_id: paymentRes.razorpay_order_id,
              razorpay_signature: paymentRes.razorpay_signature,
            });
            toast.success('Payment verified & order placed successfully!');
            await fetchCart();
            navigate(`/orders/${createdOrder.id}`);
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr);
            toast.error('Payment verification failed. Please contact customer support.');
          }
        },
        prefill: {
          name: `${firstName} ${lastName}`,
          contact: mobileNumber,
        },
        theme: {
          color: '#D97706',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Failed to place order:', err);
      const errorMsg = err.response?.data?.message || 'Failed to submit order. Please try again.';
      setError(errorMsg);
      toast.error('Order submission failed.');
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 min-h-screen">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-gray-400 font-bold mb-8">
        <Link to="/cart" className="hover:text-brand-primary">Shopping Bag</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-500">Checkout Shipping</span>
      </nav>

      {submitting && <Loader />}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
        {/* Shipping Form */}
        <div className="lg:col-span-3 bg-white border border-gray-100 shadow-sm p-6 md:p-8 rounded-sm">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-150">
            <Home className="w-5 h-5 text-brand-accent" />
            <h2 className="font-serif text-xl font-bold uppercase tracking-wider text-brand-primary">
              Shipping Address
            </h2>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 text-xs py-3 px-4 mb-6 rounded-sm font-medium">
              {error}
            </div>
          )}

          {/* Saved Addresses list */}
          {user && user.addresses && user.addresses.length > 0 && (
            <div className="mb-8 border border-gray-150 p-5 rounded-sm bg-gray-50/50">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand-primary block mb-3.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-accent" /> Select Saved Shipping Address
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectAddress(addr)}
                    className={`border p-4 rounded-sm cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      selectedAddressId === addr.id
                        ? 'border-brand-accent bg-amber-50/5'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-brand-primary truncate">
                          {addr.firstName} {addr.lastName}
                        </p>
                        {selectedAddressId === addr.id && (
                          <span className="w-2 h-2 rounded-full bg-brand-accent inline-block"></span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 leading-normal font-light">
                        {addr.streetAddress}, {addr.cityName}, {addr.state} - {addr.zipCode}
                      </p>
                    </div>
                    {addr.mobileNumber && (
                      <p className="text-[9px] text-gray-400 font-bold tracking-wider mt-3 uppercase">Ph: {addr.mobileNumber}</p>
                    )}
                  </div>
                ))}
                
                {/* Clear / Add new option */}
                <div
                  onClick={() => handleSelectAddress(null)}
                  className={`border border-dashed p-4 rounded-sm cursor-pointer transition-all duration-250 flex items-center justify-center text-center ${
                    selectedAddressId === null
                      ? 'border-brand-accent bg-amber-50/5'
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50/20'
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    + Use A Different Address
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Rahul"
                  className="w-full px-4 py-3 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Verma"
                  className="w-full px-4 py-3 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-brand-accent"
                />
              </div>
            </div>

            {/* Street address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">
                Street Address
              </label>
              <input
                type="text"
                name="streetAddress"
                required
                value={formData.streetAddress}
                onChange={handleChange}
                placeholder="Apartment, suite, unit, building, street address"
                className="w-full px-4 py-3 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-brand-accent"
              />
            </div>

            {/* City, State, ZIP */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">
                  City
                </label>
                <input
                  type="text"
                  name="cityName"
                  required
                  value={formData.cityName}
                  onChange={handleChange}
                  placeholder="New Delhi"
                  className="w-full px-4 py-3 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  required
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Delhi"
                  className="w-full px-4 py-3 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">
                  ZIP Code / PIN Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  required
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="110001"
                  className="w-full px-4 py-3 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-brand-accent"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">
                Mobile Number (for delivery updates)
              </label>
              <input
                type="tel"
                name="mobileNumber"
                required
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full px-4 py-3 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-brand-accent"
              />
            </div>

            <div className="border-t border-gray-150 pt-6 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
                <CreditCard className="w-4 h-4 text-brand-accent" />
                <span>Select Payment Method</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('COD')}
                  className={`border p-5 rounded-sm cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    paymentMethod === 'COD'
                      ? 'border-brand-accent bg-amber-50/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">Cash On Delivery</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="w-4 h-4 text-brand-accent accent-brand-accent cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    Pay in cash when your shipment arrives at your doorstep.
                  </p>
                </div>

                {/* Online Payment via Razorpay */}
                <div
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`border p-5 rounded-sm cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    paymentMethod === 'ONLINE'
                      ? 'border-brand-accent bg-amber-50/5'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">Pay Online</span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'ONLINE'}
                      onChange={() => setPaymentMethod('ONLINE')}
                      className="w-4 h-4 text-brand-accent accent-brand-accent cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    Secure checkout using Cards, UPI, NetBanking, or Wallets via Razorpay.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-primary hover:bg-brand-light text-white text-xs uppercase tracking-widest font-bold py-4 rounded-sm transition-all duration-200 shadow-md hover:-translate-y-0.5 disabled:opacity-50"
            >
              Proceed to Pay
            </button>
          </form>
        </div>
        {/* Order Summary Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-50 border border-gray-150 p-6 rounded-sm space-y-6">
            <h3 className="font-serif text-lg font-bold uppercase tracking-wider text-brand-primary border-b border-gray-200 pb-3">
              Order Summary
            </h3>

            {/* Product Mini List */}
            <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 text-xs">
                  <div className="w-12 h-16 bg-white border border-gray-200 overflow-hidden rounded-sm flex-shrink-0">
                    <img
                      src={item.product?.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=100'}
                      alt={item.product?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-brand-primary truncate">{item.product?.title}</p>
                    <p className="text-[10px] text-gray-400 uppercase mt-0.5">
                      Qty: {item.quantity} | Size: {item.size?.name}
                    </p>
                  </div>
                  <span className="font-bold font-serif text-brand-primary">
                    {formatPrice(item.discountedPrice || item.price)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 my-4"></div>

            {/* Calculations */}
            <div className="space-y-3.5 text-xs font-semibold text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span className="text-brand-primary">{formatPrice(cart.totalPrice || 0)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-brand-primary">FREE</span>
              </div>
              <div className="border-t border-gray-250 pt-3 flex justify-between text-brand-primary text-sm font-black uppercase tracking-wider">
                <span>Total Amount</span>
                <span className="text-lg font-serif" id="amountToPay">{formatPrice(cart.totalDiscountedPrice || 0)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-150 p-6 rounded-sm text-center">
            <ShieldCheck className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <h4 className="text-xs uppercase font-bold text-brand-primary mb-1">eMart Guarantee</h4>
            <p className="text-[10px] text-gray-400 max-w-xs mx-auto leading-relaxed">
              Your details are protected with secure SSL connections. Shipments are insured against damage or loss.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
