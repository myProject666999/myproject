import request from './request'
import type { DocumentVersion, PaginatedResult } from '@/types'

export const versionsApi = {
  getVersions(documentId: string, params?: { page?: number; limit?: number }) {
    return request.get<PaginatedResult<DocumentVersion>>(
      `/documents/${documentId}/versions`,
      { params },
    )
  },

  getVersion(documentId: string, versionId: string) {
    return request.get<DocumentVersion>(
      `/documents/${documentId}/versions/${versionId}`,
    )
  },

  createVersion(documentId: string, data: { changeDescription?: string }) {
    return request.post<DocumentVersion>(
      `/documents/${documentId}/versions`,
      data,
    )
  },

  rollbackToVersion(documentId: string, versionId: string) {
    return request.post<DocumentVersion>(
      `/documents/${documentId}/versions/${versionId}/rollback`,
    )
  },

  deleteVersion(documentId: string, versionId: string) {
    return request.delete(`/documents/${documentId}/versions/${versionId}`)
  },
}
