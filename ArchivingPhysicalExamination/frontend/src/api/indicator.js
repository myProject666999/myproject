import request from '../utils/request'

export function getIndicatorTrend(userId, indicatorName) {
  return request({
    url: '/indicator/trend',
    method: 'get',
    params: { userId, indicatorName }
  })
}

export function getDistinctIndicatorNames(userId) {
  return request({
    url: '/indicator/names',
    method: 'get',
    params: { userId }
  })
}

export function getYearCompare(userId, currentYear, previousYear) {
  return request({
    url: '/indicator/compare',
    method: 'get',
    params: { userId, currentYear, previousYear }
  })
}
