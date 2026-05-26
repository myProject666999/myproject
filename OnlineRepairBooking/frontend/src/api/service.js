import request from '@/utils/request'

export const getCategories = () => {
  return request({
    url: '/service/categories',
    method: 'get'
  })
}

export const getServices = (params) => {
  return request({
    url: '/service/list',
    method: 'get',
    params
  })
}

export const getServiceDetail = (id) => {
  return request({
    url: `/service/${id}`,
    method: 'get'
  })
}

export const getTimeSlots = (serviceId, date) => {
  return request({
    url: `/service/${serviceId}/time-slots`,
    method: 'get',
    params: { date }
  })
}
