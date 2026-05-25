import request from '../utils/request'

export function addTrackingNode(data) {
  return request.post('/tracking/add', data)
}

export function getTrackingNodes(waybillNo) {
  return request.get(`/tracking/waybill/${waybillNo}`)
}
