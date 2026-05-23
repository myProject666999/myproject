import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Space, Typography, Input, message, Tooltip, Dropdown } from 'antd'
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ShareAltOutlined,
  HistoryOutlined,
  MoreOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import RichEditor from '@/components/RichEditor'
import UserAvatar from '@/components/UserAvatar'
import { useDocumentStore } from '@/store/documentStore'
import { useUserStore } from '@/store/userStore'
import { useSocket } from '@/hooks/useSocket'
import type { Collaborator } from '@/types'
import { getCollaboratorColor } from '@/components/CollaboratorCursors'

const { Title } = Typography

export default function Editor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { currentDocument, fetchDocument, updateDocument } = useDocumentStore()
  const { user } = useUserStore()
  const { emit, on, off } = useSocket()
  const editorRef = useRef<HTMLDivElement>(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string>('')
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [editingTitle, setEditingTitle] = useState(false)

  useEffect(() => {
    if (id) {
      fetchDocument(Number(id))
    }
  }, [id, fetchDocument])

  useEffect(() => {
    if (currentDocument) {
      setTitle(currentDocument.title)
      setContent(currentDocument.content || '')
    }
  }, [currentDocument])

  useEffect(() => {
    if (!id || !user) return

    emit('join-document', { documentId: id, userId: user.id, username: user.username })

    const handleUserJoined = (data: unknown) => {
      const { userId, username, avatar } = data as { userId: string; username: string; avatar?: string }
      setCollaborators((prev) => {
        if (prev.find((c) => c.userId === userId)) return prev
        return [
          ...prev,
          {
            userId,
            username,
            avatar,
            cursor: { pos: 0 },
            color: getCollaboratorColor(userId),
          },
        ]
      })
    }

    const handleUserLeft = (data: unknown) => {
      const { userId } = data as { userId: string }
      setCollaborators((prev) => prev.filter((c) => c.userId !== userId))
    }

    const handleCursorUpdate = (data: unknown) => {
      const { userId, pos } = data as { userId: string; pos: number }
      setCollaborators((prev) =>
        prev.map((c) =>
          c.userId === userId ? { ...c, cursor: { pos } } : c
        )
      )
    }

    const handleContentUpdate = (data: unknown) => {
      const { content: remoteContent } = data as { content: string }
      setContent(remoteContent)
    }

    on('user-joined', handleUserJoined)
    on('user-left', handleUserLeft)
    on('cursor-update', handleCursorUpdate)
    on('content-update', handleContentUpdate)

    return () => {
      off('user-joined', handleUserJoined)
      off('user-left', handleUserLeft)
      off('cursor-update', handleCursorUpdate)
      off('content-update', handleContentUpdate)
      emit('leave-document', { documentId: id, userId: user.id })
    }
  }, [id, user, emit, on, off])

  const handleSave = useCallback(async () => {
    if (!id) return
    setIsSaving(true)
    try {
      await updateDocument(Number(id), { title, content })
      setLastSaved(dayjs().format('HH:mm:ss'))
      message.success('保存成功')
    } catch {
      message.error('保存失败')
    } finally {
      setIsSaving(false)
    }
  }, [id, title, content, updateDocument])

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
    if (id) {
      emit('content-change', { documentId: id, content: newContent })
    }
  }, [id, emit])

  const handleTitleChange = async () => {
    setEditingTitle(false)
    if (id && title !== currentDocument?.title) {
      try {
        await updateDocument(Number(id), { title })
        message.success('标题已更新')
      } catch {
        message.error('标题更新失败')
      }
    }
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
          padding: '0 8px',
        }}
      >
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard')}
          />
          {editingTitle ? (
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleChange}
              onPressEnter={handleTitleChange}
              autoFocus
              style={{ width: 300 }}
            />
          ) : (
            <Title
              level={4}
              style={{ margin: 0, cursor: 'pointer' }}
              onClick={() => setEditingTitle(true)}
            >
              {title || '未命名文档'}
            </Title>
          )}
        </Space>

        <Space>
          <Space size={4}>
            <TeamOutlined style={{ color: '#999' }} />
            <span style={{ color: '#999', fontSize: 14 }}>
              {collaborators.length + 1} 人在线
            </span>
            <Space size={-8} style={{ marginLeft: 8 }}>
              {user && <UserAvatar user={user} size={28} />}
              {collaborators.slice(0, 3).map((c) => (
                <UserAvatar
                  key={c.userId}
                  user={{
                    id: Number(c.userId),
                    username: c.username,
                    avatarUrl: c.avatar,
                    email: '',
                    createdAt: '',
                    updatedAt: '',
                    status: 1,
                  }}
                  size={28}
                />
              ))}
              {collaborators.length > 3 && (
                <Tooltip title={`还有 ${collaborators.length - 3} 人`}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                    }}
                  >
                    +{collaborators.length - 3}
                  </div>
                </Tooltip>
              )}
            </Space>
          </Space>

          {lastSaved && (
            <span style={{ color: '#999', fontSize: 12 }}>
              已保存于 {lastSaved}
            </span>
          )}

          <Tooltip title="保存">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={isSaving}
            >
              保存
            </Button>
          </Tooltip>

          <Dropdown
            menu={{
              items: [
                {
                  key: 'share',
                  icon: <ShareAltOutlined />,
                  label: '分享',
                  onClick: () => navigate(`/documents/${id}/share`),
                },
                {
                  key: 'history',
                  icon: <HistoryOutlined />,
                  label: '版本历史',
                  onClick: () => navigate(`/documents/${id}/versions`),
                },
              ],
            }}
          >
            <Button icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      </div>

      <div ref={editorRef} style={{ position: 'relative' }}>
        <RichEditor
          content={content}
          onChange={handleContentChange}
          placeholder="开始输入内容..."
        />
      </div>
    </div>
  )
}
