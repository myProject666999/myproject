import request from './request'

export const login = (data) => request.post('/api/v1/auth/login', data)

export const getProfile = () => request.get('/api/v1/auth/profile')

export const getTasks = (params) => request.get('/api/v1/tasks', { params })
export const getTask = (id) => request.get(`/api/v1/tasks/${id}`)
export const createTask = (data) => request.post('/api/v1/tasks', data)
export const updateTask = (id, data) => request.put(`/api/v1/tasks/${id}`, data)
export const deleteTask = (id) => request.delete(`/api/v1/tasks/${id}`)
export const executeTask = (id) => request.post(`/api/v1/tasks/${id}/execute`)

export const getResults = (params) => request.get('/api/v1/results', { params })
export const getResult = (id) => request.get(`/api/v1/results/${id}`)

export const getRobots = (params) => request.get('/api/v1/robots', { params })
export const getRobot = (id) => request.get(`/api/v1/robots/${id}`)
export const createRobot = (data) => request.post('/api/v1/robots', data)
export const updateRobot = (id, data) => request.put(`/api/v1/robots/${id}`, data)
export const deleteRobot = (id) => request.delete(`/api/v1/robots/${id}`)

export const getPlans = (params) => request.get('/api/v1/plans', { params })
export const getPlan = (id) => request.get(`/api/v1/plans/${id}`)
export const createPlan = (data) => request.post('/api/v1/plans', data)
export const updatePlan = (id, data) => request.put(`/api/v1/plans/${id}`, data)
export const deletePlan = (id) => request.delete(`/api/v1/plans/${id}`)

export const executeCommand = (data) => request.post('/api/v1/commands/execute', data)

export const getAudit = (params) => request.get('/api/v1/audit', { params })
