import request from './request'

export function getContainerList(params) {
  return request({
    url: '/container/list',
    method: 'get',
    params
  })
}

export function getContainerDetail(id) {
  return request({
    url: `/container/${id}`,
    method: 'get'
  })
}

export function getContainerByNo(containerNo) {
  return request({
    url: `/container/no/${containerNo}`,
    method: 'get'
  })
}

export function createInbound(data) {
  return request({
    url: '/container/inbound',
    method: 'post',
    data
  })
}

export function createOutbound(data) {
  return request({
    url: '/container/outbound',
    method: 'post',
    data
  })
}

export function updateContainer(id, data) {
  return request({
    url: `/container/${id}`,
    method: 'put',
    data
  })
}

export function deleteContainer(id) {
  return request({
    url: `/container/${id}`,
    method: 'delete'
  })
}

export function getTodayInboundCount() {
  return request({
    url: '/container/today/inbound',
    method: 'get'
  })
}

export function getTodayOutboundCount() {
  return request({
    url: '/container/today/outbound',
    method: 'get'
  })
}

export function getPresentCount() {
  return request({
    url: '/container/present/count',
    method: 'get'
  })
}
