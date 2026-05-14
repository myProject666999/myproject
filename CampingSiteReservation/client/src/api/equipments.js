import request from '@/utils/request'

export function getEquipments(params = {}) {
  return request.get('/equipments', { params })
}

export function getEquipmentDetail(id) {
  return request.get(`/equipments/${id}`)
}
