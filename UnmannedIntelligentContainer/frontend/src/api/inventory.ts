import { get, post, put, del } from '@/utils/request'
import type {
  Inventory,
  InventoryQuery,
  InventoryCreate,
  InventoryUpdate,
  LowStockItem,
  PageResult
} from '@/types'

export function getInventoryList(params: InventoryQuery) {
  return get<PageResult<Inventory>>('/inventory', { params })
}

export function getLowStockItems() {
  return get<LowStockItem[]>('/inventory/low-stock')
}

export function getInventoryById(id: number) {
  return get<Inventory>(`/inventory/${id}`)
}

export function createInventory(data: InventoryCreate) {
  return post<Inventory>('/inventory', data)
}

export function updateInventory(id: number, data: InventoryUpdate) {
  return put<Inventory>(`/inventory/${id}`, data)
}

export function deleteInventory(id: number) {
  return del<void>(`/inventory/${id}`)
}
