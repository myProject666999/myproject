import request from '@/utils/request'

export function getSurveyList(params) {
  return request.get('/surveys', { params })
}

export function getSurvey(id) {
  return request.get(`/surveys/${id}`)
}

export function createSurvey(data) {
  return request.post('/surveys', data)
}

export function updateSurvey(id, data) {
  return request.put(`/surveys/${id}`, data)
}

export function deleteSurvey(id) {
  return request.delete(`/surveys/${id}`)
}

export function publishSurvey(id, data) {
  return request.post(`/surveys/${id}/publish`, data)
}

export function getPublishedSurvey(id) {
  return request.get(`/surveys/public/${id}`)
}

export function getQuestions(surveyId) {
  return request.get(`/surveys/${surveyId}/questions`)
}

export function saveQuestions(surveyId, data) {
  return request.post(`/surveys/${surveyId}/questions`, data)
}

export function deleteQuestion(surveyId, questionId) {
  return request.delete(`/surveys/${surveyId}/questions/${questionId}`)
}
