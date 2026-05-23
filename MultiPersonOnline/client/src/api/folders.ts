import request from './request'
import type { Folder } from '@/types'

export const foldersApi = {
  getFolders() {
    return request.get<Folder[]>('/folders')
  },

  getFolder(id: string) {
    return request.get<Folder>(`/folders/${id}`)
  },

  createFolder(data: { name: string; parentId?: number }) {
    return request.post<Folder>('/folders', data)
  },

  updateFolder(id: string, data: { name?: string; parentId?: number }) {
    return request.put<Folder>(`/folders/${id}`, data)
  },

  deleteFolder(id: string) {
    return request.delete(`/folders/${id}`)
  },

  getFolderTree() {
    return request.get<Folder[]>('/folders/tree')
  },
}
