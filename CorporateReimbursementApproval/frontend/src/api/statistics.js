import request from '@/utils/request'

export function getPersonalStats() {
  return request({
    url: '/statistics/personal',
    method: 'get'
  })
}

export function getDepartmentStats() {
  return request({
    url: '/statistics/department',
    method: 'get'
  })
}

export function getMonthlyStats(year) {
  return request({
    url: `/statistics/monthly/${year}`,
    method: 'get'
  })
}