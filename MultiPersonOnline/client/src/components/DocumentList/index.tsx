import { useState } from 'react'
import { Table, Button, Space, Tag, Dropdown, Modal, Input, message } from 'antd'
import type { MenuProps } from 'antd'
import {
  FileTextOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  HistoryOutlined,
  FolderOpenOutlined,
  FileOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import type { Document } from '@/types'
import { useDocumentStore } from '@/store/documentStore'

interface DocumentListProps {
  showFolderColumn?: boolean
}

export default function DocumentList({ showFolderColumn = false }: DocumentListProps) {
  const navigate = useNavigate()
  const { documents, loading, deleteDocument } = useDocumentStore()
  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [renameDoc, setRenameDoc] = useState<Document | null>(null)
  const [renameTitle, setRenameTitle] = useState('')

  const handleRename = async () => {
    if (!renameDoc) return
    try {
      message.success('文档已重命名')
      setRenameModalOpen(false)
    } catch {
      message.error('重命名失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id)
      message.success('文档已移至回收站')
    } catch {
      message.error('删除失败')
    }
  }

  const getActionMenu = (record: Document): MenuProps['items'] => [
    {
      key: 'open',
      icon: <FileTextOutlined />,
      label: '打开',
      onClick: () => navigate(`/editor/${record.id}`),
    },
    {
      key: 'rename',
      icon: <EditOutlined />,
      label: '重命名',
      onClick: () => {
        setRenameDoc(record)
        setRenameTitle(record.title)
        setRenameModalOpen(true)
      },
    },
    {
      key: 'share',
      icon: <ShareAltOutlined />,
      label: '分享',
      onClick: () => navigate(`/documents/${record.id}/share`),
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: '版本历史',
      onClick: () => navigate(`/documents/${record.id}/versions`),
    },
    { type: 'divider' as const },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => handleDelete(record.id),
    },
  ]

  const columns = [
    {
      title: '文档名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Document) => (
        <Space>
          <FileOutlined />
          <a onClick={() => navigate(`/editor/${record.id}`)}>{text}</a>
        </Space>
      ),
    },
    ...(showFolderColumn
      ? [
          {
            title: '文件夹',
            dataIndex: 'folderId',
            key: 'folderId',
            render: (folderId: string | null) => (
              <Space>
                <FolderOpenOutlined />
                <span>{folderId ? '指定文件夹' : '根目录'}</span>
              </Space>
            ),
          },
        ]
      : []),
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: () => <Tag color="success">正常</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: Document) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ]

  return (
    <>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={documents}
        loading={loading}
        pagination={false}
      />
      <Modal
        title="重命名文档"
        open={renameModalOpen}
        onOk={handleRename}
        onCancel={() => setRenameModalOpen(false)}
        destroyOnClose
      >
        <Input
          value={renameTitle}
          onChange={(e) => setRenameTitle(e.target.value)}
          placeholder="请输入文档名称"
        />
      </Modal>
    </>
  )
}
