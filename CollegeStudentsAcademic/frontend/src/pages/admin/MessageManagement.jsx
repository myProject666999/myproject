import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Select, Tag } from 'antd'
import { SearchOutlined, MessageOutlined, DeleteOutlined } from '@ant-design/icons'
import { adminApi } from '../../utils/api'

const statusMap = { 0: '待回复', 1: '已回复' }
const statusColor = { 0: 'orange', 1: 'green' }

function MessageManagement() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, page_size: 10, total: 0 })
  const [filters, setFilters] = useState({ status: '' })
  const [replyModal, setReplyModal] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [form] = Form.useForm()

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await adminApi.getMessages({ ...filters, page: pagination.page, page_size: pagination.page_size })
      setData(result.list || [])
      setPagination(p => ({ ...p, total: result.total || 0 }))
    } catch (error) {
      message.error('加载失败')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [pagination.page, filters])

  const handleReply = async (values) => {
    try {
      await adminApi.replyMessage(currentRecord.id, values)
      message.success('回复成功')
      setReplyModal(false)
      form.resetFields()
      loadData()
    } catch (error) {
      message.error('回复失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '学生', dataIndex: 'student', render: v => v?.real_name || '-' },
    { title: '学号', dataIndex: 'student', render: v => v?.student_no || '-' },
    { title: '标题', dataIndex: 'title' },
    {
      title: '内容',
      dataIndex: 'content',
      render: v => v?.length > 30 ? v.slice(0, 30) + '...' : v
    },
    { title: '状态', dataIndex: 'status', render: v => <Tag color={statusColor[v]}>{statusMap[v]}</Tag> },
    { title: '留言时间', dataIndex: 'created_at' },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => { setCurrentRecord(record); setDetailModal(true) }}>查看</Button>
          {record.status === 0 && (
            <Button type="link" icon={<MessageOutlined />} onClick={() => { setCurrentRecord(record); form.resetFields(); setReplyModal(true) }}>回复</Button>
          )}
          <Popconfirm title="确定删除吗？" onConfirm={() => adminApi.deleteMessage(record.id).then(loadData)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>留言管理</h3>
      
      <Form layout="inline" onFinish={(v) => { setFilters(v); setPagination(p => ({ ...p, page: 1 })) }} style={{ marginBottom: 16 }}>
        <Form.Item name="status">
          <Select placeholder="全部状态" style={{ width: 150 }} allowClear>
            <Select.Option value="">全部</Select.Option>
            <Select.Option value="0">待回复</Select.Option>
            <Select.Option value="1">已回复</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item><Button type="primary" htmlType="submit" icon={<SearchOutlined />}>搜索</Button></Form.Item>
      </Form>

      <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
        pagination={{ current: pagination.page, pageSize: pagination.page_size, total: pagination.total, onChange: page => setPagination(p => ({ ...p, page })) }} />

      <Modal title="留言详情" open={detailModal} onCancel={() => setDetailModal(false)} footer={null} width={600}>
        {currentRecord && (
          <div style={{ lineHeight: 2 }}>
            <p><b>学生:</b> {currentRecord.student?.real_name} ({currentRecord.student?.student_no})</p>
            <p><b>标题:</b> {currentRecord.title}</p>
            <p><b>内容:</b></p>
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, marginBottom: 16 }}>{currentRecord.content}</div>
            {currentRecord.reply && (
              <>
                <p><b>回复:</b></p>
                <div style={{ background: '#e6f7ff', padding: 12, borderRadius: 4 }}>{currentRecord.reply}</div>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal title="回复留言" open={replyModal} onCancel={() => setReplyModal(false)} footer={null}>
        <Form form={form} onFinish={handleReply} layout="vertical">
          {currentRecord && (
            <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 4, marginBottom: 16 }}>
              <p><b>{currentRecord.title}</b></p>
              <p style={{ color: '#666' }}>{currentRecord.content}</p>
            </div>
          )}
          <Form.Item name="reply" label="回复内容" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="请输入回复内容" />
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" block>发送回复</Button></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MessageManagement
