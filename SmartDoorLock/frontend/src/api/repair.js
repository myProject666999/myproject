import request from '@/utils/request'

export function getRepairPage(params) {
  return request({
    url: '/repair-order/page',
    method: 'get',
    params
  })
}

export function getRepairDetail(id) {
  return request({
    url: `/repair-order/${id}`,
    method: 'get'
  })
}

export function createRepair(data) {
  return request({
    url: '/repair-order',
    method: 'post',
    data
  })
}

export function assignRepair(id, assigneeId, assigneeName) {
  return request({
    url: `/repair-order/${id}/assign`,
    method: 'put',
    params: { assigneeId, assigneeName }
  })
}

export function startProcessRepair(id, processDescription) {
  return request({
    url: `/repair-order/${id}/start-process`,
    method: 'put',
    params: { processDescription }
  })
}

export function completeRepair(id, processDescription, costAmount, costBearer) {
  return request({
    url: `/repair-order/${id}/complete`,
    method: 'put',
    params: { processDescription, costAmount, costBearer }
  })
}

export function cancelRepair(id, reason) {
  return request({
    url: `/repair-order/${id}/cancel`,
    method: 'put',
    params: { reason }
  })
}

export function evaluateRepair(id, satisfactionScore, satisfactionComment) {
  return request({
    url: `/repair-order/${id}/evaluate`,
    method: 'put',
    params: { satisfactionScore, satisfactionComment }
  })
}
