import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, message, Popconfirm, Space, Select, Tag, DatePicker, Input } from 'antd'
import { SearchOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { adminApi } from '../../utils/api'

const statusMap = { 0: '待确认', 1: '已确认', 2: '已完成', 3: '已取消' }
const statusColor = { 0: 'orange', 1: 'blue', 2: 'green', 3: 'red' }

function AppointmentManagement() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, page_size: 10, total: 0 })
  const [filters, setFilters] = useState({ status: '' })
  const [detailModal, setDetailModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [form] = Form.useForm()

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await adminApi.getAppointments({ ...filters, page: pagination.page, page_size: pagination.page_size })
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

  const handleEdit = async (values) => {
    try {
      await adminApi.updateAppointment(currentRecord.id, values)
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
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '学生', dataIndex: 'student', render: v => v?.real_name || '-' },
    { title: '学号', dataIndex: 'student', render: v => v?.student_no || '-' },
    { title: '服务', dataIndex: 'service', render: v => v?.title || '-' },
    { title: '预约日期', dataIndex: 'appointment_date' },
    { title: '预约时间', dataIndex: 'appointment_time' },
    { title: '联系电话', dataIndex: 'contact_phone' },
    { title: '状态', dataIndex: 'status', render: v => <Tag color={statusColor[v]}>{statusMap[v]}</Tag> },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => { setCurrentRecord(record); setDetailModal(true) }}>详情</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => adminApi.deleteAppointment(record.id).then(loadData)}>
            <Button type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>预约管理</h3>
      
      <Form layout="inline" onFinish={(v) => { setFilters(v); setPagination(p => ({ ...p, page: 1 })) }} style={{ marginBottom: 16 }}>
        <Form.Item name="status">
          <Select placeholder="全部状态" style={{ width: 150 }} allowClear>
            <Select.Option value="">全部</Select.Option>
            <Select.Option value="0">待确认</Select.Option>
            <Select.Option value="1">已确认</Select.Option>
            <Select.Option value="2">已完成</Select.Option>
            <Select.Option value="3">已取消</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item><Button type="primary" htmlType="submit" icon={<SearchOutlined />}>搜索</Button></Form.Item>
      </Form>

      <Table columns={columns} dataSource={data} rowKey="id" loading={loading}
        pagination={{ current: pagination.page, pageSize: pagination.page_size, total: pagination.total, onChange: page => setPagination(p => ({ ...p, page })) }} />

      <Modal title="预约详情" open={detailModal} onCancel={() => setDetailModal(false)} footer={null} width={600}>
        {currentRecord && (
          <div style={{ lineHeight: 2 }}>
            <p><b>学生:</b> {currentRecord.student?.real_name} ({currentRecord.student?.student_no})</p>
            <p><b>服务:</b> {currentRecord.service?.title}</p>
            <p><b>预约日期:</b> {currentRecord.appointment_date}</p>
            <p><b>预约时间:</b> {currentRecord.appointment_time}</p>
            <p><b>联系电话:</b> {currentRecord.contact_phone || '-'}</p>
            <p><b>备注:</b> {currentRecord.remark || '-'}</p>
            <p><b>状态:</b> <Tag color={statusColor[currentRecord.status]}>{statusMap[currentRecord.status]}</Tag></p>
          </div>
        )}
      </Modal>

      <Modal title="编辑预约" open={editModal} onCancel={() => setEditModal(false)} footer={null}>
        <Form form={form} onFinish={handleEdit} layout="vertical">
          <Form.Item name="appointment_date" label="预约日期"><Input /></Form.Item>
          <Form.Item name="appointment_time" label="预约时间"><Input /></Form.Item>
          <Form.Item name="contact_phone" label="联系电话"><Input /></Form.Item>
          <Form.Item name="remark" label="备注"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value={0}>待确认</Select.Option>
              <Select.Option value={1}>已确认</Select.Option>
              <Select.Option value={2}>已完成</Select.Option>
              <Select.Option value={3}>已取消</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item><Button type="primary" htmlType="submit" block>保存</Button></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default AppointmentManagement
