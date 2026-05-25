import request from '../utils/request'

export function getWaybillDetail(waybillNo) {
  return request.get(`/waybill/detail/${waybillNo}`)
}

export function createWaybill(data) {
  return request.post('/waybill/create', data)
}

export function queryWaybills(data) {
  return request.post('/waybill/query', data)
}

export function updateWaybill(data) {
  return request.put('/waybill/update', data)
}

export function updateWaybillStatus(id, status) {
  return request.put(`/waybill/status/${id}/${status}`)
}

export function deleteWaybill(id) {
  return request.delete(`/waybill/delete/${id}`)
}
