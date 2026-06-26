import React from 'react';
import { Link } from 'react-router-dom';

export const Register = () => {
  return (
    <div className="max-w-md mx-auto my-16 p-8 border border-gray-100 shadow-lg text-center">
      <h2 className="text-2xl font-bold uppercase tracking-wider text-brand-primary mb-6">
        Register
      </h2>
      <p className="text-xs text-gray-500 mb-6 uppercase tracking-wider">
        Signup Form Placeholder
      </p>
      <div className="text-xs text-gray-400">
        Already have an account? <Link to="/login" className="text-brand-accent hover:underline">Log in</Link>
      </div>
    </div>
  );
};
export default Register;