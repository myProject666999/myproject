import { get, post } from '@/utils/request'
import type {
  ReplenishmentTask,
  ReplenishmentTaskQuery,
  ReplenishmentTaskCreate,
  ReplenishmentTaskDispatch,
  ReplenishmentTaskExecute,
  GenerateTaskRequest,
  PageResult
} from '@/types'

export function getReplenishmentList(params: ReplenishmentTaskQuery) {
  return get<PageResult<ReplenishmentTask>>('/replenishment', { params })
}

export function getReplenishmentById(id: number) {
  return get<ReplenishmentTask>(`/replenishment/${id}`)
}

export function generateTasks(data?: GenerateTaskRequest) {
  return post<ReplenishmentTask[]>('/replenishment/generate', data)
}

export function dispatchTask(id: number, data: ReplenishmentTaskDispatch) {
  return post<void>(`/replenishment/${id}/dispatch`, data)
}

export function startTask(id: number) {
  return post<void>(`/replenishment/${id}/start`)
}

export function executeTask(data: ReplenishmentTaskExecute) {
  return post<void>('/replenishment/execute', data)
}

export function cancelTask(id: number) {
  return post<void>(`/replenishment/${id}/cancel`)
}
