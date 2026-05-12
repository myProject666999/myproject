import request from '@/utils/request'

export const login = (data) => request.post('/login', data)
export const register = (data) => request.post('/register', data)
export const getProfile = () => request.get('/profile')

export const getNannies = (params) => request.get('/nannies', { params })
export const getNannyDetail = (id) => request.get(`/nannies/${id}`)
export const createNanny = (data) => request.post('/nannies', data)
export const updateNanny = (id, data) => request.put(`/nannies/${id}`, data)
export const deleteNanny = (id) => request.delete(`/nannies/${id}`)
export const addNannySkill = (id, data) => request.post(`/nannies/${id}/skills`, data)

export const getSkills = () => request.get('/skills')
export const createSkill = (data) => request.post('/skills', data)

export const createDemand = (data) => request.post('/demands', data)
export const getDemands = (params) => request.get('/demands', { params })
export const getMyDemands = () => request.get('/my-demands')
export const updateDemandStatus = (id, data) => request.put(`/demands/${id}/status`, data)
export const recommendNannies = (id) => request.get(`/demands/${id}/recommend`)

export const createOrder = (data) => request.post('/orders', data)
export const getOrders = (params) => request.get('/orders', { params })
export const getMyOrders = () => request.get('/my-orders')
export const getOrderDetail = (id) => request.get(`/orders/${id}`)
export const updateOrderStatus = (id, data) => request.put(`/orders/${id}/status`, data)

export const createContract = (data) => request.post('/contracts', data)
export const getContract = (orderId) => request.get(`/contracts/${orderId}`)
export const signContract = (id) => request.put(`/contracts/${id}/sign`)

export const checkIn = (data) => request.post('/checkin', data)
export const checkOut = (data) => request.post('/checkout', data)
export const getAttendance = (params) => request.get('/attendance', { params })

export const createDailyRecord = (data) => request.post('/daily-records', data)
export const getDailyRecords = (params) => request.get('/daily-records', { params })
export const reviewDailyRecord = (id, data) => request.put(`/daily-records/${id}/review`, data)

export const createReview = (data) => request.post('/reviews', data)
export const getReviews = (params) => request.get('/reviews', { params })

export const createDispute = (data) => request.post('/disputes', data)
export const getDisputes = (params) => request.get('/disputes', { params })
export const handleDispute = (id, data) => request.put(`/disputes/${id}/handle`, data)

export const getCourses = (params) => request.get('/courses', { params })
export const getCourseDetail = (id) => request.get(`/courses/${id}`)
export const createCourse = (data) => request.post('/courses', data)
export const updateCourse = (id, data) => request.put(`/courses/${id}`, data)
export const deleteCourse = (id) => request.delete(`/courses/${id}`)
export const startLearning = (id) => request.post(`/courses/${id}/learn`)
export const updateProgress = (id, data) => request.put(`/courses/${id}/progress`, data)
export const getMyCourses = () => request.get('/my-courses')
