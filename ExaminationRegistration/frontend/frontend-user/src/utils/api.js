import request from './request'

export const login = (data) => request.post('/login', data)
export const register = (data) => request.post('/register', data)
export const getCurrentUser = () => request.get('/user/info')
export const updateProfile = (data) => request.put('/user/profile', data)
export const updatePassword = (data) => request.put('/user/password', data)

export const getIntroList = (params) => request.get('/intros', { params })
export const getIntroDetail = (id) => request.get(`/intros/${id}`)
export const likeIntro = (id) => request.post(`/intros/${id}/like`)
export const dislikeIntro = (id) => request.post(`/intros/${id}/dislike`)

export const getProjectList = (params) => request.get('/projects', { params })
export const getProjectDetail = (id) => request.get(`/projects/${id}`)

export const getCartList = () => request.get('/cart')
export const addToCart = (data) => request.post('/cart', data)
export const updateCartItem = (id, data) => request.put(`/cart/${id}`, data)
export const removeCartItem = (id) => request.delete(`/cart/${id}`)

export const getOrderList = (params) => request.get('/orders', { params })
export const getOrderDetail = (id) => request.get(`/orders/${id}`)
export const createOrder = (data) => request.post('/orders', data)
export const payOrder = (id) => request.post(`/orders/${id}/pay`)

export const getAddressList = () => request.get('/addresses')
export const createAddress = (data) => request.post('/addresses', data)
export const updateAddress = (id, data) => request.put(`/addresses/${id}`, data)
export const deleteAddress = (id) => request.delete(`/addresses/${id}`)
export const setDefaultAddress = (id) => request.post(`/addresses/${id}/default`)

export const getFavoriteList = (params) => request.get('/favorites', { params })
export const addFavorite = (data) => request.post('/favorites', data)
export const removeFavorite = (id) => request.delete(`/favorites/${id}`)
export const checkFavorite = (params) => request.get('/favorites/check', { params })

export const getPaperList = (params) => request.get('/papers', { params })
export const getPaperDetail = (id) => request.get(`/papers/${id}`)
export const getPaperQuestions = (id) => request.get(`/papers/${id}/questions`)
export const startExam = (id) => request.post(`/papers/${id}/start`)
export const submitExam = (recordId, data) => request.post(`/exam-records/${recordId}/submit`, data)

export const getExamRecordList = () => request.get('/exam-records')
export const getExamRecordDetail = (id) => request.get(`/exam-records/${id}`)

export const getWrongQuestionList = (params) => request.get('/wrong-questions', { params })
export const removeWrongQuestion = (id) => request.delete(`/wrong-questions/${id}`)

export const getPostList = (params) => request.get('/posts', { params })
export const getPostDetail = (id) => request.get(`/posts/${id}`)
export const createPost = (data) => request.post('/posts', data)
export const getMyPosts = () => request.get('/my-posts')
