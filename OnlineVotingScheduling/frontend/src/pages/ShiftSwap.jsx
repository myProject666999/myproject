import React, { useEffect, useState } from 'react'
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, message, Typography, Popconfirm, Tabs } from 'antd'
import { PlusOutlined, CheckOutlined, CloseOutlined, UndoOutlined } from '@ant-design/icons'
import { shiftSwapApi, scheduleSlotApi, teamApi, userApi } from '../api'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TextArea } = Input

const statusMap = {
  PENDING: { color: 'orange', text: '待审批' },
  APPROVED: { color: 'green', text: '已通过' },
  REJECTED: { color: 'red', text: '已拒绝' },
  CANCELLED: { color: 'default', text: '已取消' }
}

export default function ShiftSwap() {
  const [mySwaps, setMySwaps] = useState([])
  const [allSwaps, setAllSwaps] = useState([])
  const [users, setUsers] = useState([])
  const [mySlots, setMySlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [swapsRes, usersRes, slotsRes] = await Promise.all([
        shiftSwapApi.getMySwaps(),
        userApi.getAll(),
        scheduleSlotApi.getMySlots()
      ])
      setMySwaps(swapsRes.data || [])
      setAllSwaps(swapsRes.data || [])
      setUsers(usersRes.data || [])
      setMySlots(slotsRes.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const getUserName = (id) => {
    const user = users.find(u => u.id === id)
    return user?.realName || user?.username || `用户#${id}`
  }

  const handleAdd = () => {
    form.resetFields()
    setModalVisible(true)
  }

  const handleSubmit = async (values) => {
    try {
      await shiftSwapApi.create(values)
      message.success('调班申请已提交')
      setModalVisible(false)
      loadData()
    } catch (error) {
      message.error(error.message || '提交失败')
    }
  }

  const handleApprove = async (id) => {
    try {
      await shiftSwapApi.approve(id, '同意调班')
      message.success('已批准')
      loadData()
    } catch (error) {
      message.error(error.message || '操作失败')
    }
  }

  const handleReject = async (id) => {
    try {
      await shiftSwapApi.reject(id, '拒绝调班')
      message.success('已拒绝')
      loadData()
    } catch (error) {
      message.error(error.message || '操作失败')
    }
  }

  const handleCancel = async (id) => {
    try {
      await shiftSwapApi.cancel(id)
      message.success('已取消')
      loadData()
    } catch (error) {
      message.error(error.message || '操作失败')
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
      title: '原值班人',
      dataIndex: 'originalUserId',
      key: 'originalUserId',
      render: (id) => getUserName(id)
    },
    {
      title: '代班人',
      dataIndex: 'swapUserId',
      key: 'swapUserId',
      render: (id) => getUserName(id)
    },
    {
      title: '调班原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const s = statusMap[status] || { color: 'default', text: status }
        return <Tag color={s.color}>{s.text}</Tag>
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'PENDING' && (
            <>
              <Button type="link" icon={<CheckOutlined />} onClick={() => handleApprove(record.id)}>
                通过
              </Button>
              <Button type="link" danger icon={<CloseOutlined />} onClick={() => handleReject(record.id)}>
                拒绝
              </Button>
              <Button type="link" icon={<UndoOutlined />} onClick={() => handleCancel(record.id)}>
                取消
              </Button>
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <Title level={4} className="page-title">调班申请</Title>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            发起调班
          </Button>
        </div>

        <Table
          rowKey="id"
          dataSource={mySwaps}
          columns={columns}
          loading={loading}
        />
      </Card>

      <Modal
        title="发起调班申请"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="slotId" label="值班时段" rules={[{ required: true, message: '请选择值班时段' }]}>
            <Select placeholder="请选择要调班的时段" showSearch optionFilterProp="children">
              {mySlots.map(slot => (
                <Option key={slot.id} value={slot.id}>
                  {slot.date} {slot.startTime}-{slot.endTime}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="swapUserId" label="代班人员" rules={[{ required: true, message: '请选择代班人员' }]}>
            <Select placeholder="请选择代班人员" showSearch optionFilterProp="children">
              {users.map(user => (
                <Option key={user.id} value={user.id}>{user.realName} ({user.username})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="reason" label="调班原因" rules={[{ required: true, message: '请输入调班原因' }]}>
            <TextArea rows={4} placeholder="请输入调班原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
