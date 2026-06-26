export const SHOP_CATEGORIES = [
  'Top Wear',
  'Bottom Wear',
  'Footwear',
  'Ethnic Wear',
  'Winter Wear',
  'Accessories'
]

export const GENDER_LABELS = {
  MEN: 'Men',
  WOMEN: 'Women'
}

export const getProductsPath = (gender, category = '') => {
  const params = new URLSearchParams()
  if (gender) params.set('gender', gender)
  if (category) params.set('category', category)
  const query = params.toString()
  return query ? `/products?${query}` : '/products'
}
