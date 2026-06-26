import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile
  const fetchUserProfile = async (authToken) => {
    try {
      const response = await API.get('/api/users/profile', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
      return null;
    }
  };

  // Sync token and load user profile on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken) {
        setToken(storedToken);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setLoading(false);
          // Refresh profile in background
          fetchUserProfile(storedToken).catch(() => {});
        } else {
          await fetchUserProfile(storedToken);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/login', { email, password });
      const { jwt } = response.data;
      
      localStorage.setItem('token', jwt);
      setToken(jwt);
      
      const profile = await fetchUserProfile(jwt);
      if (profile) {
        toast.success(`Welcome back, ${profile.firstName}!`);
        return true;
      }
      return false;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (signupData) => {
    setLoading(true);
    try {
      const response = await API.post('/auth/signup', signupData);
      const { jwt } = response.data;
      
      localStorage.setItem('token', jwt);
      setToken(jwt);
      
      const profile = await fetchUserProfile(jwt);
      if (profile) {
        toast.success('Registration successful! Welcome to eMart.');
        return true;
      }
      return false;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully.');
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    refreshUser: () => fetchUserProfile(token)
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
