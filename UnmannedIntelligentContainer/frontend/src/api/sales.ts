import { get, post } from '@/utils/request'
import type {
  Sale,
  SaleQuery,
  SaleCreate,
  SaleRefund,
  SaleStatistics,
  ContainerSaleStats,
  ProductSaleStats,
  PageResult
} from '@/types'

export function getSaleList(params: SaleQuery) {
  return get<PageResult<Sale>>('/sales', { params })
}

export function getSaleStatistics(params?: { start_date?: string; end_date?: string }) {
  return get<SaleStatistics>('/sales/statistics', { params })
}

export function getContainerSaleStats(params?: { start_date?: string; end_date?: string }) {
  return get<ContainerSaleStats[]>('/sales/container-stats', { params })
}

export function getProductSaleStats(params?: { start_date?: string; end_date?: string }) {
  return get<ProductSaleStats[]>('/sales/product-stats', { params })
}

export function getSaleById(id: number) {
  return get<Sale>(`/sales/${id}`)
}

export function createSale(data: SaleCreate) {
  return post<Sale>('/sales', data)
}

export function refundSale(data: SaleRefund) {
  return post<void>('/sales/refund', data)
}
