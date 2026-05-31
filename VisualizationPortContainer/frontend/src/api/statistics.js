import request from './request'

export function getThroughputTrend(params) {
  return request({
    url: '/statistics/throughput/trend',
    method: 'get',
    params
  })
}

export function getRelocationAnalysis(params) {
  return request({
    url: '/statistics/relocation/analysis',
    method: 'get',
    params
  })
}

export function getCraneUtilizationReport(params) {
  return request({
    url: '/statistics/crane/utilization',
    method: 'get',
    params
  })
}

export function getSlotUtilizationTrend(params) {
  return request({
    url: '/statistics/slot/utilization',
    method: 'get',
    params
  })
}

export function getContainerTypeDistribution() {
  return request({
    url: '/statistics/container/type-distribution',
    method: 'get'
  })
}

export function getMonthlyStatistics(year) {
  return request({
    url: '/statistics/monthly',
    method: 'get',
    params: { year }
  })
}

export function getDashboardStatistics() {
  return request({
    url: '/statistics/dashboard',
    method: 'get'
  })
}
