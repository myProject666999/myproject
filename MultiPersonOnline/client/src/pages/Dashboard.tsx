import { useState, useEffect } from 'react'
import { Row, Col, Button, Input, Space, Typography, Modal, Form, message } from 'antd'
import {
  PlusOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  ShareAltOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import FolderTree from '@/components/FolderTree'
import DocumentList from '@/components/DocumentList'
import { useDocumentStore } from '@/store/documentStore'

const { Title } = Typography

export default function Dashboard() {
  const navigate = useNavigate()
  const { fetchDocuments, fetchFolderTree, fetchFolders, createDocument, loading } = useDocumentStore()
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchFolderTree()
    fetchFolders()
    fetchDocuments({ folderId: undefined })
  }, [fetchFolderTree, fetchFolders, fetchDocuments])

  useEffect(() => {
    fetchDocuments({ folderId: selectedFolderId ?? undefined })
  }, [selectedFolderId, fetchDocuments])

  const handleCreateDocument = async () => {
    try {
      const values = await form.validateFields()
      const doc = await createDocument({
        title: values.title,
        folderId: selectedFolderId ?? undefined,
      })
      message.success('文档创建成功')
      setCreateModalOpen(false)
      form.resetFields()
      navigate(`/editor/${doc.id}`)
    } catch (err) {
      if (err !== false) {
        message.error('创建文档失败')
      }
    }
  }

  const recentDocuments = [
    { id: '1', title: '项目需求文档', updatedAt: '2024-01-15 14:30' },
    { id: '2', title: '会议纪要', updatedAt: '2024-01-15 10:20' },
    { id: '3', title: '技术方案设计', updatedAt: '2024-01-14 16:45' },
  ]

  const sharedDocuments = [
    { id: '4', title: '团队周报模板', sharedBy: '张三' },
    { id: '5', title: '产品规划', sharedBy: '李四' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          工作台
        </Title>
        <Space>
          <Input.Search
            placeholder="搜索文档..."
            style={{ width: 240 }}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            新建文档
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8} lg={6}>
          <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
            <Title level={5} style={{ marginTop: 0 }}>
              文件夹
            </Title>
            <FolderTree
              onSelectFolder={setSelectedFolderId}
              selectedFolderId={selectedFolderId}
            />
          </div>
        </Col>
        <Col xs={24} md={16} lg={18}>
          <div style={{ background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 24 }}>
            <Title level={5} style={{ marginTop: 0 }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              我的文档
            </Title>
            <DocumentList showFolderColumn={!selectedFolderId} />
          </div>

          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
                <Title level={5} style={{ marginTop: 0 }}>
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  最近编辑
                </Title>
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/editor/${doc.id}`)}
                  >
                    <FileTextOutlined style={{ marginRight: 8 }} />
                    {doc.title}
                    <div style={{ color: '#999', fontSize: 12 }}>{doc.updatedAt}</div>
                  </div>
                ))}
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div style={{ background: '#fafafa', padding: 16, borderRadius: 8 }}>
                <Title level={5} style={{ marginTop: 0 }}>
                  <ShareAltOutlined style={{ marginRight: 8 }} />
                  共享给我
                </Title>
                {sharedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/editor/${doc.id}`)}
                  >
                    <FileTextOutlined style={{ marginRight: 8 }} />
                    {doc.title}
                    <div style={{ color: '#999', fontSize: 12 }}>由 {doc.sharedBy} 共享</div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>

      <Modal
        title="新建文档"
        open={createModalOpen}
        onOk={handleCreateDocument}
        onCancel={() => {
          setCreateModalOpen(false)
          form.resetFields()
        }}
        okText="创建"
        cancelText="取消"
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="文档名称"
            rules={[{ required: true, message: '请输入文档名称' }]}
          >
            <Input placeholder="请输入文档名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
