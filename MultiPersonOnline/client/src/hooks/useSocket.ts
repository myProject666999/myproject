import { useEffect, useRef, useCallback } from 'react'
import { io, type Socket } from 'socket.io-client'
import { storage } from '@/utils/storage'

type SocketCallback = (...args: unknown[]) => void

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const token = storage.getToken()
    if (!token) return

    const socket = io({
      path: '/socket.io',
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      transports: ['websocket', 'polling'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[Socket] Connected')
    })

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected')
    })

    socket.on('error', (error) => {
      console.error('[Socket] Error:', error)
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  const emit = useCallback((event: string, data?: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    }
  }, [])

  const on = useCallback((event: string, callback: SocketCallback) => {
    socketRef.current?.on(event, callback)
  }, [])

  const off = useCallback((event: string, callback?: SocketCallback) => {
    if (callback) {
      socketRef.current?.off(event, callback)
    } else {
      socketRef.current?.off(event)
    }
  }, [])

  return { socket: socketRef.current, emit, on, off }
}
