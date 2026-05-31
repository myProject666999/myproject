import request from '../utils/request'

export function getDroneList(params) {
  return request.get('/drones', { params })
}

export function getDrone(id) {
  return request.get(`/drones/${id}`)
}

export function createDrone(data) {
  return request.post('/drones', data)
}

export function updateDrone(id, data) {
  return request.put(`/drones/${id}`, data)
}

export function deleteDrone(id) {
  return request.delete(`/drones/${id}`)
}
