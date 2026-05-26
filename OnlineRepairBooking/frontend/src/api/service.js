import request from '@/utils/request'

export const getCategories = () => {
  return request({
    url: '/services/categories',
    method: 'get'
  })
}

export const getServices = (params) => {
  return request({
    url: '/services',
    method: 'get',
    params
  })
}

export const getServiceDetail = (id) => {
  return request({
    url: `/services/${id}`,
    method: 'get'
  })
}

export const getTimeSlots = (params) => {
  return request({
    url: '/services/time-slots',
    method: 'get',
    params
  })
}
