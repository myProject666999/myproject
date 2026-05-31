import request from '@/utils/request'

export function startExecution(orderId) {
  return request({
    url: `/execution/start/${orderId}`,
    method: 'post'
  })
}

export function stopExecution(executionId) {
  return request({
    url: `/execution/stop/${executionId}`,
    method: 'post'
  })
}

export function pauseExecution(executionId) {
  return request({
    url: `/execution/pause/${executionId}`,
    method: 'post'
  })
}

export function resumeExecution(executionId) {
  return request({
    url: `/execution/resume/${executionId}`,
    method: 'post'
  })
}

export function rollback(orderId) {
  return request({
    url: `/execution/rollback/${orderId}`,
    method: 'post'
  })
}

export function getExecutionRecord(executionId) {
  return request({
    url: `/execution/${executionId}`,
    method: 'get'
  })
}

export function getExecutionRecords(orderId) {
  return request({
    url: `/execution/order/${orderId}`,
    method: 'get'
  })
}
