import { useState, useEffect } from 'react'
import {
  Button,
  Space,
  Typography,
  Table,
  Tag,
  Popconfirm,
  message,
  Empty,
  Modal,
} from 'antd'
import {
  DeleteOutlined,
  UndoOutlined,
  DeleteFilled,
  FileOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { documentsApi } from '@/api/documents'
import type { RecycleBinItem } from '@/types'

const { Title, Text } = Typography

export default function RecycleBin() {
  const [documents, setDocuments] = useState<RecycleBinItem[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  useEffect(() => {
    fetchDeletedDocuments()
  }, [])

  const fetchDeletedDocuments = async () => {
    setLoading(true)
    try {
      const items = await documentsApi.getDeletedDocuments() as unknown as RecycleBinItem[]
      setDocuments(items || [])
    } catch {
      message.error('获取回收站文档失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await documentsApi.restoreDocument(id)
      message.success('文档已恢复')
      fetchDeletedDocuments()
    } catch {
      message.error('恢复失败')
    }
  }

  const handlePermanentlyDelete = async (id: string) => {
    try {
      await documentsApi.permanentlyDelete(id)
      message.success('文档已永久删除')
      fetchDeletedDocuments()
      setSelectedRowKeys((prev) => prev.filter((key) => key !== id))
    } catch {
      message.error('删除失败')
    }
  }

  const handleBatchRestore = async () => {
    if (selectedRowKeys.length === 0) return
    try {
      await Promise.all(
        selectedRowKeys.map((key) => documentsApi.restoreDocument(key as string))
      )
      message.success(`已恢复 ${selectedRowKeys.length} 个文档`)
      setSelectedRowKeys([])
      fetchDeletedDocuments()
    } catch {
      message.error('部分文档恢复失败')
    }
  }

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return
    Modal.confirm({
      title: '确认永久删除',
      icon: <ExclamationCircleOutlined />,
      content: `确定要永久删除选中的 ${selectedRowKeys.length} 个文档吗？此操作无法撤销。`,
      okText: '永久删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await Promise.all(
            selectedRowKeys.map((key) => documentsApi.permanentlyDelete(key as string))
          )
          message.success(`已永久删除 ${selectedRowKeys.length} 个文档`)
          setSelectedRowKeys([])
          fetchDeletedDocuments()
        } catch {
          message.error('部分文档删除失败')
        }
      },
    })
  }

  const columns: any[] = [
    {
      title: '文档名称',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <Space>
          <FileOutlined style={{ color: '#999' }} />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: '删除时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (text: string | null | undefined) =>
        text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: () => <Tag color="red">已删除</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: RecycleBinItem) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<UndoOutlined />}
            onClick={() => handleRestore(String(record.id))}
          >
            恢复
          </Button>
          <Popconfirm
            title="确定永久删除此文档？"
            description="此操作无法撤销"
            onConfirm={() => handlePermanentlyDelete(String(record.id))}
            okText="删除"
            okType="danger"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              永久删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          <DeleteFilled style={{ marginRight: 8 }} />
          回收站
        </Title>
        <Space>
          {selectedRowKeys.length > 0 && (
            <>
              <Button
                icon={<UndoOutlined />}
                onClick={handleBatchRestore}
              >
                恢复选中 ({selectedRowKeys.length})
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBatchDelete}
              >
                永久删除选中
              </Button>
            </>
          )}
        </Space>
      </div>

      {documents.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical">
              <span>回收站是空的</span>
              <Text type="secondary" style={{ fontSize: 12 }}>
                删除的文档将在这里保留 30 天
              </Text>
            </Space>
          }
          style={{ marginTop: 60 }}
        />
      ) : (
        <Table
          rowKey="id"
          columns={columns}
          dataSource={documents}
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
          }}
        />
      )}

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <ExclamationCircleOutlined style={{ marginRight: 4 }} />
          回收站中的文档将在 30 天后自动永久删除
        </Text>
      </div>
    </div>
  )
}
