import request from '@/api/request'

export const getVisitLogsByResumeId = (resumeId) => {
  return request({
    url: `/visit-logs/resume/${resumeId}`,
    method: 'get'
  })
}

export const getVisitCount = (resumeId, startDate, endDate) => {
  return request({
    url: `/visit-logs/resume/${resumeId}/count`,
    method: 'post',
    data: { startDate, endDate }
  })
}

export const logVisit = (resumeId, visitorIp, userAgent) => {
  return request({
    url: '/visit-logs',
    method: 'post',
    data: { resumeId, visitorIp, userAgent }
  })
}

export const getAllVisitLogs = () => {
  return request({
    url: '/visit-logs',
    method: 'get'
  })
}
