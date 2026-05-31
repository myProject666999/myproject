import request from '@/utils/request'

export function getAuditLogList(params) {
  return request({
    url: '/audit/list',
    method: 'get',
    params
  })
}
