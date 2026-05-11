import request from './request'

export const login = (data) => request.post('/admin/login', data)

export const getUsers = (params) => request.get('/admin/users', { params })
export const deleteUser = (id) => request.delete(`/admin/users/${id}`)
export const batchDeleteUsers = (ids) => request.post('/admin/users/batch-delete', { ids })

export const getSchoolIntros = (params) => request.get('/admin/school-intros', { params })
export const createSchoolIntro = (data) => request.post('/admin/school-intros', data)
export const updateSchoolIntro = (id, data) => request.put(`/admin/school-intros/${id}`, data)
export const deleteSchoolIntro = (id) => request.delete(`/admin/school-intros/${id}`)

export const getEnrollmentProjects = (params) => request.get('/admin/enrollment-projects', { params })
export const createEnrollmentProject = (data) => request.post('/admin/enrollment-projects', data)
export const updateEnrollmentProject = (id, data) => request.put(`/admin/enrollment-projects/${id}`, data)
export const deleteEnrollmentProject = (id) => request.delete(`/admin/enrollment-projects/${id}`)

export const getExamPapers = (params) => request.get('/admin/exam-papers', { params })
export const createExamPaper = (data) => request.post('/admin/exam-papers', data)
export const updateExamPaper = (id, data) => request.put(`/admin/exam-papers/${id}`, data)
export const deleteExamPaper = (id) => request.delete(`/admin/exam-papers/${id}`)

export const getQuestions = (params) => request.get('/admin/questions', { params })
export const getQuestionDetail = (id) => request.get(`/admin/questions/${id}`)
export const createQuestion = (data) => request.post('/admin/questions', data)
export const updateQuestion = (id, data) => request.put(`/admin/questions/${id}`, data)
export const deleteQuestion = (id) => request.delete(`/admin/questions/${id}`)

export const getForumPosts = (params) => request.get('/admin/forum-posts', { params })
export const getForumPostDetail = (id) => request.get(`/admin/forum-posts/${id}`)
export const updateForumPost = (id, data) => request.put(`/admin/forum-posts/${id}`, data)
export const deleteForumPost = (id) => request.delete(`/admin/forum-posts/${id}`)

export const getOrders = (params) => request.get('/admin/orders', { params })
export const getOrderDetail = (id) => request.get(`/admin/orders/${id}`)

export const getAdminExamPapers = (params) => request.get('/admin/exam-papers', { params })
export const getExamRecords = (params) => request.get('/admin/exam-records', { params })
export const getWrongQuestions = (params) => request.get('/admin/wrong-questions', { params })
