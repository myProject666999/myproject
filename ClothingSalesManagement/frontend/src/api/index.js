import api from './axios';

export const authApi = {
  login: (data) => api.post('/login', data),
  register: (data) => api.post('/register', data),
  logout: () => api.post('/logout'),
  getCurrentUser: () => api.get('/user/me'),
  updateProfile: (data) => api.put('/user/profile', data),
};

export const publicApi = {
  getBanners: () => api.get('/banners'),
  getCategories: () => api.get('/categories'),
  getProducts: (params) => api.get('/products', { params }),
  getProductDetail: (id) => api.get(`/products/${id}`),
  getHotProducts: () => api.get('/hot-products'),
  getNewProducts: () => api.get('/new-products'),
  getRecommendProducts: () => api.get('/recommend-products'),
};

export const userApi = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateCart: (id, data) => api.put(`/cart/${id}`, data),
  removeFromCart: (id) => api.delete(`/cart/${id}`),
  clearCart: () => api.delete('/cart'),

  getAddresses: () => api.get('/addresses'),
  createAddress: (data) => api.post('/addresses', data),
  updateAddress: (id, data) => api.put(`/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/addresses/${id}`),

  getOrders: (params) => api.get('/orders', { params }),
  getOrderDetail: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  payOrder: (id) => api.post(`/orders/${id}/pay`),
};

export const adminApi = {
  getUsers: (params) => api.get('/admin/users', { params }),
  disableUser: (id) => api.put(`/admin/users/${id}/disable`),
  enableUser: (id) => api.put(`/admin/users/${id}/enable`),

  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  getProducts: (params) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  onShelfProduct: (id) => api.put(`/admin/products/${id}/on-shelf`),
  offShelfProduct: (id) => api.put(`/admin/products/${id}/off-shelf`),

  getBanners: () => api.get('/admin/banners'),
  createBanner: (data) => api.post('/admin/banners', data),
  updateBanner: (id, data) => api.put(`/admin/banners/${id}`, data),
  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),

  getHotProducts: () => api.get('/admin/hot-products'),
  createHotProduct: (data) => api.post('/admin/hot-products', data),
  deleteHotProduct: (id) => api.delete(`/admin/hot-products/${id}`),

  getNewProducts: () => api.get('/admin/new-products'),
  createNewProduct: (data) => api.post('/admin/new-products', data),
  deleteNewProduct: (id) => api.delete(`/admin/new-products/${id}`),

  getRecommendProducts: () => api.get('/admin/recommend-products'),
  createRecommendProduct: (data) => api.post('/admin/recommend-products', data),
  deleteRecommendProduct: (id) => api.delete(`/admin/recommend-products/${id}`),

  getOrders: (params) => api.get('/admin/orders', { params }),
  shipOrder: (id) => api.put(`/admin/orders/${id}/ship`),
  deliverOrder: (id) => api.put(`/admin/orders/${id}/deliver`),
  closeOrder: (id) => api.put(`/admin/orders/${id}/close`),
};

export const uploadApi = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
