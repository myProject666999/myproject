import axios from 'axios'
import type { Room, Message, CreateRoomRequest } from '@/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

export const getRooms = async (): Promise<Room[]> => {
  const response = await api.get<ApiResponse<Room[]>>('/rooms')
  return response.data.data
}

export const createRoom = async (data: CreateRoomRequest): Promise<Room> => {
  const response = await api.post<ApiResponse<Room>>('/rooms', data)
  return response.data.data
}

export const deleteRoom = async (id: string): Promise<void> => {
  await api.delete<ApiResponse<void>>(`/rooms/${id}`)
}

export const getMessages = async (roomId: string): Promise<Message[]> => {
  const response = await api.get<ApiResponse<Message[]>>(`/rooms/${roomId}/messages`)
  return response.data.data
}

export const uploadImage = async (file: File): Promise<{ url: string; filename: string }> => {
  const formData = new FormData()
  formData.append('image', file)
  const response = await api.post<ApiResponse<{ url: string; filename: string }>>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data.data
}

export default api
