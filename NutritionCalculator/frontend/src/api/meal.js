import request from './request'

export function getDailyNutrition(date) {
  return request({
    url: '/meal-records/daily',
    method: 'get',
    params: { date }
  })
}

export function getWeeklyReport(date) {
  return request({
    url: '/meal-records/weekly-report',
    method: 'get',
    params: { date }
  })
}

export function addMealRecord(data) {
  return request({
    url: '/meal-records',
    method: 'post',
    data
  })
}

export function updateMealRecord(data) {
  return request({
    url: '/meal-records',
    method: 'put',
    data
  })
}

export function deleteMealRecord(id) {
  return request({
    url: `/meal-records/${id}`,
    method: 'delete'
  })
}
