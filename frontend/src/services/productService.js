import api from './api';

const productService = {
  // Public endpoints
  getAllProducts: () => {
    return api.get('/products/public/all');
  },

  getProductById: (id) => {
    return api.get(`/products/public/${id}`);
  },

  searchProducts: (keyword) => {
    return api.get('/products/public/search', { params: { keyword } });
  },

  getProductsByCategory: (category) => {
    return api.get(`/products/public/category/${category}`);
  },

  getProductsByPetType: (petType) => {
    return api.get(`/products/public/pet-type/${petType}`);
  },

  // Admin endpoints
  createProduct: (productData) => {
    return api.post('/products', productData);
  },

  updateProduct: (id, productData) => {
    return api.put(`/products/${id}`, productData);
  },

  deleteProduct: (id) => {
    return api.delete(`/products/${id}`);
  },

  updateProductQuantity: (id, quantity) => {
    return api.put(`/products/${id}/quantity`, null, { params: { quantity } });
  },
};

export default productService;