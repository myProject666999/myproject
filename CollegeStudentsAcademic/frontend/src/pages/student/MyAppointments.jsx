import { useEffect, useState } from 'react'
import { Table, Button, Tag, message, Popconfirm, Modal, Form, Input, DatePicker, Select, Space, InputNumber } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { studentApi } from '../../utils/api'
import dayjs from 'dayjs'

const statusMap = { 0: '待确认', 1: '已确认', 2: '已完成', 3: '已取消' }
const statusColor = { 0: 'orange', 1: 'blue', 2: 'green', 3: 'red' }

function MyAppointments() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ page: 1, page_size: 10, total: 0 })
  const [filters, setFilters] = useState({ status: '', keyword: '' })
  const [editModal, setEditModal] = useState(false)
  const [currentRecord, setCurrentRecord] = useState(null)
  const [form] = Form.useForm()

  const loadData = async () => {
    setLoading(true)
    try {
      const result = await studentApi.getAppointments({ ...filters, page: pagination.page, page_size: pagination.page_size })
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

  const openEdit = (record) => {
    setCurrentRecord(record)
    form.setFieldsValue({
      date: record.appointment_date ? dayjs(record.appointment_date) : null,
      time: record.appointment_time ? dayjs(record.appointment_time, 'HH:mm') : null,
      contact_phone: record.contact_phone,
      remark: record.remark
    })
    setEditModal(true)
  }

  const handleEdit = async (values) => {
    try {
      const updateData = {
        appointment_date: values.date?.format('YYYY-MM-DD'),
        appointment_time: values.time?.format('HH:mm'),
        contact_phone: values.contact_phone,
        remark: values.remark
      }
      await studentApi.updateAppointment(currentRecord.id, updateData)
      message.success('修改成功')
      setEditModal(false)
      loadData()
    } catch (error) {
      message.error('修改失败')
    }
  }

  const handleDelete = async (id) => {
    try {
      await studentApi.deleteAppointment(id)
      message.success('取消成功')
      loadData()
    } catch (error) {
      message.error('操作失败')
    }
  }

  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']

  const columns = [
    { title: '服务', dataIndex: 'service', render: v => v?.title || '-' },
    { title: '预约日期', dataIndex: 'appointment_date' },
    { title: '预约时间', dataIndex: 'appointment_time' },
    { title: '联系电话', dataIndex: 'contact_phone' },
    { title: '状态', dataIndex: 'status', render: v => <Tag color={statusColor[v]}>{statusMap[v]}</Tag> },
    { title: '备注', dataIndex: 'remark' },
    { title: '创建时间', dataIndex: 'created_at' },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          {record.status === 0 && (
            <>
              <Button type="link" icon={<EditOutlined />} onClick={() => openEdit(record)}>修改</Button>
              <Popconfirm title="确定取消预约吗？" onConfirm={() => handleDelete(record.id)}>
                <Button type="link" danger icon={<DeleteOutlined />}>取消</Button>
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <h2 style={{ marginBottom: 24 }}>我的预约</h2>
      
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Select 
            placeholder="全部状态" 
            style={{ width: 150 }} 
            allowClear
            value={filters.status || undefined}
            onChange={v => { setFilters(f => ({ ...f, status: v || '' })); setPagination(p => ({ ...p, page: 1 })) }}
          >
            <Select.Option value="0">待确认</Select.Option>
            <Select.Option value="1">已确认</Select.Option>
            <Select.Option value="2">已完成</Select.Option>
            <Select.Option value="3">已取消</Select.Option>
          </Select>
          <Input.Search
            placeholder="搜索服务名称或备注"
            style={{ width: 250 }}
            allowClear
            onSearch={v => { setFilters(f => ({ ...f, keyword: v })); setPagination(p => ({ ...p, page: 1 })) }}
          />
        </Space>
      </div>

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

      <Modal title="修改预约" open={editModal} onCancel={() => setEditModal(false)} footer={null}>
        <Form form={form} onFinish={handleEdit} layout="vertical">
          <Form.Item name="date" label="预约日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} disabledDate={current => current && current < dayjs().startOf('day')} />
          </Form.Item>
          <Form.Item name="time" label="预约时间" rules={[{ required: true }]}>
            <Select placeholder="请选择时间段">
              {timeSlots.map(t => (
                <Select.Option key={t} value={dayjs(t, 'HH:mm')}>{t}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="contact_phone" label="联系电话">
            <Input />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>保存</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MyAppointments
