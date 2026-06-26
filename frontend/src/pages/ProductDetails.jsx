import React from 'react';
import { useParams } from 'react-router-dom';

export const ProductDetails = () => {
  const { id } = useParams();
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold uppercase tracking-wider text-brand-primary mb-4">
        Product Details
      </h1>
      <p className="text-gray-500 max-w-md mx-auto">
        Showing details for product: #{id}
      </p>
    </div>
  );
};
export default ProductDetails;
