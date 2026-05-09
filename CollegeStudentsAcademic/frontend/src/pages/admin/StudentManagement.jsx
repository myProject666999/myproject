import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, message, Popconfirm, Space, Select, Tag, InputNumber, DatePicker } from 'antd'
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons'
import { adminApi } from '../../utils/api'

const statusMap = { 0: '待审核', 1: '已审核', 2: '已拒绝' }
const statusColor = { 0: 'orange', 1: 'green', 2: 'red' }

function StudentManagement() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, page_size: 10, total: 0 })
  const [filters, setFilters] = useState({ keyword: '', status: '' })
  const [detailModal, setDetailModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [form] = Form.useForm()

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await adminApi.getStudents({ ...filters, page: pagination.page, page_size: pagination.page_size })
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

  const handleSearch = (values) => {
    setFilters(values)
    setPagination(p => ({ ...p, page: 1 }))
  }

  const handleAudit = async (id, status) => {
    try {
      await adminApi.auditStudent(id, { status })
      message.success('审核成功')
      loadData()
    } catch (error) {
      message.error('审核失败')
    }
  }

  const handleEdit = async (values) => {
    try {
      await adminApi.updateStudent(currentRecord.id, values)
      message.success('修改成功')
      setEditModal(false)
      loadData()
    } catch (error) {
      message.error('修改失败')
    }
  }

  const openEdit = (record) => {
    setCurrentRecord(record)
    form.setFieldsValue(record)
    setEditModal(true)
  }

  const columns = [
    { title: '学号', dataIndex: 'student_no' },
    { title: '姓名', dataIndex: 'real_name' },
    { title: '学院', dataIndex: 'college' },
    { title: '专业', dataIndex: 'major' },
    { title: '年级', dataIndex: 'grade' },
    {
      title: '状态',
      dataIndex: 'status',
      render: v => <Tag color={statusColor[v]}>{statusMap[v]}</Tag>
    },
    { title: '注册时间', dataIndex: 'created_at' },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => { setCurrentRecord(record); setDetailModal(true) }}>详情</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          {record.status === 0 && (
            <>
              <Button type="link" onClick={() => handleAudit(record.id, 1)}>通过</Button>
              <Button type="link" danger onClick={() => handleAudit(record.id, 2)}>拒绝</Button>
            </>
          )}
          <Popconfirm title="确定删除吗？" onConfirm={() => adminApi.deleteStudent(record.id).then(loadData)}>
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>学生管理</h3>
      
      <Form layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
        <Form.Item name="keyword">
          <Input placeholder="学号/姓名" style={{ width: 200 }} />
        </Form.Item>
        <Form.Item name="status">
          <Select placeholder="全部状态" style={{ width: 150 }} allowClear>
            <Select.Option value="">全部</Select.Option>
            <Select.Option value="0">待审核</Select.Option>
            <Select.Option value="1">已审核</Select.Option>
            <Select.Option value="2">已拒绝</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>搜索</Button>
        </Form.Item>
      </Form>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.page_size,
          total: pagination.total,
          onChange: page => setPagination(p => ({ ...p, page }))
        }}
      />

      <Modal title="学生详情" open={detailModal} onCancel={() => setDetailModal(false)} footer={null} width={600}>
        {currentRecord && (
          <div style={{ lineHeight: 2 }}>
            <p><b>学号:</b> {currentRecord.student_no}</p>
            <p><b>姓名:</b> {currentRecord.real_name}</p>
            <p><b>性别:</b> {currentRecord.gender || '-'}</p>
            <p><b>电话:</b> {currentRecord.phone || '-'}</p>
            <p><b>邮箱:</b> {currentRecord.email || '-'}</p>
            <p><b>学院:</b> {currentRecord.college || '-'}</p>
            <p><b>专业:</b> {currentRecord.major || '-'}</p>
            <p><b>班级:</b> {currentRecord.class || '-'}</p>
            <p><b>年级:</b> {currentRecord.grade || '-'}</p>
            <p><b>状态:</b> <Tag color={statusColor[currentRecord.status]}>{statusMap[currentRecord.status]}</Tag></p>
          </div>
        )}
      </Modal>

      <Modal title="编辑学生" open={editModal} onCancel={() => setEditModal(false)} footer={null}>
        <Form form={form} onFinish={handleEdit} layout="vertical">
          <Form.Item name="real_name" label="姓名"><Input /></Form.Item>
          <Form.Item name="gender" label="性别">
            <Select>
              <Select.Option value="男">男</Select.Option>
              <Select.Option value="女">女</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="phone" label="电话"><Input /></Form.Item>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
          <Form.Item name="college" label="学院"><Input /></Form.Item>
          <Form.Item name="major" label="专业"><Input /></Form.Item>
          <Form.Item name="grade" label="年级"><Input /></Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>保存</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default StudentManagement
