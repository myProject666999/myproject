import request from '@/utils/request'
import type { ApiResponse, PaginationResponse, StoreScore } from '@/types'

export const getRanking = (params?: any): Promise<ApiResponse<PaginationResponse<StoreScore>>> => {
  return request.get('/scores/ranking', { params }).then(res => res.data)
}

export const getStoreScore = (storeId: number): Promise<ApiResponse<StoreScore>> => {
  return request.get(`/scores/store/${storeId}`).then(res => res.data)
}

export const getScoreTrend = (params?: any): Promise<ApiResponse<any>> => {
  return request.get('/scores/trend', { params }).then(res => res.data)
}

export const aggregateScores = (params?: any): Promise<ApiResponse> => {
  return request.get('/scores/aggregate', { params }).then(res => res.data)
}
