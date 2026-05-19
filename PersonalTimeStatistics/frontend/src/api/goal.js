import request from '../utils/request'

export const getGoals = () => request.get('/goals')
export const getGoalsByType = (type) => request.get(`/goals/type/${type}`)
export const createGoal = (data) => request.post('/goals', data)
export const updateGoal = (id, data) => request.put(`/goals/${id}`, data)
export const deleteGoal = (id) => request.delete(`/goals/${id}`)
