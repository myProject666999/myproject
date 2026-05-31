import request from '@/utils/request'
import type { ApiResponse, PaginationResponse, Photo } from '@/types'

export const uploadPhoto = (formData: FormData): Promise<ApiResponse<Photo>> => {
  return request.post('/photos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }).then(res => res.data)
}

export const getPhotos = (params?: any): Promise<ApiResponse<PaginationResponse<Photo>>> => {
  return request.get('/photos', { params }).then(res => res.data)
}

export const getPhoto = (id: number): Promise<ApiResponse<Photo>> => {
  return request.get(`/photos/${id}`).then(res => res.data)
}

export const deletePhoto = (id: number): Promise<ApiResponse> => {
  return request.delete(`/photos/${id}`).then(res => res.data)
}
