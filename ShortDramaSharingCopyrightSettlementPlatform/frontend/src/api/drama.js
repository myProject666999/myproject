import request from '@/utils/request'

export function getDramaList(params) {
  return request({
    url: '/dramas',
    method: 'get',
    params
  })
}

export function getDramaDetail(id) {
  return request({
    url: `/dramas/${id}`,
    method: 'get'
  })
}

export function createDrama(data) {
  return request({
    url: '/dramas',
    method: 'post',
    data
  })
}

export function updateDrama(id, data) {
  return request({
    url: `/dramas/${id}`,
    method: 'put',
    data
  })
}

export function deleteDrama(id) {
  return request({
    url: `/dramas/${id}`,
    method: 'delete'
  })
}

export function getDramaRights(dramaId) {
  return request({
    url: `/dramas/rights?drama_id=${dramaId}`,
    method: 'get'
  })
}

export function addDramaRight(data) {
  return request({
    url: '/dramas/rights',
    method: 'post',
    data
  })
}

export function removeDramaRight(id) {
  return request({
    url: `/dramas/rights/${id}`,
    method: 'delete'
  })
}
