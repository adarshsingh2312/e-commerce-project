import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    // Prevent double execution in React 18 StrictMode
    if (processedRef.current) return;
    processedRef.current = true;

    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error(error);
      navigate('/login', { replace: true });
      return;
    }

    if (token) {
      loginWithToken(token).then((success) => {
        if (success) {
          navigate('/', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      });
    } else {
      toast.error('Authentication failed: No token received.');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, loginWithToken]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-sm font-semibold tracking-wider uppercase text-gray-600">
        Completing Google Sign In...
      </p>
    </div>
  );
};

export default OAuthCallback;
