import request from '@/utils/request'
import type { ApiResponse } from '@/types'

export const uploadSyncData = (data: any): Promise<ApiResponse> => {
  return request.post('/sync/upload', data).then(res => res.data)
}

export const getPendingSync = (params?: any): Promise<ApiResponse<any>> => {
  return request.get('/sync/pending', { params }).then(res => res.data)
}

export const confirmSync = (data: any): Promise<ApiResponse> => {
  return request.post('/sync/confirm', data).then(res => res.data)
}
