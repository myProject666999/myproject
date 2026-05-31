import request from '../utils/request'

export function verifyQrcode(data) {
  return request({
    url: '/verify/qrcode',
    method: 'post',
    data
  })
}

export function getVerifyRecords(params) {
  return request({
    url: '/verify/records',
    method: 'get',
    params
  })
}
