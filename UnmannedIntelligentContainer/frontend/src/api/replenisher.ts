import { get, post, put, del } from '@/utils/request'
import type {
  Replenisher,
  ReplenisherQuery,
  ReplenisherCreate,
  ReplenisherUpdate,
  PageResult
} from '@/types'

export function getReplenisherList(params: ReplenisherQuery) {
  return get<PageResult<Replenisher>>('/replenishers', { params })
}

export function getAllReplenishers() {
  return get<Replenisher[]>('/replenishers/all')
}

export function getReplenisherById(id: number) {
  return get<Replenisher>(`/replenishers/${id}`)
}

export function createReplenisher(data: ReplenisherCreate) {
  return post<Replenisher>('/replenishers', data)
}

export function updateReplenisher(id: number, data: ReplenisherUpdate) {
  return put<Replenisher>(`/replenishers/${id}`, data)
}

export function deleteReplenisher(id: number) {
  return del<void>(`/replenishers/${id}`)
}
