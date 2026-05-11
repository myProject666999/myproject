import request from './request'

export const authApi = {
  register: (data) => request.post('/auth/register', data),
  login: (data) => request.post('/auth/login', data),
  adminLogin: (data) => request.post('/auth/admin-login', data)
}

export const publicApi = {
  getBanners: () => request.get('/public/banners'),
  getNews: (params) => request.get('/public/news', { params }),
  getNewsDetail: (id) => request.get(`/public/news/${id}`),
  getCategories: () => request.get('/public/categories'),
  getProducts: (params) => request.get('/public/products', { params }),
  getHotProducts: (params) => request.get('/public/products/hot', { params }),
  getNewProducts: (params) => request.get('/public/products/new', { params }),
  getProduct: (id) => request.get(`/public/products/${id}`),
  getComments: (id, params) => request.get(`/public/products/${id}/comments`, { params })
}

export const userApi = {
  getProfile: () => request.get('/user/profile'),
  updateProfile: (data) => request.put('/user/profile', data),
  changePassword: (data) => request.put('/user/password', data),
  
  getAddresses: () => request.get('/user/addresses'),
  createAddress: (data) => request.post('/user/addresses', data),
  updateAddress: (id, data) => request.put(`/user/addresses/${id}`, data),
  deleteAddress: (id) => request.delete(`/user/addresses/${id}`),
  setDefaultAddress: (id) => request.put(`/user/addresses/${id}/default`),
  
  getCart: () => request.get('/user/cart'),
  getCartCount: () => request.get('/user/cart/count'),
  addToCart: (data) => request.post('/user/cart', data),
  updateCart: (id, data) => request.put(`/user/cart/${id}`, data),
  deleteCart: (id) => request.delete(`/user/cart/${id}`),
  clearCart: () => request.delete('/user/cart'),
  
  toggleFavorite: (id) => request.post(`/user/products/${id}/favorite`),
  isFavorite: (id) => request.get(`/user/products/${id}/favorite`),
  getFavorites: (params) => request.get('/user/favorites', { params }),
  addComment: (id, data) => request.post(`/user/products/${id}/comments`, data),
  
  getOrders: (params) => request.get('/user/orders', { params }),
  getOrder: (id) => request.get(`/user/orders/${id}`),
  createOrder: (data) => request.post('/user/orders', data),
  payOrder: (id) => request.post(`/user/orders/${id}/pay`),
  cancelOrder: (id) => request.post(`/user/orders/${id}/cancel`),
  confirmOrder: (id) => request.post(`/user/orders/${id}/confirm`),
  refundOrder: (id) => request.post(`/user/orders/${id}/refund`)
}

export const adminApi = {
  getDashboardStats: () => request.get('/admin/dashboard/stats'),
  
  getUsers: (params) => request.get('/admin/users', { params }),
  deleteUser: (id) => request.delete(`/admin/users/${id}`),
  updateUserStatus: (id, data) => request.put(`/admin/users/${id}/status`, data),
  
  getCategories: () => request.get('/admin/categories'),
  createCategory: (data) => request.post('/admin/categories', data),
  updateCategory: (id, data) => request.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => request.delete(`/admin/categories/${id}`),
  
  getProducts: (params) => request.get('/admin/products', { params }),
  createProduct: (data) => request.post('/admin/products', data),
  updateProduct: (id, data) => request.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => request.delete(`/admin/products/${id}`),
  getProductComments: (id, params) => request.get(`/admin/products/${id}/comments`, { params }),
  deleteComment: (id) => request.delete(`/admin/comments/${id}`),
  
  getBanners: () => request.get('/admin/banners'),
  createBanner: (data) => request.post('/admin/banners', data),
  updateBanner: (id, data) => request.put(`/admin/banners/${id}`, data),
  deleteBanner: (id) => request.delete(`/admin/banners/${id}`),
  
  getNews: (params) => request.get('/admin/news', { params }),
  createNews: (data) => request.post('/admin/news', data),
  updateNews: (id, data) => request.put(`/admin/news/${id}`, data),
  deleteNews: (id) => request.delete(`/admin/news/${id}`),
  
  getOrders: (params) => request.get('/admin/orders', { params }),
  getOrderDetail: (id) => request.get(`/admin/orders/${id}`),
  shipOrder: (id, data) => request.post(`/admin/orders/${id}/ship`, data)
}
