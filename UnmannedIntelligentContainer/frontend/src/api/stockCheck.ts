import { get, post } from '@/utils/request'
import type {
  StockCheck,
  StockCheckQuery,
  StockCheckCreate,
  StockCheckProcess,
  PageResult
} from '@/types'

export function getStockCheckList(params: StockCheckQuery) {
  return get<PageResult<StockCheck>>('/stock-check', { params })
}

export function getStockCheckById(id: number) {
  return get<StockCheck>(`/stock-check/${id}`)
}

export function createStockCheck(data: StockCheckCreate) {
  return post<StockCheck>('/stock-check', data)
}

export function processStockCheck(data: StockCheckProcess) {
  return post<void>('/stock-check/process', data)
}
