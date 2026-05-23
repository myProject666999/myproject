export interface User {
  id: number
  username: string
  email: string
  avatarUrl?: string | null
  nickname?: string | null
  phone?: string | null
  status: number
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  username: string
  password: string
  remember?: boolean
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  nickname?: string
}

export interface Folder {
  id: number
  name: string
  parentId: number
  ownerId: number
  sortOrder: number
  createdAt: string
  updatedAt: string
  children?: Folder[]
}

export interface Document {
  id: number
  title: string
  content: string | null
  contentVersion: number
  folderId: number
  ownerId: number
  shareToken: string | null
  shareType: number
  status: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface RecycleBinItem {
  id: number
  documentId: number
  title: string
  ownerId: number
  deletedBy: number
  createdAt: string
  expiresAt: string | null
}

export interface DocumentVersion {
  id: string
  documentId: string
  versionNumber: number
  content: string
  changeDescription?: string
  createdBy: string
  createdAt: string
}

export interface Permission {
  id: string
  documentId: string
  userId: string
  permissionLevel: 'read' | 'write' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface ShareLink {
  id: string
  documentId: string
  token: string
  permissionLevel: 'read' | 'write'
  expiresAt?: string
  createdAt: string
}

export interface Collaborator {
  userId: string
  username: string
  avatar?: string
  cursor: {
    pos: number
    selection?: {
      anchor: number
      head: number
    }
  }
  color: string
}

export interface SocketMessage {
  type: 'join' | 'leave' | 'cursor' | 'operation' | 'sync'
  data: unknown
}

export interface OTOperation {
  type: 'insert' | 'delete' | 'retain'
  position: number
  text?: string
  length?: number
  version: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}
