import request from '@/utils/request'

export function getStatsOverview() {
  return request.get('/stats/overview')
}

export function getAgentWorkload(params) {
  return request.get('/stats/agent-workload', { params })
}

export function getTicketTrend(params) {
  return request.get('/stats/ticket-trend', { params })
}

export function getCategoryStats() {
  return request.get('/stats/category-stats')
}
