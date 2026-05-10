import { useEffect, useState } from 'react'
import { Table, Button, Input, Space, Modal, Form, Select, message, Popconfirm, InputNumber } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { taskApi, taskTypeApi, publisherApi } from '../../api'

interface Task {
  id: number
  title: string
  task_type: { id: number; name: string }
  publisher: { id: number; name: string }
  reward: number
  points: number
  location: string
  status: number
  audit_status: number
}

const TaskList = () => {
  const navigate = useNavigate()
  const [list, setList] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<string | undefined>()
  const [auditStatus, setAuditStatus] = useState<string | undefined>()
  const [modalVisible, setModalVisible] = useState(false)
  const [auditModalVisible, setAuditModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<Task | null>(null)
  const [auditItem, setAuditItem] = useState<Task | null>(null)
  const [taskTypes, setTaskTypes] = useState<any[]>([])
  const [publishers, setPublishers] = useState<any[]>([])
  const [form] = Form.useForm()
  const [auditForm] = Form.useForm()

  useEffect(() => {
    loadData()
    loadOptions()
  }, [page, pageSize, status, auditStatus])

  const loadOptions = async () => {
    try {
      const [typeRes, pubRes] = await Promise.all([
        taskTypeApi.getAll(),
        publisherApi.getAll()
      ])
      setTaskTypes(typeRes.data || [])
      setPublishers(pubRes.data || [])
    } catch (error) {
      console.error(error)
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const params: any = { page, page_size: pageSize }
      if (keyword) params.keyword = keyword
      if (status) params.status = status
      if (auditStatus) params.audit_status = auditStatus
      const res = await taskApi.getList(params)
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

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    form.setFieldsValue({ status: 1, reward: 0, points: 0 })
    setModalVisible(true)
  }

  const handleEdit = (item: Task) => {
    setEditingItem(item)
    form.setFieldsValue({
      ...item,
      task_type_id: item.task_type?.id,
      publisher_id: item.publisher?.id
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await taskApi.delete(id)
      message.success('删除成功')
      loadData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingItem) {
        await taskApi.update(editingItem.id, values)
        message.success('更新成功')
      } else {
        await taskApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleAudit = (item: Task, pass: boolean) => {
    setAuditItem(item)
    auditForm.resetFields()
    auditForm.setFieldsValue({ audit_status: pass ? 1 : 2 })
    setAuditModalVisible(true)
  }

  const handleAuditSubmit = async () => {
    if (!auditItem) return
    try {
      const values = await auditForm.validateFields()
      await taskApi.audit(auditItem.id, values)
      message.success('审核成功')
      setAuditModalVisible(false)
      loadData()
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '任务标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '任务类型',
      dataIndex: ['task_type', 'name'],
      key: 'task_type'
    },
    {
      title: '发布者',
      dataIndex: ['publisher', 'name'],
      key: 'publisher'
    },
    {
      title: '奖励',
      dataIndex: 'reward',
      key: 'reward',
      render: (v: number) => `¥${v}`
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points'
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      ellipsis: true
    },
    {
      title: '发布状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <span className={`status-tag ${status === 1 ? 'status-active' : 'status-inactive'}`}>
          {status === 1 ? '已发布' : '未发布'}
        </span>
      )
    },
    {
      title: '审核状态',
      dataIndex: 'audit_status',
      key: 'audit_status',
      render: (status: number) => {
        const map: Record<number, { text: string; class: string }> = {
          0: { text: '待审核', class: 'status-pending' },
          1: { text: '已通过', class: 'status-approved' },
          2: { text: '已拒绝', class: 'status-rejected' }
        }
        const item = map[status] || map[0]
        return <span className={`status-tag ${item.class}`}>{item.text}</span>
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Task) => (
        <Space size={4}>
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/tasks/${record.id}`)}>
            详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {record.audit_status === 0 && (
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
            title="确定删除该任务吗？"
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input
            placeholder="搜索任务标题"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 200 }}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="发布状态"
            value={status}
            onChange={setStatus}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value="1">已发布</Select.Option>
            <Select.Option value="0">未发布</Select.Option>
          </Select>
          <Select
            placeholder="审核状态"
            value={auditStatus}
            onChange={setAuditStatus}
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
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增任务
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
        title={editingItem ? '编辑任务' : '新增任务'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="任务标题"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>
          <Form.Item
            name="task_type_id"
            label="任务类型"
            rules={[{ required: true, message: '请选择任务类型' }]}
          >
            <Select placeholder="请选择任务类型">
              {taskTypes.map(item => (
                <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="publisher_id"
            label="发布者"
            rules={[{ required: true, message: '请选择发布者' }]}
          >
            <Select placeholder="请选择发布者">
              {publishers.map(item => (
                <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="任务描述">
            <Input.TextArea rows={3} placeholder="请输入任务描述" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="reward" label="奖励金额" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} placeholder="奖励金额" prefix="¥" />
            </Form.Item>
            <Form.Item name="points" label="积分" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} placeholder="积分" />
            </Form.Item>
          </div>
          <Form.Item name="location" label="任务地点">
            <Input placeholder="请输入任务地点" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="latitude" label="纬度" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} placeholder="纬度" />
            </Form.Item>
            <Form.Item name="longitude" label="经度" style={{ flex: 1 }}>
              <InputNumber style={{ width: '100%' }} placeholder="经度" />
            </Form.Item>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="start_date" label="开始日期" style={{ flex: 1 }}>
              <Input placeholder="如: 2024-01-01" />
            </Form.Item>
            <Form.Item name="end_date" label="结束日期" style={{ flex: 1 }}>
              <Input placeholder="如: 2024-12-31" />
            </Form.Item>
          </div>
          <Form.Item name="max_participants" label="最大参与人数">
            <InputNumber style={{ width: '100%' }} placeholder="0表示不限制" />
          </Form.Item>
          <Form.Item name="video_url" label="视频地址">
            <Input placeholder="请输入视频URL" />
          </Form.Item>
          <Form.Item name="thumbnail" label="缩略图地址">
            <Input placeholder="请输入缩略图URL" />
          </Form.Item>
          <Form.Item name="status" label="发布状态">
            <Select>
              <Select.Option value={1}>已发布</Select.Option>
              <Select.Option value={0}>未发布</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="任务审核"
        open={auditModalVisible}
        onCancel={() => setAuditModalVisible(false)}
        onOk={handleAuditSubmit}
      >
        <Form form={auditForm} layout="vertical">
          <Form.Item name="audit_status" label="审核结果" hidden>
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

export default TaskList
