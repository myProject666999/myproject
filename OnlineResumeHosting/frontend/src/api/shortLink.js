import request from '@/api/request'

export const createShortLink = (resumeId) => {
  return request({
    url: '/short-links',
    method: 'post',
    data: { resumeId }
  })
}

export const getShortLinkByResumeId = (resumeId) => {
  return request({
    url: `/short-links/resume/${resumeId}`,
    method: 'get'
  })
}

export const getResumeByShortCode = (code) => {
  return request({
    url: `/short-links/${code}`,
    method: 'get'
  })
}

export const getAllShortLinks = () => {
  return request({
    url: '/short-links',
    method: 'get'
  })
}

export const deleteShortLink = (id) => {
  return request({
    url: `/short-links/${id}`,
    method: 'delete'
  })
}
