import { useEffect, useState } from 'react'
import { Table, Button, Input, Space, Modal, Form, Select, message, Popconfirm, Tag } from 'antd'
import { SearchOutlined, EyeOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { taskResultApi } from '../../api'

interface TaskResult {
  id: number
  task_assignment: {
    user: { username: string; nickname: string }
    task: { title: string }
  }
  description: string
  image_urls: string
  video_url: string
  latitude: number
  longitude: number
  status: number
  audit_remark: string
  created_at: string
}

const TaskResultList = () => {
  const navigate = useNavigate()
  const [list, setList] = useState<TaskResult[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<string | undefined>()
  const [auditModalVisible, setAuditModalVisible] = useState(false)
  const [auditItem, setAuditItem] = useState<TaskResult | null>(null)
  const [auditForm] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [page, pageSize, status])

  const loadData = async () => {
    try {
      setLoading(true)
      const params: any = { page, page_size: pageSize }
      if (keyword) params.keyword = keyword
      if (status) params.status = status
      const res = await taskResultApi.getList(params)
      setList(res.data?.list || [])
      setTotal(res.data?.total || 0)
    } catch (error) {
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadData()
  }

  const handleDelete = async (id: number) => {
    try {
      await taskResultApi.delete(id)
      message.success('删除成功')
      loadData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleAudit = (item: TaskResult, pass: boolean) => {
    setAuditItem(item)
    auditForm.resetFields()
    auditForm.setFieldsValue({ status: pass ? 1 : 2 })
    setAuditModalVisible(true)
  }

  const handleAuditSubmit = async () => {
    if (!auditItem) return
    try {
      const values = await auditForm.validateFields()
      await taskResultApi.audit(auditItem.id, values)
      message.success('审核成功')
      setAuditModalVisible(false)
      loadData()
    } catch (error) {
      console.error(error)
    }
  }

  const statusMap: Record<number, { text: string; color: string }> = {
    0: { text: '待审核', color: 'orange' },
    1: { text: '已通过', color: 'green' },
    2: { text: '已拒绝', color: 'red' }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '用户',
      dataIndex: ['task_assignment', 'user', 'nickname'],
      key: 'user',
      render: (_: any, record: TaskResult) => (
        record.task_assignment?.user?.nickname || record.task_assignment?.user?.username
      )
    },
    {
      title: '任务',
      dataIndex: ['task_assignment', 'task', 'title'],
      key: 'task',
      ellipsis: true
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: '经纬度',
      key: 'location',
      render: (_: any, record: TaskResult) => (
        record.latitude && record.longitude
          ? `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}`
          : '-'
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: number) => {
        const item = statusMap[s] || statusMap[0]
        return <Tag color={item.color}>{item.text}</Tag>
      }
    },
    {
      title: '提交时间',
      dataIndex: 'created_at',
      key: 'created_at'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: TaskResult) => (
        <Space size={4}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/results/${record.id}`)}>
            详情
          </Button>
          {record.status === 0 && (
            <>
              <Button type="link" icon={<CheckOutlined />} onClick={() => handleAudit(record, true)}>
                通过
              </Button>
              <Button type="link" danger icon={<CloseOutlined />} onClick={() => handleAudit(record, false)}>
                拒绝
              </Button>
            </>
          )}
          <Popconfirm
            title="确定删除该结果吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        <Input
          placeholder="搜索用户"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 200 }}
          onPressEnter={handleSearch}
        />
        <Select
          placeholder="审核状态"
          value={status}
          onChange={setStatus}
          style={{ width: 120 }}
          allowClear
        >
          <Select.Option value="0">待审核</Select.Option>
          <Select.Option value="1">已通过</Select.Option>
          <Select.Option value="2">已拒绝</Select.Option>
        </Select>
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          搜索
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={list}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          }
        }}
      />

      <Modal
        title="审核结果"
        open={auditModalVisible}
        onCancel={() => setAuditModalVisible(false)}
        onOk={handleAuditSubmit}
      >
        <Form form={auditForm} layout="vertical">
          <Form.Item name="status" label="审核结果" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="audit_remark" label="审核备注">
            <Input.TextArea rows={3} placeholder="请输入审核备注（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TaskResultList
