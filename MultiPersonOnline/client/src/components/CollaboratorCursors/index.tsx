import { useEffect } from 'react'
import type { Collaborator } from '@/types'

interface CollaboratorCursorsProps {
  collaborators: Collaborator[]
  containerRef: React.RefObject<HTMLDivElement>
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
]

export function getCollaboratorColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function CollaboratorCursors({ collaborators, containerRef }: CollaboratorCursorsProps) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const existingCursors = container.querySelectorAll('.collaborator-cursor')
    existingCursors.forEach((el) => el.remove())

    collaborators.forEach((collaborator) => {
      const cursor = document.createElement('div')
      cursor.className = 'collaborator-cursor'
      cursor.style.cssText = `
        position: absolute;
        width: 2px;
        height: 20px;
        background-color: ${collaborator.color};
        pointer-events: none;
        z-index: 100;
        transition: all 0.1s ease;
      `

      const label = document.createElement('div')
      label.style.cssText = `
        position: absolute;
        top: -20px;
        left: -1px;
        background-color: ${collaborator.color};
        color: white;
        font-size: 12px;
        padding: 2px 6px;
        border-radius: 3px;
        white-space: nowrap;
      `
      label.textContent = collaborator.username

      cursor.appendChild(label)
      container.appendChild(cursor)
    })

    return () => {
      const cursors = container.querySelectorAll('.collaborator-cursor')
      cursors.forEach((el) => el.remove())
    }
  }, [collaborators, containerRef])

  return null
}
