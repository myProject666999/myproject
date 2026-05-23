import request from '@/utils/request'

export function submitAnswer(data) {
  return request.post('/answers/submit', data)
}

export function getResponses(surveyId, params) {
  return request.get(`/surveys/${surveyId}/responses`, { params })
}

export function getStatistics(surveyId) {
  return request.get(`/surveys/${surveyId}/statistics`)
}

export function exportExcel(surveyId) {
  return request.get(`/surveys/${surveyId}/export`, {
    responseType: 'blob'
  })
}
