import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Calendar, ShieldCheck, MapPin } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

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
            <h3 className="text-xs uppercase font-bold tracking-widest text-brand-primary border-b border-gray-150 pb-3 mb-6 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-accent" /> Saved Shipping Addresses
            </h3>

            {!user.addresses || user.addresses.length === 0 ? (
              <p className="text-xs font-medium text-gray-400 italic">
                No saved addresses found. Addresses will be saved automatically when you place an order.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {user.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="border border-gray-200 p-4 rounded-sm hover:border-brand-primary hover:shadow-sm transition-all duration-300 relative group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">
                        {addr.firstName} {addr.lastName}
                      </p>
                      <MapPin className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand-accent transition-colors" />
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed font-light">
                      {addr.streetAddress},<br />
                      {addr.cityName}, {addr.state} - {addr.zipCode}
                    </p>
                    {addr.mobileNumber && (
                      <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">
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
