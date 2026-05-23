import { create } from 'zustand'
import type { Document, Folder } from '@/types'
import { documentsApi } from '@/api/documents'
import { foldersApi } from '@/api/folders'

interface DocumentState {
  documents: Document[]
  folders: Folder[]
  folderTree: Folder[]
  currentDocument: Document | null
  loading: boolean

  fetchDocuments: (params?: { folderId?: string }) => Promise<void>
  fetchFolders: () => Promise<void>
  fetchFolderTree: () => Promise<void>
  fetchDocument: (id: string) => Promise<void>
  createDocument: (data: { title: string; folderId?: string; content?: string }) => Promise<Document>
  updateDocument: (id: string, data: { title?: string; content?: string; folderId?: string }) => Promise<void>
  deleteDocument: (id: string) => Promise<void>
  setCurrentDocument: (doc: Document | null) => void
  createFolder: (data: { name: string; parentId?: string }) => Promise<Folder>
  updateFolder: (id: string, data: { name?: string; parentId?: string }) => Promise<void>
  deleteFolder: (id: string) => Promise<void>
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  folders: [],
  folderTree: [],
  currentDocument: null,
  loading: false,

  fetchDocuments: async (params) => {
    set({ loading: true })
    try {
      const docs = await documentsApi.getDocuments(params) as unknown as Document[]
      set({ documents: docs || [] })
    } finally {
      set({ loading: false })
    }
  },

  fetchFolders: async () => {
    set({ loading: true })
    try {
      const folders = await foldersApi.getFolders() as unknown as Folder[]
      set({ folders })
    } finally {
      set({ loading: false })
    }
  },

  fetchFolderTree: async () => {
    set({ loading: true })
    try {
      const tree = await foldersApi.getFolderTree() as unknown as Folder[]
      set({ folderTree: tree })
    } finally {
      set({ loading: false })
    }
  },

  fetchDocument: async (id: string) => {
    set({ loading: true })
    try {
      const doc = await documentsApi.getDocument(id) as unknown as Document
      set({ currentDocument: doc })
    } finally {
      set({ loading: false })
    }
  },

  createDocument: async (data) => {
    const doc = await documentsApi.createDocument(data) as unknown as Document
    set((state) => ({ documents: [doc, ...state.documents] }))
    return doc
  },

  updateDocument: async (id, data) => {
    const doc = await documentsApi.updateDocument(id, data) as unknown as Document
    set((state) => ({
      documents: state.documents.map((d) => (d.id === id ? doc : d)),
      currentDocument: state.currentDocument?.id === id ? doc : state.currentDocument,
    }))
  },

  deleteDocument: async (id) => {
    await documentsApi.deleteDocument(id)
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
      currentDocument: state.currentDocument?.id === id ? null : state.currentDocument,
    }))
  },

  setCurrentDocument: (doc) => {
    set({ currentDocument: doc })
  },

  createFolder: async (data) => {
    const folder = await foldersApi.createFolder(data) as unknown as Folder
    set((state) => ({ folders: [...state.folders, folder] }))
    return folder
  },

  updateFolder: async (id, data) => {
    const folder = await foldersApi.updateFolder(id, data) as unknown as Folder
    set((state) => ({
      folders: state.folders.map((f) => (f.id === id ? folder : f)),
    }))
  },

  deleteFolder: async (id) => {
    await foldersApi.deleteFolder(id)
    set((state) => ({
      folders: state.folders.filter((f) => f.id !== id),
    }))
  },
}))
