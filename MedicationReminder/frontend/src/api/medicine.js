import request from '@/utils/request'

export function getMedicines() {
  return request({
    url: '/medicines',
    method: 'get'
  })
}

export function getMedicineById(id) {
  return request({
    url: `/medicines/${id}`,
    method: 'get'
  })
}

export function createMedicine(data) {
  return request({
    url: '/medicines',
    method: 'post',
    data
  })
}

export function updateMedicine(data) {
  return request({
    url: '/medicines',
    method: 'put',
    data
  })
}

export function deleteMedicine(id) {
  return request({
    url: `/medicines/${id}`,
    method: 'delete'
  })
}
