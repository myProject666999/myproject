import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Space,
  Typography,
  List,
  Tag,
  Modal,
  message,
  Empty,
  Popconfirm,
  Descriptions,
} from 'antd'
import {
  ArrowLeftOutlined,
  HistoryOutlined,
  RollbackOutlined,
  EyeOutlined,
  DeleteOutlined,
  UserOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { versionsApi } from '@/api/versions'
import type { DocumentVersion } from '@/types'

const { Title, Text } = Typography

export default function VersionHistory() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [previewVersion, setPreviewVersion] = useState<DocumentVersion | null>(null)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)

  useEffect(() => {
    fetchVersions()
  }, [id])

  const fetchVersions = async () => {
    if (!id) return
    setLoading(true)
    try {
      const result = await versionsApi.getVersions(id) as unknown as { data: DocumentVersion[] }
      setVersions(result.data || [])
    } catch {
      message.error('获取版本列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = (version: DocumentVersion) => {
    setPreviewVersion(version)
    setPreviewModalOpen(true)
  }

  const handleRollback = async (version: DocumentVersion) => {
    if (!id) return
    try {
      await versionsApi.rollbackToVersion(id, version.id)
      message.success('已回滚到该版本')
      navigate(`/editor/${id}`)
    } catch {
      message.error('回滚失败')
    }
  }

  const handleDelete = async (versionId: string) => {
    if (!id) return
    try {
      await versionsApi.deleteVersion(id, versionId)
      message.success('版本已删除')
      fetchVersions()
    } catch {
      message.error('删除失败')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          />
          <Title level={4} style={{ margin: 0 }}>
            <HistoryOutlined style={{ marginRight: 8 }} />
            版本历史
          </Title>
        </Space>
      </div>

      {versions.length === 0 ? (
        <Empty description="暂无版本记录" style={{ marginTop: 60 }} />
      ) : (
        <List
          loading={loading}
          dataSource={versions}
          renderItem={(version) => (
            <List.Item
              style={{
                padding: 16,
                background: '#fafafa',
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <List.Item.Meta
                avatar={<HistoryOutlined style={{ fontSize: 24, color: '#1677ff' }} />}
                title={
                  <Space>
                    <span>版本 v{version.versionNumber}</span>
                    {version.changeDescription && (
                      <Tag color="blue">{version.changeDescription}</Tag>
                    )}
                  </Space>
                }
                description={
                  <Space>
                    <UserOutlined />
                    <Text type="secondary">创建者: {version.createdBy}</Text>
                    <Text type="secondary">
                      {dayjs(version.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Text>
                  </Space>
                }
              />
              <Space>
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(version)}
                >
                  预览
                </Button>
                <Popconfirm
                  title="确定回滚到此版本？"
                  description="当前内容将被替换为此版本的内容"
                  onConfirm={() => handleRollback(version)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" icon={<RollbackOutlined />}>
                    回滚
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="确定删除此版本？"
                  description="删除后无法恢复"
                  onConfirm={() => handleDelete(version.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
              </Space>
            </List.Item>
          )}
        />
      )}

      <Modal
        title={`预览版本 v${previewVersion?.versionNumber}`}
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalOpen(false)}>
            关闭
          </Button>,
          previewVersion && (
            <Popconfirm
              key="rollback"
              title="确定回滚到此版本？"
              onConfirm={() => {
                handleRollback(previewVersion)
                setPreviewModalOpen(false)
              }}
              okText="确定"
              cancelText="取消"
            >
              <Button type="primary" icon={<RollbackOutlined />}>
                回滚到此版本
              </Button>
            </Popconfirm>
          ),
        ]}
        width={720}
      >
        <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
          <Descriptions.Item label="版本号">v{previewVersion?.versionNumber}</Descriptions.Item>
          <Descriptions.Item label="描述">{previewVersion?.changeDescription || '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {previewVersion && dayjs(previewVersion.createdAt).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
        </Descriptions>
        <div
          style={{
            maxHeight: 400,
            overflow: 'auto',
            padding: 16,
            background: '#fafafa',
            borderRadius: 4,
          }}
          dangerouslySetInnerHTML={{ __html: previewVersion?.content || '' }}
        />
      </Modal>
    </div>
  )
}
