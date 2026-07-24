import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, Shield, Eye, EyeOff } from 'lucide-react';

export const Register = () => {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    password: '',
    role: 'CUSTOMER'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    const { firstName, lastName, email, mobileNumber, password, role } = formData;

    if (!firstName || !lastName || !email || !mobileNumber || !password || !role) {
      setValidationError('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters long.');
      return;
    }

    if (!/^\d{10}$/.test(mobileNumber)) {
      setValidationError('Please enter a valid 10-digit mobile number.');
      return;
    }

    const success = await signup(formData);
    if (success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gray-50">
      <div className="w-full max-w-lg bg-white border border-gray-100 shadow-xl rounded-sm p-8 md:p-10">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl font-bold uppercase tracking-wider text-brand-primary">
            Create Account
          </h2>
          <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest font-semibold">
            Join eMart today
          </p>
        </div>

        {validationError && (
          <div className="bg-red-50 text-red-600 text-xs py-3 px-4 mb-6 border-l-4 border-red-500 rounded-sm font-medium">
            {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                First Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Vaibhav"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-sm placeholder-gray-400 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                Last Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Sharma"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-sm placeholder-gray-400 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="vaibhav.sharma@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-sm placeholder-gray-400 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
              Mobile Number
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                name="mobileNumber"
                required
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-sm placeholder-gray-400 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-gray-200 rounded-sm placeholder-gray-400 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-brand-primary"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>



          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-light text-white text-xs uppercase tracking-widest font-bold py-3.5 rounded-sm transition-all duration-200 flex items-center justify-center gap-2 border border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="border-t border-gray-100 my-8"></div>

        <div className="text-center text-xs text-gray-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-accent hover:text-brand-accent-dark font-bold hover:underline transition-colors uppercase tracking-wider">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;