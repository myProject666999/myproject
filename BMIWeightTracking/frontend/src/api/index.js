import request from '../utils/request'

export function login(username, password) {
  return request.post('/auth/login', { username, password })
}

export function register(username, password, nickname) {
  return request.post('/auth/register', { username, password, nickname })
}

export function getMe() {
  return request.get('/user/me')
}

export function updateHeight(height) {
  return request.put('/user/height', { height })
}

export function addWeight(weight, recordDate, note) {
  return request.post('/weight', { weight, recordDate, note })
}

export function updateWeight(id, weight, note) {
  return request.put('/weight/' + id, { weight, note })
}

export function deleteWeight(id) {
  return request.delete('/weight/' + id)
}

export function listWeight(start, end) {
  return request.get('/weight/list', { params: { start, end } })
}

export function getTrend(start, end, maDays) {
  return request.get('/weight/trend', { params: { start, end, maDays } })
}

export function setGoal(targetWeight, targetDate) {
  return request.post('/goal', { targetWeight, targetDate })
}

export function getGoal() {
  return request.get('/goal')
}

export function getGoalProgress() {
  return request.get('/goal/progress')
}

export function setReminder(reminderTime, enabled) {
  return request.post('/reminder', { reminderTime, enabled })
}

export function getReminder() {
  return request.get('/reminder')
}

export function toggleReminder(enabled) {
  return request.put('/reminder/toggle', { enabled })
}
