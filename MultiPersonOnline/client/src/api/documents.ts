import request from './request'
import type { Document } from '@/types'

export const documentsApi = {
  getDocuments(params?: { folderId?: string; page?: number; limit?: number }) {
    return request.get<Document[]>('/documents/mine', { params })
  },

  getDocument(id: string) {
    return request.get<Document>(`/documents/${id}`)
  },

  createDocument(data: { title: string; folderId?: string; content?: string }) {
    return request.post<Document>('/documents', data)
  },

  updateDocument(id: string, data: { title?: string; content?: string; folderId?: string }) {
    return request.patch<Document>(`/documents/${id}`, data)
  },

  deleteDocument(id: string) {
    return request.delete(`/documents/${id}`)
  },

  getDeletedDocuments() {
    return request.get<Document[]>('/recycle-bin')
  },

  restoreDocument(id: string) {
    return request.post<Document>(`/recycle-bin/${id}/restore`)
  },

  permanentlyDelete(id: string) {
    return request.delete(`/recycle-bin/${id}`)
  },
}
