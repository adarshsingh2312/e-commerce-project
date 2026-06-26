import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package, ShoppingBag, Eye, Check, Truck, X, RefreshCw, Layers } from 'lucide-react';
import API from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { Loader } from '../components/RouteGuards';
import toast from 'react-hot-toast';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      // Sort orders by id descending
      const sorted = (response.data || []).sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (err) {
      console.error('Failed to load admin orders:', err);
      toast.error('Could not retrieve order list.');
    }
  };

  const loadData = async () => {
    setLoading(true);
    if (activeTab === 'products') {
      await fetchProducts();
    } else {
      await fetchOrders();
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
    } else {
      await fetchOrders();
    }
    setRefreshing(false);
    toast.success('Data reloaded.');
  };

  // Product actions
  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => {
      const updated = { ...prev, [name]: value };
      // Auto calculate discount percentage if price/discountedPrice is filled
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
    
    // Convert size quantities map to backend size list
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
      // Reset form
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
      // Backend only updates quantity when receiving update request
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

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-wider text-brand-primary">
            Admin Workspace
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-semibold">
            Manage your store inventory, shipments, and billing logs
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 border border-gray-200 hover:border-brand-primary text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-sm transition-all text-gray-700 bg-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Reload
          </button>

          {activeTab === 'products' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 bg-brand-accent hover:bg-brand-accent-dark text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm transition-all shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-gray-200 mb-8 gap-6 text-xs uppercase tracking-widest font-bold">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-4 border-b-2 flex items-center gap-2 ${
            activeTab === 'products'
              ? 'border-brand-accent text-brand-primary font-black'
              : 'border-transparent text-gray-400 hover:text-brand-primary'
          }`}
        >
          <Package className="w-4 h-4" /> Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 border-b-2 flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-brand-accent text-brand-primary font-black'
              : 'border-transparent text-gray-400 hover:text-brand-primary'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Orders ({orders.length})
        </button>
      </div>

      {loading && <Loader />}

      {!loading && (
        <div>
          {/* PRODUCT TAB CONTENT */}
          {activeTab === 'products' && (
            <div className="bg-white border border-gray-150 rounded-sm overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                      <th className="py-4 px-6">ID</th>
                      <th className="py-4 px-6">Preview</th>
                      <th className="py-4 px-6">Title / Brand</th>
                      <th className="py-4 px-6">Original / Discounted</th>
                      <th className="py-4 px-6">Stock</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {products.map(prod => (
                      <tr key={prod.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-gray-400">#{prod.id}</td>
                        <td className="py-4 px-6">
                          <img
                            src={prod.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=100'}
                            alt={prod.title}
                            className="w-10 h-14 object-cover border border-gray-100 rounded-sm"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-brand-primary">{prod.title}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">{prod.brand}</p>
                        </td>
                        <td className="py-4 px-6 font-semibold text-gray-700">
                          <span className="font-serif">{formatPrice(prod.discountedPrice || prod.price)}</span>
                          {prod.discountedPrice < prod.price && (
                            <span className="text-[10px] text-gray-400 line-through font-serif ml-2">{formatPrice(prod.price)}</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-sm text-[10px] font-bold ${
                            prod.quantity > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {prod.quantity} Units
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditStock(prod)}
                            className="p-2 border border-gray-200 hover:border-brand-primary text-gray-600 hover:text-brand-primary rounded-sm transition-colors"
                            title="Edit stock inventory"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-2 border border-gray-200 hover:border-red-600 text-gray-600 hover:text-red-600 rounded-sm transition-colors"
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

          {/* ORDERS TAB CONTENT */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-gray-150 rounded-sm overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-150 text-[10px] uppercase font-bold tracking-widest text-gray-500">
                      <th className="py-4 px-6">ID</th>
                      <th className="py-4 px-6">Customer / Contact</th>
                      <th className="py-4 px-6">Total / Items</th>
                      <th className="py-4 px-6">Shipment Status</th>
                      <th className="py-4 px-6 text-right">Update Order Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-gray-400">#{order.id}</td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-brand-primary">
                            {order.address?.firstName} {order.address?.lastName || order.user?.firstName || 'Valued User'}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{order.address?.mobileNumber || 'No phone'}</p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-brand-primary font-serif">
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
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : order.status === 'CONFIRMED'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
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
                                className="flex items-center gap-1 border border-blue-200 text-blue-600 hover:bg-blue-50 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-sm"
                              >
                                <Check className="w-3 h-3" /> Confirm
                              </button>
                            )}
                            {order.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleOrderStatusUpdate(order.id, 'shipped')}
                                className="flex items-center gap-1 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-sm"
                              >
                                <Truck className="w-3 h-3" /> Ship
                              </button>
                            )}
                            {order.status === 'SHIPPED' && (
                              <button
                                onClick={() => handleOrderStatusUpdate(order.id, 'deliver')}
                                className="flex items-center gap-1 border border-green-200 text-green-600 hover:bg-green-50 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-sm"
                              >
                                <Check className="w-3 h-3" /> Deliver
                              </button>
                            )}
                            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                              <button
                                onClick={() => handleOrderStatusUpdate(order.id, 'cancel')}
                                className="flex items-center gap-1 border border-red-200 text-red-650 hover:bg-red-50 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-sm"
                              >
                                <X className="w-3 h-3" /> Cancel
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="p-1.5 border border-gray-250 hover:border-red-650 hover:bg-red-50 text-gray-500 hover:text-red-650 rounded-sm transition-colors"
                              title="Delete Order Logs"
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
        </div>
      )}

      {/* MODAL - EDIT PRODUCT INVENTORY STOCK */}
      {showEditStockModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowEditStockModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs"></div>
          <div className="bg-white border border-gray-100 shadow-2xl p-6 rounded-sm w-full max-w-sm relative z-10">
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
                  className="w-full px-3 py-2 border border-gray-250 rounded-sm text-sm focus:outline-none focus:border-brand-accent"
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditStockModal(false)}
                  className="w-1/2 border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold uppercase tracking-widest py-3 rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-brand-primary hover:bg-brand-light text-white text-xs font-bold uppercase tracking-widest py-3 rounded-sm"
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
          <div className="relative w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl p-6 md:p-8 overflow-y-auto z-10">
            <div className="flex justify-between items-center border-b border-gray-150 pb-4 mb-6">
              <h2 className="font-serif text-2xl font-bold uppercase tracking-wider text-brand-primary flex items-center gap-2">
                <Layers className="w-5 h-5 text-brand-accent" /> New Catalog Product
              </h2>
              <button onClick={() => setShowAddForm(false)} className="p-1.5 text-gray-400 hover:text-brand-primary">
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
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-brand-accent"
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
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-brand-accent"
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
                  className="w-full p-4 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-brand-accent placeholder-gray-400"
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
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-brand-accent"
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
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-sm focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              {/* Category Tree 3-levels */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-sm border border-gray-200">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-primary border-b border-gray-250 pb-1.5">Category Placement Hierarchy</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Top level (Gender)</label>
                    <select
                      name="topLevelCategory"
                      value={productForm.topLevelCategory}
                      onChange={handleProductFormChange}
                      className="w-full p-2 text-xs border border-gray-200 bg-white rounded-sm focus:outline-none"
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
                      className="w-full p-2 text-xs border border-gray-200 bg-white rounded-sm focus:outline-none"
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
                      className="w-full px-3 py-2 text-xs border border-gray-250 bg-white rounded-sm focus:outline-none"
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
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-sm focus:outline-none"
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
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 rounded-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">Discount % (AutoCalculated)</label>
                  <input
                    type="number"
                    name="discountPercent"
                    value={productForm.discountPercent}
                    onChange={handleProductFormChange}
                    className="w-full px-4 py-2.5 text-xs border border-gray-200 bg-gray-50 rounded-sm focus:outline-none text-gray-500"
                    readOnly
                  />
                </div>
              </div>

              {/* Size Allocations */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-sm border border-gray-200">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-primary border-b border-gray-250 pb-1.5">Inventory Size Allocations</h4>
                <div className="grid grid-cols-5 gap-3">
                  {Object.keys(sizeQuantities).map(sz => (
                    <div key={sz} className="space-y-1 text-center">
                      <label className="text-xs font-bold text-gray-500">{sz}</label>
                      <input
                        type="number"
                        min="0"
                        value={sizeQuantities[sz]}
                        onChange={(e) => handleSizeQtyChange(sz, e.target.value)}
                        className="w-full text-center py-2 border border-gray-200 rounded-sm text-xs focus:outline-none focus:border-brand-accent bg-white font-bold"
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
                className="w-full bg-brand-primary hover:bg-brand-light text-white text-xs uppercase tracking-widest font-bold py-4 rounded-sm transition-colors shadow-md"
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
