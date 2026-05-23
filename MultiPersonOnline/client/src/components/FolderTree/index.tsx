import { useState } from 'react'
import { Tree, Button, Dropdown, Modal, Input, message, Spin } from 'antd'
import type { MenuProps } from 'antd'
import {
  FolderOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  FileOutlined,
} from '@ant-design/icons'
import type { Folder } from '@/types'
import { useDocumentStore } from '@/store/documentStore'

interface FolderTreeProps {
  onSelectFolder?: (folderId: string | null) => void
  selectedFolderId?: string | null
}

export default function FolderTree({ onSelectFolder, selectedFolderId }: FolderTreeProps) {
  const { folderTree, loading, createFolder, updateFolder, deleteFolder, fetchFolderTree } = useDocumentStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'create' | 'rename'>('create')
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null)
  const [folderName, setFolderName] = useState('')

  const buildTreeData = (folders: Folder[]): any[] => {
    return folders.map((folder) => ({
      key: folder.id,
      title: folder.name,
      icon: <FolderOutlined />,
      children: folder.children ? buildTreeData(folder.children) : [],
    }))
  }

  const handleSelect = (selectedKeys: React.Key[]) => {
    const folderId = selectedKeys.length > 0 ? (selectedKeys[0] as string) : null
    onSelectFolder?.(folderId === 'root' ? null : folderId)
  }

  const handleCreate = async () => {
    try {
      await createFolder({
        name: folderName,
        parentId: currentFolder?.id,
      })
      message.success('文件夹创建成功')
      setModalOpen(false)
      fetchFolderTree()
    } catch {
      message.error('创建失败')
    }
  }

  const handleRename = async () => {
    if (!currentFolder) return
    try {
      await updateFolder(currentFolder.id, { name: folderName })
      message.success('文件夹已重命名')
      setModalOpen(false)
      fetchFolderTree()
    } catch {
      message.error('重命名失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteFolder(id)
      message.success('文件夹已删除')
      fetchFolderTree()
    } catch {
      message.error('删除失败')
    }
  }

  const getActionMenu = (folder: Folder): MenuProps['items'] => [
    {
      key: 'create',
      icon: <PlusOutlined />,
      label: '新建子文件夹',
      onClick: () => {
        setCurrentFolder(folder)
        setFolderName('')
        setModalType('create')
        setModalOpen(true)
      },
    },
    {
      key: 'rename',
      icon: <EditOutlined />,
      label: '重命名',
      onClick: () => {
        setCurrentFolder(folder)
        setFolderName(folder.name)
        setModalType('rename')
        setModalOpen(true)
      },
    },
    { type: 'divider' as const },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      danger: true,
      onClick: () => handleDelete(folder.id),
    },
  ]

  const treeData = [
    {
      key: 'root',
      title: '全部文档',
      icon: <FileOutlined />,
      children: buildTreeData(folderTree),
    },
  ]

  const renderTitle = (node: any) => {
    if (node.key === 'root') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>全部文档</span>
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            onClick={(e) => {
              e.stopPropagation()
              setCurrentFolder(null)
              setFolderName('')
              setModalType('create')
              setModalOpen(true)
            }}
          />
        </div>
      )
    }
    const folder = folderTree.find((f) => f.id === node.key)
    if (!folder) return <span>{node.title}</span>
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{node.title}</span>
        <Dropdown
          menu={{ items: getActionMenu(folder) }}
          trigger={['click']}
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          />
        </Dropdown>
      </div>
    )
  }

  return (
    <>
      <Spin spinning={loading}>
        <Tree
          showIcon
          defaultExpandAll
          treeData={treeData}
          selectedKeys={selectedFolderId ? [selectedFolderId] : ['root']}
          onSelect={handleSelect}
          titleRender={renderTitle}
        />
      </Spin>
      <Modal
        title={modalType === 'create' ? '新建文件夹' : '重命名文件夹'}
        open={modalOpen}
        onOk={modalType === 'create' ? handleCreate : handleRename}
        onCancel={() => setModalOpen(false)}
        destroyOnClose
      >
        <Input
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="请输入文件夹名称"
        />
      </Modal>
    </>
  )
}
