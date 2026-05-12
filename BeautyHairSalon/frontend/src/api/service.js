
import request from '@/utils/request'

export function getServicePage(params) {
  return request({
    url: '/service/page',
    method: 'get',
    params
  })
}

export function getServiceById(id) {
  return request({
    url: `/service/${id}`,
    method: 'get'
  })
}

export function getAllServices() {
  return request({
    url: '/service/all',
    method: 'get'
  })
}

export function addService(data) {
  return request({
    url: '/service',
    method: 'post',
    data
  })
}

export function updateService(data) {
  return request({
    url: '/service',
    method: 'put',
    data
  })
}

export function deleteService(id) {
  return request({
    url: `/service/${id}`,
    method: 'delete'
  })
}
