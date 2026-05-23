import request from './request'
import type { Permission, ShareLink, User } from '@/types'

export const permissionsApi = {
  getPermissions(documentId: string) {
    return request.get<Permission[]>(`/documents/${documentId}/permissions`)
  },

  addPermission(documentId: string, data: { userId: string; permissionLevel: 'read' | 'write' | 'admin' }) {
    return request.post<Permission>(`/documents/${documentId}/permissions`, data)
  },

  updatePermission(documentId: string, permissionId: string, data: { permissionLevel: 'read' | 'write' | 'admin' }) {
    return request.put<Permission>(`/documents/${documentId}/permissions/${permissionId}`, data)
  },

  removePermission(documentId: string, permissionId: string) {
    return request.delete(`/documents/${documentId}/permissions/${permissionId}`)
  },

  createShareLink(documentId: string, data: { permissionLevel: 'read' | 'write'; expiresAt?: string }) {
    return request.post<ShareLink>(`/documents/${documentId}/share`, data)
  },

  getShareLinks(documentId: string) {
    return request.get<ShareLink[]>(`/documents/${documentId}/share`)
  },

  deleteShareLink(documentId: string, shareId: string) {
    return request.delete(`/documents/${documentId}/share/${shareId}`)
  },

  searchUsers(query: string) {
    return request.get<User[]>('/users/search', { params: { query } })
  },
}
