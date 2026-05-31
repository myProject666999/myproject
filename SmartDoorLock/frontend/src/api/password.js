import request from '@/utils/request'

export function getPasswordPage(params) {
  return request({
    url: '/lock-password/page',
    method: 'get',
    params
  })
}

export function getPasswordDetail(id) {
  return request({
    url: `/lock-password/${id}`,
    method: 'get'
  })
}

export function sendPassword(data) {
  return request({
    url: '/lock-password/send',
    method: 'post',
    data
  })
}

export function resendPassword(id) {
  return request({
    url: `/lock-password/${id}/resend`,
    method: 'put'
  })
}

export function cancelPassword(id) {
  return request({
    url: `/lock-password/${id}/cancel`,
    method: 'put'
  })
}

export function freezePassword(id) {
  return request({
    url: `/lock-password/${id}/freeze`,
    method: 'put'
  })
}

export function unfreezePassword(id) {
  return request({
    url: `/lock-password/${id}/unfreeze`,
    method: 'put'
  })
}
