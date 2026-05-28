import request from './request'
import type { Product, Category, PageResult, ProductFilter } from '@/types'

export function getRecommendProducts(params?: { limit?: number }) {
  return request.get<unknown, { data: Product[] }>('/product/recommend', { params })
}

export function getProductList(params: ProductFilter) {
  return request.get<unknown, { data: PageResult<Product> }>('/product/list', { params })
}

export function getCategoryList() {
  return request.get<unknown, { data: Category[] }>('/category/list')
}
