export interface Room {
  id: string
  name: string
  creator_nickname: string
  created_at: string
  expires_at: string | null
  is_destroyed: boolean
}

export interface Message {
  id: number
  room_id: string
  nickname: string
  content?: string
  image_url?: string
  message_type: number
  created_at: string
  is_self?: boolean
}

export interface CreateRoomRequest {
  name: string
  creator_nickname: string
  expires_in_hours?: number
}

export interface WebSocketMessage {
  type: string
  data: Message | SystemMessage
}

export interface SystemMessage {
  type: string
  message: string
}

export interface IncomingMessage {
  content?: string
  image_url?: string
  message_type: number
}

export const MessageType = {
  Text: 1,
  Image: 2,
} as const
