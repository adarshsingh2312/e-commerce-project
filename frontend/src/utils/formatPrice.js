/**
 * Formats a numerical price into Indian Rupee format (₹) with en-IN comma separation.
 * @param {number|string} amount - The price amount to format
 * @returns {string} Formatted price string (e.g. ₹1,499)
 */
export const formatPrice = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) return '₹0';
  return `₹${numericAmount.toLocaleString('en-IN')}`;
};

export default formatPrice;
