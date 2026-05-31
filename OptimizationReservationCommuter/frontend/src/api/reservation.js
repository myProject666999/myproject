import request from '../utils/request'

export function getReservationList(params) {
  return request({
    url: '/reservations',
    method: 'get',
    params
  })
}

export function getReservation(id) {
  return request({
    url: `/reservations/${id}`,
    method: 'get'
  })
}

export function createReservation(data) {
  return request({
    url: '/reservations',
    method: 'post',
    data
  })
}

export function cancelReservation(id) {
  return request({
    url: `/reservations/${id}/cancel`,
    method: 'post'
  })
}

export function rebookReservation(id) {
  return request({
    url: `/reservations/${id}/rebook`,
    method: 'post'
  })
}

export function getReservationQrcode(id) {
  return request({
    url: `/reservations/${id}/qrcode`,
    method: 'post'
  })
}
