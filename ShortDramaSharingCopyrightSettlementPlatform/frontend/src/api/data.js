import request from '@/utils/request'

export function getPlayDataList(params) {
  return request({
    url: '/data/play',
    method: 'get',
    params
  })
}

export function importPlayData(data) {
  return request({
    url: '/data/play',
    method: 'post',
    data
  })
}

export function batchImportPlayData(data) {
  return request({
    url: '/data/play/batch',
    method: 'post',
    data
  })
}

export function getPaymentDataList(params) {
  return request({
    url: '/data/payment',
    method: 'get',
    params
  })
}

export function importPaymentData(data) {
  return request({
    url: '/data/payment',
    method: 'post',
    data
  })
}
