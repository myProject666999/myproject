import { get, post, put, del } from '@/utils/request'
import type {
  Product,
  ProductQuery,
  ProductCreate,
  ProductUpdate,
  PageResult
} from '@/types'

export function getProductList(params: ProductQuery) {
  return get<PageResult<Product>>('/products', { params })
}

export function getAllProducts() {
  return get<Product[]>('/products/all')
}

export function getProductCategories() {
  return get<string[]>('/products/categories')
}

export function getProductById(id: number) {
  return get<Product>(`/products/${id}`)
}

export function createProduct(data: ProductCreate) {
  return post<Product>('/products', data)
}

export function updateProduct(id: number, data: ProductUpdate) {
  return put<Product>(`/products/${id}`, data)
}

export function deleteProduct(id: number) {
  return del<void>(`/products/${id}`)
}
