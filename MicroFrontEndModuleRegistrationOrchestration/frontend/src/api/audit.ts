import { get } from '@/utils/request'
import type { AuditLog, PageQuery } from '@/types'

export function getAuditLogList(params?: PageQuery & { module?: string; operation?: string; operator?: string }) {
  return get('/audit/list', params)
}

export function getAuditLogDetail(id: number) {
  return get<AuditLog>(`/audit/${id}`)
}

export function getAuditModules() {
  return get<string[]>('/audit/modules')
}

export function getAuditOperations(module?: string) {
  return get<string[]>('/audit/operations', { module })
}

export function exportAuditLogs(params?: any) {
  return get('/audit/export', params, { responseType: 'blob' })
}
