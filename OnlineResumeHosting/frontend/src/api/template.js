import request from '@/api/request'

export const getAllActiveTemplates = () => {
  return request({
    url: '/templates',
    method: 'get'
  })
}

export const getAllTemplates = () => {
  return request({
    url: '/templates/all',
    method: 'get'
  })
}

export const getTemplateById = (id) => {
  return request({
    url: `/templates/${id}`,
    method: 'get'
  })
}

export const getTemplateByCode = (code) => {
  return request({
    url: `/templates/code/${code}`,
    method: 'get'
  })
}
