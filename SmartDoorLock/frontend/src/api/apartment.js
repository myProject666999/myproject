import request from '@/utils/request'

export function getApartmentPage(params) {
  return request({
    url: '/apartment/page',
    method: 'get',
    params
  })
}

export function getApartmentDetail(id) {
  return request({
    url: `/apartment/${id}`,
    method: 'get'
  })
}

export function getApartmentList() {
  return request({
    url: '/apartment/list',
    method: 'get'
  })
}

export function addApartment(data) {
  return request({
    url: '/apartment',
    method: 'post',
    data
  })
}

export function updateApartment(data) {
  return request({
    url: '/apartment',
    method: 'put',
    data
  })
}

export function deleteApartment(id) {
  return request({
    url: `/apartment/${id}`,
    method: 'delete'
  })
}

export function updateApartmentStatus(id, status) {
  return request({
    url: `/apartment/${id}/status`,
    method: 'put',
    params: { status }
  })
}
