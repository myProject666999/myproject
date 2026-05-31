import request from '../utils/request'

export function getAnalysisOverall() {
  return request({
    url: '/analysis/overall',
    method: 'get'
  })
}

export function getAnalysisRouteRanking(params) {
  return request({
    url: '/analysis/route-ranking',
    method: 'get',
    params
  })
}

export function getAnalysisStationRanking(params) {
  return request({
    url: '/analysis/station-ranking',
    method: 'get',
    params
  })
}

export function getAnalysisDailyTrend(params) {
  return request({
    url: '/analysis/daily-trend',
    method: 'get',
    params
  })
}

export function getAnalysisDepartment(params) {
  return request({
    url: '/analysis/department',
    method: 'get',
    params
  })
}

export function getAnalysisTimeDistribution(params) {
  return request({
    url: '/analysis/time-distribution',
    method: 'get',
    params
  })
}

export function getAnalysisVerification(params) {
  return request({
    url: '/analysis/verification',
    method: 'get',
    params
  })
}
