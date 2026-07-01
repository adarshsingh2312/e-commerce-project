import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, ShoppingBag, Eye, Check, Truck, X, RefreshCw, Layers, CreditCard, IndianRupee, Activity, Percent, ChevronLeft, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import API from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { Loader } from '../components/RouteGuards';
import toast from 'react-hot-toast';

const COLORS = ['#9155FD', '#56CA00', '#FFB400', '#16B1FF', '#FF4C51', '#8C52FF'];

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Payments summary state
  const [paymentsSummary, setPaymentsSummary] = useState(null);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals / Drawer toggles
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditStockModal, setShowEditStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newStockQty, setNewStockQty] = useState('');

  // Form states for creating product
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    brand: '',
    color: '',
    imageUrl: '',
    topLevelCategory: 'Male',
    secondLevelCategory: 'Clothing',
    thirdLevelCategory: '',
    price: '',
    discountedPrice: '',
    discountPercent: '',
    quantity: ''
  });

  const [sizeQuantities, setSizeQuantities] = useState({
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0
  });

  const fetchProducts = async () => {
    try {
      const response = await API.get('/api/admin/products/all');
      setProducts(response.data || []);
    } catch (err) {
      console.error('Failed to load admin products:', err);
      toast.error('Could not retrieve product list.');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await API.get('/api/admin/orders');
      const sorted = (response.data || []).sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
      toast.error('Could not retrieve order list.');
    }
  };

  const fetchPaymentsSummary = async () => {
    try {
      setPaymentsLoading(true);
      const response = await API.get('/api/admin/payments/summary');
      setPaymentsSummary(response.data);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to load payments summary:', err);
      toast.error('Could not retrieve payments data.');
    } finally {
      setPaymentsLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'products') {
      await fetchProducts();
    } else if (activeTab === 'orders') {
      await fetchOrders();
    } else if (activeTab === 'payments') {
      await fetchPaymentsSummary();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'products') {
      await fetchProducts();
    } else if (activeTab === 'orders') {
      await fetchOrders();
    } else if (activeTab === 'payments') {
      await fetchPaymentsSummary();
    }
    setRefreshing(false);
    toast.success('Data reloaded.');
  };

  // Product actions
  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'price' || name === 'discountedPrice') {
        const p = parseFloat(name === 'price' ? value : prev.price);
        const dp = parseFloat(name === 'discountedPrice' ? value : prev.discountedPrice);
        if (p && dp && p > dp) {
          updated.discountPercent = Math.round(((p - dp) / p) * 100).toString();
        }
      }
      return updated;
    });
  };

  const handleSizeQtyChange = (size, val) => {
    const intVal = Math.max(0, parseInt(val) || 0);
    setSizeQuantities(prev => ({
      ...prev,
      [size]: intVal
    }));
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    const sizes = Object.entries(sizeQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([name, qty]) => ({ name, qty }));

    const totalQty = Object.values(sizeQuantities).reduce((acc, curr) => acc + curr, 0);

    const payload = {
      ...productForm,
      price: parseInt(productForm.price),
      discountedPrice: parseInt(productForm.discountedPrice),
      discountPercent: parseInt(productForm.discountPercent) || 0,
      quantity: totalQty || parseInt(productForm.quantity) || 10,
      sizes
    };

    try {
      setLoading(true);
      await API.post('/api/admin/products', payload);
      toast.success('Product created successfully!');
      setShowAddForm(false);
      setProductForm({
        title: '',
        description: '',
        brand: '',
        color: '',
        imageUrl: '',
        topLevelCategory: 'Male',
        secondLevelCategory: 'Clothing',
        thirdLevelCategory: '',
        price: '',
        discountedPrice: '',
        discountPercent: '',
        quantity: ''
      });
      setSizeQuantities({ S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
      await fetchProducts();
    } catch (err) {
      console.error('Failed to create product:', err);
      toast.error(err.response?.data?.message || 'Failed to create product.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      setLoading(true);
      await API.delete(`/api/admin/products/${productId}`);
      toast.success('Product deleted.');
      await fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
      toast.error('Failed to delete product.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEditStock = (product) => {
    setSelectedProduct(product);
    setNewStockQty(product.quantity.toString());
    setShowEditStockModal(true);
  };

  const handleUpdateStockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    try {
      setLoading(true);
      await API.put(`/api/admin/products/${selectedProduct.id}/update`, {
        quantity: parseInt(newStockQty)
      });
      toast.success('Stock inventory updated.');
      setShowEditStockModal(false);
      setSelectedProduct(null);
      await fetchProducts();
    } catch (err) {
      console.error('Failed to update stock:', err);
      toast.error('Failed to update product stock.');
    } finally {
      setLoading(false);
    }
  };

  // Order actions
  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      setLoading(true);
      await API.put(`/api/admin/orders/${orderId}/${status}`);
      toast.success(`Order marked as ${status.toUpperCase()}.`);
      await fetchOrders();
    } catch (err) {
      console.error(`Failed to mark order as ${status}:`, err);
      toast.error(`Failed to update status to ${status}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to permanently delete this order?')) return;
    try {
      setLoading(true);
      await API.delete(`/api/admin/orders/${orderId}/delete`);
      toast.success('Order deleted successfully.');
      await fetchOrders();
    } catch (err) {
      console.error('Failed to delete order:', err);
      toast.error('Failed to delete order.');
    } finally {
      setLoading(false);
    }
  };

  // Paging calculations
  const transactions = paymentsSummary?.recentTransactions || [];
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTx = transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#692CF5] via-[#8C52FF] to-[#FF5E97] p-4 md:p-8 flex items-center justify-center">
      {/* FLOATING WHITE CARD CONTAINER */}
      <div className="bg-[#F4F5FA] rounded-2xl shadow-2xl w-full max-w-7xl overflow-hidden flex flex-col lg:flex-row min-h-[85vh] border border-white/10">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="w-full lg:w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col p-5">
          {/* Brand/Logo */}
          <div className="flex items-center gap-2.5 mb-8 px-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-[#9155FD] to-[#C29FFA] rounded-lg flex items-center justify-center text-white font-serif font-black text-lg shadow-sm shadow-[#9155FD]/30">
              e
            </div>
            <div>
              <h2 className="font-serif text-lg font-black tracking-wider text-gray-800 leading-none">eMART</h2>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 block">Admin Board</span>
            </div>
          </div>

          <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3 px-3">Main Navigation</h3>
          
          <nav className="space-y-1.5 flex-1">
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all rounded-r-full -ml-5 pl-9 cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-gradient-to-r from-[#9155FD] to-[#AC80FF] text-white shadow-md shadow-[#9155FD]/25'
                  : 'text-gray-600 hover:text-brand-primary hover:bg-gray-50'
              }`}
            >
              <Package className="w-4 h-4" /> Products ({products.length})
            </button>
            
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all rounded-r-full -ml-5 pl-9 cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-[#9155FD] to-[#AC80FF] text-white shadow-md shadow-[#9155FD]/25'
                  : 'text-gray-600 hover:text-brand-primary hover:bg-gray-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4" /> Orders ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all rounded-r-full -ml-5 pl-9 cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-gradient-to-r from-[#9155FD] to-[#AC80FF] text-white shadow-md shadow-[#9155FD]/25'
                  : 'text-gray-600 hover:text-brand-primary hover:bg-gray-50'
              }`}
            >
              <CreditCard className="w-4 h-4" /> Payments & Revenue
            </button>
          </nav>

          {/* Quick Info */}
          <div className="border-t border-gray-100 pt-4 mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            System Live & Sec
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Header inside workspace */}
          <header className="bg-white border-b border-gray-100 px-6 md:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
                {activeTab === 'products' && 'Product Inventory Catalog'}
                {activeTab === 'orders' && 'Customer Orders List'}
                {activeTab === 'payments' && 'Financial Ledger & Performance'}
              </h2>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mt-0.5 block">
                {activeTab === 'products' && 'Add and manage catalog items'}
                {activeTab === 'orders' && 'Confirm, ship, and cancel customer purchases'}
                {activeTab === 'payments' && 'Gross receipts, sales channel trends, and billing'}
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading || paymentsLoading}
                className="flex items-center gap-1.5 border border-gray-250 hover:border-[#9155FD] text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md transition-all text-gray-650 bg-white cursor-pointer hover:text-[#9155FD]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Reload
              </button>

              {activeTab === 'products' && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1.5 bg-[#9155FD] hover:bg-[#8042eb] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-md transition-all shadow-sm cursor-pointer hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              )}
            </div>
          </header>

          {/* Main Content Pane */}
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            {(loading || paymentsLoading) && <Loader />}

            {!(loading || paymentsLoading) && (
              <div>
                {/* PRODUCTS TAB */}
                {activeTab === 'products' && (
                  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                            <th className="py-4.5 px-6">ID</th>
                            <th className="py-4.5 px-6">Preview</th>
                            <th className="py-4.5 px-6">Title / Brand</th>
                            <th className="py-4.5 px-6">Price</th>
                            <th className="py-4.5 px-6">Inventory Stock</th>
                            <th className="py-4.5 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                          {products.map((prod) => (
                            <tr key={prod.id} className="hover:bg-[#9155FD]/3 transition-colors odd:bg-white even:bg-gray-50/20">
                              <td className="py-4 px-6 font-semibold text-gray-400">#{prod.id}</td>
                              <td className="py-4 px-6">
                                <img
                                  src={prod.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=100'}
                                  alt={prod.title}
                                  className="w-10 h-14 object-cover border border-gray-100 rounded-md shadow-2xs"
                                />
                              </td>
                              <td className="py-4 px-6">
                                <p className="font-bold text-gray-800">{prod.title}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">{prod.brand}</p>
                              </td>
                              <td className="py-4 px-6 font-semibold text-gray-700">
                                <span className="font-serif">{formatPrice(prod.discountedPrice || prod.price)}</span>
                                {prod.discountedPrice < prod.price && (
                                  <span className="text-[10px] text-gray-400 line-through font-serif ml-2">{formatPrice(prod.price)}</span>
                                )}
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                  prod.quantity > 0 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {prod.quantity} Units
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right space-x-2">
                                <button
                                  onClick={() => handleOpenEditStock(prod)}
                                  className="p-2 border border-gray-200 hover:border-[#9155FD] text-gray-650 hover:text-[#9155FD] rounded-md transition-colors cursor-pointer bg-white"
                                  title="Edit stock"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="p-2 border border-gray-200 hover:border-red-650 text-gray-650 hover:text-red-650 rounded-md transition-colors cursor-pointer bg-white"
                                  title="Delete product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === 'orders' && (
                  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                            <th className="py-4.5 px-6">ID</th>
                            <th className="py-4.5 px-6">Customer / Contact</th>
                            <th className="py-4.5 px-6">Total / Items</th>
                            <th className="py-4.5 px-6">Shipment Status</th>
                            <th className="py-4.5 px-6 text-right">Update Order Stage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs">
                          {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-[#9155FD]/3 transition-colors odd:bg-white even:bg-gray-50/20">
                              <td className="py-4 px-6 font-semibold text-gray-400">#{order.id}</td>
                              <td className="py-4 px-6">
                                <p className="font-bold text-gray-800">
                                  {order.address?.firstName} {order.address?.lastName || order.user?.firstName || 'Valued Customer'}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{order.address?.mobileNumber || 'No phone number'}</p>
                              </td>
                              <td className="py-4 px-6">
                                <p className="font-bold text-gray-800 font-serif">
                                  {formatPrice(order.totalDiscountedPrice || order.totalPrice)}
                                </p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                                  {order.totalItems || order.orderItems?.length || 0} Items
                                </p>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                  order.status === 'DELIVERED'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : order.status === 'SHIPPED'
                                    ? 'bg-[#16B1FF]/10 text-[#16B1FF] border-[#16B1FF]/30'
                                    : order.status === 'CONFIRMED'
                                    ? 'bg-[#9155FD]/10 text-[#9155FD] border-[#9155FD]/30'
                                    : order.status === 'CANCELLED'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {order.status || 'PENDING'}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {order.status === 'PENDING' && (
                                    <button
                                      onClick={() => handleOrderStatusUpdate(order.id, 'confirm')}
                                      className="flex items-center gap-1 border border-blue-200 hover:bg-blue-50 text-[#9155FD] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md cursor-pointer"
                                    >
                                      <Check className="w-3 h-3" /> Confirm
                                    </button>
                                  )}
                                  {order.status === 'CONFIRMED' && (
                                    <button
                                      onClick={() => handleOrderStatusUpdate(order.id, 'shipped')}
                                      className="flex items-center gap-1 border border-indigo-200 hover:bg-[#16B1FF]/5 text-[#16B1FF] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md cursor-pointer"
                                    >
                                      <Truck className="w-3 h-3" /> Ship
                                    </button>
                                  )}
                                  {order.status === 'SHIPPED' && (
                                    <button
                                      onClick={() => handleOrderStatusUpdate(order.id, 'deliver')}
                                      className="flex items-center gap-1 border border-green-200 hover:bg-green-55 text-green-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md cursor-pointer"
                                    >
                                      <Check className="w-3 h-3" /> Deliver
                                    </button>
                                  )}
                                  {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                    <button
                                      onClick={() => handleOrderStatusUpdate(order.id, 'cancel')}
                                      className="flex items-center gap-1 border border-red-200 hover:bg-red-50 text-red-650 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md cursor-pointer"
                                    >
                                      <X className="w-3 h-3" /> Cancel
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteOrder(order.id)}
                                    className="p-1.5 border border-gray-250 hover:border-red-650 hover:bg-red-50 text-gray-550 hover:text-red-650 rounded-md transition-colors cursor-pointer bg-white"
                                    title="Delete Order Log"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* PAYMENTS TAB */}
                {activeTab === 'payments' && paymentsSummary && (
                  <div className="space-y-8">
                    {/* Summary Metric Cards (Materio style: Clean white cards with small colored badge details) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      
                      {/* Revenue */}
                      <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Revenue</span>
                            <h4 className="text-2xl font-serif font-black text-gray-800 mt-2 truncate">
                              {formatPrice(paymentsSummary.totalRevenue)}
                            </h4>
                          </div>
                          <div className="w-10 h-10 bg-[#56CA00]/10 rounded-lg flex items-center justify-center text-[#56CA00]">
                            <IndianRupee className="w-5 h-5" />
                          </div>
                        </div>
                        <p className="text-[9px] mt-4 text-[#56CA00] uppercase tracking-wider font-bold">Live store earnings</p>
                      </div>

                      {/* Orders */}
                      <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Orders</span>
                            <h4 className="text-2xl font-black text-gray-800 mt-2">
                              {paymentsSummary.totalOrders}
                            </h4>
                          </div>
                          <div className="w-10 h-10 bg-[#9155FD]/10 rounded-lg flex items-center justify-center text-[#9155FD]">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        </div>
                        <p className="text-[9px] mt-4 text-[#9155FD] uppercase tracking-wider font-bold">Total billing cycles</p>
                      </div>

                      {/* AOV */}
                      <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Average Order</span>
                            <h4 className="text-2xl font-serif font-black text-gray-800 mt-2 truncate">
                              {formatPrice(Math.round(paymentsSummary.avgOrderValue))}
                            </h4>
                          </div>
                          <div className="w-10 h-10 bg-[#FFB400]/10 rounded-lg flex items-center justify-center text-[#FFB400]">
                            <Activity className="w-5 h-5" />
                          </div>
                        </div>
                        <p className="text-[9px] mt-4 text-[#FFB400] uppercase tracking-wider font-bold">Basket average size</p>
                      </div>

                      {/* Success Rate */}
                      <div className="bg-white p-6 rounded-xl shadow-xs border border-gray-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Success Ratio</span>
                            <h4 className="text-2xl font-black text-gray-800 mt-2">
                              {paymentsSummary.successRate.toFixed(1)}%
                            </h4>
                          </div>
                          <div className="w-10 h-10 bg-[#16B1FF]/10 rounded-lg flex items-center justify-center text-[#16B1FF]">
                            <Percent className="w-5 h-5" />
                          </div>
                        </div>
                        <p className="text-[9px] mt-4 text-[#16B1FF] uppercase tracking-wider font-bold">Paid checkouts conversion</p>
                      </div>
                    </div>

                    {/* Charts rows */}
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                      
                      {/* Bar Chart - Month trend */}
                      <div className="xl:col-span-2 bg-white border border-gray-100 rounded-xl p-6 shadow-xs">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                          <h3 className="text-xs uppercase font-black tracking-widest text-gray-700">
                            Monthly Revenue Trend (Last 6 Months)
                          </h3>
                          <span className="text-[9px] font-bold bg-[#9155FD]/10 text-[#9155FD] px-2 py-0.5 rounded-sm">Gross Sales</span>
                        </div>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={paymentsSummary.monthlyRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                              <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                              <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                              <Bar dataKey="revenue" fill="#9155FD" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Pie Chart - Method Share */}
                      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs flex flex-col">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                          <h3 className="text-xs uppercase font-black tracking-widest text-gray-700">
                            Payment Shares
                          </h3>
                        </div>
                        <div className="h-56 relative flex-1">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={paymentsSummary.byPaymentMethod}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={75}
                                paddingAngle={3}
                                dataKey="amount"
                                nameKey="method"
                              >
                                {paymentsSummary.byPaymentMethod.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        {/* Custom Legend */}
                        <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-500 uppercase mt-4">
                          {paymentsSummary.byPaymentMethod.map((item, idx) => (
                            <div key={item.method} className="flex items-center gap-1.5 truncate">
                              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                              <span className="truncate">{item.method} ({Math.round(item.amount / (paymentsSummary.totalRevenue || 1) * 100)}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Daily Volume Area Chart */}
                    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xs">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
                        <h3 className="text-xs uppercase font-black tracking-widest text-gray-700">
                          Daily Checkout Orders Count (Last 30 Days)
                        </h3>
                        <span className="text-[9px] font-bold bg-[#16B1FF]/10 text-[#16B1FF] px-2 py-0.5 rounded-sm">Order Counts</span>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={paymentsSummary.dailyOrders} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#9155FD" stopOpacity={0.35}/>
                                <stop offset="95%" stopColor="#9155FD" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <XAxis dataKey="date" tickFormatter={(str) => str ? str.substring(8, 10) + '/' + str.substring(5, 7) : ''} tick={{ fontSize: 9, fontWeight: 700, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(value) => [value, 'OrdersPlaced']} contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #E5E7EB' }} />
                            <Area type="monotone" dataKey="count" stroke="#9155FD" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Recent Transactions Table */}
                    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs">
                      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-xs uppercase font-black tracking-widest text-gray-700">
                          Recent Billing & Transactions Ledger
                        </h3>
                        <span className="text-[9px] font-bold bg-[#FFB400]/10 text-[#FFB400] px-2 py-0.5 rounded-sm">Audit logs</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                              <th className="py-4 px-6">Order ID</th>
                              <th className="py-4 px-6">Customer</th>
                              <th className="py-4 px-6">Amount</th>
                              <th className="py-4 px-6">Payment Mode</th>
                              <th className="py-4 px-6">Status</th>
                              <th className="py-4 px-6">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-xs">
                            {paginatedTx.map((txItem) => (
                              <tr key={txItem.orderId} className="hover:bg-[#9155FD]/3 transition-colors odd:bg-white even:bg-gray-50/20">
                                <td className="py-3.5 px-6 font-bold text-gray-400">#{txItem.orderId}</td>
                                <td className="py-3.5 px-6 font-bold text-gray-700">{txItem.customerName}</td>
                                <td className="py-3.5 px-6 font-bold text-gray-800 font-serif">{formatPrice(txItem.amount)}</td>
                                <td className="py-3.5 px-6 font-semibold text-gray-500 uppercase tracking-wider">{txItem.paymentMethod}</td>
                                <td className="py-3.5 px-6">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                    txItem.status === 'SUCCESS' || txItem.status === 'COMPLETED' || txItem.status === 'PAID'
                                      ? 'bg-green-50 text-green-700 border-green-200'
                                      : txItem.status === 'FAILED'
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}>
                                    {txItem.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-6 text-gray-400">{new Date(txItem.date).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-450">
                            Page {currentPage} of {totalPages}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className="p-1.5 border border-gray-200 hover:border-[#9155FD] hover:bg-white text-gray-500 hover:text-[#9155FD] disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-all bg-white"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                              disabled={currentPage === totalPages}
                              className="p-1.5 border border-gray-200 hover:border-[#9155FD] hover:bg-white text-gray-500 hover:text-[#9155FD] disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-all bg-white"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MODAL - EDIT PRODUCT INVENTORY STOCK */}
      {showEditStockModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowEditStockModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs"></div>
          <div className="bg-white border border-gray-100 shadow-2xl p-6 rounded-xl w-full max-w-sm relative z-10">
            <h3 className="font-serif text-lg font-bold text-brand-primary uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">
              Update Inventory Stock
            </h3>
            <p className="text-xs text-gray-400 mb-6 uppercase tracking-wider">
              Product: <span className="text-brand-primary font-bold">{selectedProduct.title}</span>
            </p>
            <form onSubmit={handleUpdateStockSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-600">
                  New Quantity Available
                </label>
                <input
                  type="number"
                  required
                  value={newStockQty}
                  onChange={(e) => setNewStockQty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#9155FD] bg-white"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditStockModal(false)}
                  className="w-1/2 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold uppercase tracking-widest py-3 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-[#9155FD] hover:bg-[#8042eb] text-white text-xs font-bold uppercase tracking-widest py-3 rounded-md cursor-pointer"
                >
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER / SIDE OVERLAY - ADD NEW PRODUCT FORM */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div onClick={() => setShowAddForm(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs"></div>
          <div className="relative w-full max-w-2xl bg-[#F4F5FA] h-full flex flex-col shadow-2xl p-6 md:p-8 overflow-y-auto z-10">
            <div className="flex justify-between items-center border-b border-gray-150 pb-4 mb-6 bg-white -mx-6 -mt-6 md:-mx-8 md:-mt-8 p-6 md:p-8">
              <h2 className="font-serif text-2xl font-bold uppercase tracking-wider text-gray-800 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#9155FD]" /> New Catalog Product
              </h2>
              <button onClick={() => setShowAddForm(false)} className="p-1.5 text-gray-400 hover:text-[#9155FD] cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-6">
              {/* Row: Title and Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">Product Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={productForm.title}
                    onChange={handleProductFormChange}
                    placeholder="Classic Linen Shirt"
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#9155FD] bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    required
                    value={productForm.brand}
                    onChange={handleProductFormChange}
                    placeholder="eMart Custom"
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#9155FD] bg-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">Product Description</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={productForm.description}
                  onChange={handleProductFormChange}
                  placeholder="Describe the fabric weave, fit notes, wash instructions, and general cut..."
                  className="w-full p-4 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#9155FD] placeholder-gray-400 bg-white"
                ></textarea>
              </div>

              {/* Row: Image URL and Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    required
                    value={productForm.imageUrl}
                    onChange={handleProductFormChange}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#9155FD] bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">Color</label>
                  <input
                    type="text"
                    name="color"
                    required
                    value={productForm.color}
                    onChange={handleProductFormChange}
                    placeholder="Off-White"
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-[#9155FD] bg-white"
                  />
                </div>
              </div>

              {/* Category Tree 3-levels */}
              <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-100">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#9155FD] border-b border-gray-105 pb-1.5">Category Placement Hierarchy</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Top level (Gender)</label>
                    <select
                      name="topLevelCategory"
                      value={productForm.topLevelCategory}
                      onChange={handleProductFormChange}
                      className="w-full p-2 text-xs border border-gray-200 bg-white rounded-md focus:outline-none cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Second level</label>
                    <select
                      name="secondLevelCategory"
                      value={productForm.secondLevelCategory}
                      onChange={handleProductFormChange}
                      className="w-full p-2 text-xs border border-gray-200 bg-white rounded-md focus:outline-none cursor-pointer"
                    >
                      <option value="Clothing">Clothing</option>
                      <option value="Footwear">Footwear</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Third level (Type)</label>
                    <input
                      type="text"
                      name="thirdLevelCategory"
                      required
                      value={productForm.thirdLevelCategory}
                      onChange={handleProductFormChange}
                      placeholder="Shirt / Gown / Jeans"
                      className="w-full px-3 py-2 text-xs border border-gray-200 bg-white rounded-md focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Price calculations */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">Original Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    required
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    placeholder="1999"
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-md focus:outline-none bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">Discounted Price (₹)</label>
                  <input
                    type="number"
                    name="discountedPrice"
                    required
                    value={productForm.discountedPrice}
                    onChange={handleProductFormChange}
                    placeholder="1499"
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-md focus:outline-none bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">Discount % (AutoCalculated)</label>
                  <input
                    type="number"
                    name="discountPercent"
                    value={productForm.discountPercent}
                    onChange={handleProductFormChange}
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 bg-gray-50 rounded-md focus:outline-none text-gray-500"
                    readOnly
                  />
                </div>
              </div>

              {/* Size Allocations */}
              <div className="space-y-3 bg-white p-5 rounded-xl border border-gray-100">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#9155FD] border-b border-gray-105 pb-1.5">Inventory Size Allocations</h4>
                <div className="grid grid-cols-5 gap-3">
                  {Object.keys(sizeQuantities).map(sz => (
                    <div key={sz} className="space-y-1 text-center">
                      <label className="text-xs font-bold text-gray-500">{sz}</label>
                      <input
                        type="number"
                        min="0"
                        value={sizeQuantities[sz]}
                        onChange={(e) => handleSizeQtyChange(sz, e.target.value)}
                        className="w-full text-center py-2 border border-gray-200 rounded-md text-xs focus:outline-none focus:border-[#9155FD] bg-white font-bold"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-gray-400 mt-2">
                  Total inventory stock quantity will sum to the total of size allocations above.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#9155FD] hover:bg-[#8042eb] text-white text-xs uppercase tracking-widest font-bold py-4 rounded-md transition-colors shadow-md cursor-pointer hover:shadow-lg"
              >
                Create Catalog Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
