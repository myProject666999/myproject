import request from '../utils/request'

export function selectStall(data) {
  return request.post('/stall-selection/select', data)
}

export function releaseExpired() {
  return request.post('/stall-selection/release-expired')
}
