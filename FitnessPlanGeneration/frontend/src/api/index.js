import request from '@/utils/request'

export function login(data) {
  return request.post('/user/login', data)
}

export function register(data) {
  return request.post('/user/register', data)
}

export function getUser(id) {
  return request.get(`/user/${id}`)
}

export function saveQuestionnaire(data) {
  return request.post('/questionnaire/save', data)
}

export function getQuestionnaire(userId) {
  return request.get(`/questionnaire/user/${userId}`)
}

export function generateWeeklyPlan(questionnaireId) {
  return request.post(`/questionnaire/generate/${questionnaireId}`)
}

export function getCurrentWeeklyPlan(userId) {
  return request.get(`/weekly-plan/current/${userId}`)
}

export function getWeeklyPlan(id) {
  return request.get(`/weekly-plan/${id}`)
}

export function listExercises() {
  return request.get('/exercise/list')
}

export function listExercisesByCategory(category) {
  return request.get(`/exercise/category/${category}`)
}

export function getExercise(id) {
  return request.get(`/exercise/${id}`)
}

export function checkIn(data) {
  return request.post('/check-in/check-in', data)
}

export function getCheckInByDailyPlan(dailyPlanId) {
  return request.get(`/check-in/daily-plan/${dailyPlanId}`)
}

export function getCheckInByUser(userId) {
  return request.get(`/check-in/user/${userId}`)
}

export function generateSuggestions(userId, dailyPlanId) {
  return request.post(`/check-in/suggestions/${userId}/${dailyPlanId}`)
}
