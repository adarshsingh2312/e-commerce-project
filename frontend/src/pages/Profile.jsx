import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Calendar, ShieldCheck, MapPin, Trash2, Plus, X } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

export const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    streetAddress: '',
    cityName: '',
    state: '',
    zipCode: '',
    mobileNumber: '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post(`/api/users/${user.id}/addresses`, formData);
      toast.success('Address saved successfully!');
      setFormData({
        firstName: '',
        lastName: '',
        streetAddress: '',
        cityName: '',
        state: '',
        zipCode: '',
        mobileNumber: '',
      });
      setShowForm(false);
      await refreshUser();
    } catch (err) {
      console.error('Failed to add address:', err);
      toast.error('Could not save address. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to remove this address?')) {
      return;
    }
    try {
      await API.delete(`/api/users/addresses/${addressId}`);
      toast.success('Address removed successfully.');
      await refreshUser();
    } catch (err) {
      console.error('Failed to delete address:', err);
      toast.error('Could not remove address.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 min-h-[75vh]">
      <h1 className="font-serif text-3xl font-bold uppercase tracking-wider text-brand-primary mb-8 text-center md:text-left">
        My Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Account summary left side */}
        <div className="bg-gray-50 border border-gray-150 p-6 rounded-sm text-center">
          <div className="w-20 h-20 bg-brand-primary text-white rounded-full flex items-center justify-center text-3xl font-serif font-black mx-auto mb-4 uppercase shadow-md">
            {user.firstName ? user.firstName[0] : 'U'}
          </div>
          <h2 className="text-lg font-bold text-brand-primary uppercase tracking-wide">
            {user.firstName} {user.lastName}
          </h2>
          <span className="inline-block mt-2 bg-brand-accent/10 border border-brand-accent/35 text-brand-accent text-[9px] font-bold tracking-widest px-3 py-1 rounded-full uppercase">
            {user.role} Account
          </span>
          
          <div className="border-t border-gray-250 my-6"></div>
          
          <div className="space-y-3.5 text-left text-xs font-semibold text-gray-600">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.mobileNumber && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{user.mobileNumber}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Joined: {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Saved Addresses list right side */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-150 p-6 md:p-8 rounded-sm">
            <div className="flex justify-between items-center border-b border-gray-150 pb-3 mb-6">
              <h3 className="text-xs uppercase font-bold tracking-widest text-brand-primary flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-accent" /> Saved Shipping Addresses
              </h3>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-brand-accent hover:text-brand-accent-dark transition-colors"
              >
                {showForm ? (
                  <>
                    <X className="w-3.5 h-3.5" /> Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Add New
                  </>
                )}
              </button>
            </div>

            {/* Expandable Add Address Form */}
            {showForm && (
              <form onSubmit={handleAddAddress} className="mb-8 p-5 bg-gray-50 border border-gray-150 rounded-sm space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-primary border-b border-gray-200 pb-1.5 mb-3">
                  Enter Shipping Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Adarsh"
                      className="w-full px-3 py-2 text-xs border border-gray-200 bg-white rounded-sm focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Singh"
                      className="w-full px-3 py-2 text-xs border border-gray-200 bg-white rounded-sm focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Street Address</label>
                  <input
                    type="text"
                    name="streetAddress"
                    required
                    value={formData.streetAddress}
                    onChange={handleChange}
                    placeholder="Flat 101, Park Avenue"
                    className="w-full px-3 py-2 text-xs border border-gray-200 bg-white rounded-sm focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">City</label>
                    <input
                      type="text"
                      name="cityName"
                      required
                      value={formData.cityName}
                      onChange={handleChange}
                      placeholder="Mumbai"
                      className="w-full px-3 py-2 text-xs border border-gray-200 bg-white rounded-sm focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">State</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="Maharashtra"
                      className="w-full px-3 py-2 text-xs border border-gray-200 bg-white rounded-sm focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="400001"
                      className="w-full px-3 py-2 text-xs border border-gray-200 bg-white rounded-sm focus:outline-none focus:border-brand-accent"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Mobile Number</label>
                  <input
                    type="text"
                    name="mobileNumber"
                    required
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="9876543210"
                    className="w-full px-3 py-2 text-xs border border-gray-200 bg-white rounded-sm focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand-primary hover:bg-brand-light text-white text-[10px] uppercase tracking-widest font-bold py-3 rounded-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Address'}
                </button>
              </form>
            )}

            {!user.addresses || user.addresses.length === 0 ? (
              <p className="text-xs font-medium text-gray-400 italic">
                No saved addresses found. Addresses will be saved automatically when you place an order.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {user.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="border border-gray-200 p-4 rounded-sm hover:border-brand-primary hover:shadow-sm transition-all duration-300 relative group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                          {addr.firstName} {addr.lastName}
                        </p>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Remove Address"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed font-light">
                        {addr.streetAddress},<br />
                        {addr.cityName}, {addr.state} - {addr.zipCode}
                      </p>
                    </div>
                    {addr.mobileNumber && (
                      <p className="text-[10px] text-gray-400 mt-3 font-bold uppercase tracking-wider">
                        Ph: {addr.mobileNumber}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-50 border border-gray-150 p-6 rounded-sm flex items-start gap-4">
            <ShieldCheck className="w-8 h-8 text-green-500 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase text-brand-primary mb-1">Privacy & Security</h4>
              <p className="text-[10px] text-gray-500 leading-relaxed font-light">
                Your profile information and purchase history are fully encrypted and protected. We do not share your physical address details or payment credentials with third-party networks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
