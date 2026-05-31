import React, { useEffect, useState } from 'react'
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, DatePicker, message, Popconfirm, Typography, Row, Col } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CalendarOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { scheduleApi, teamApi } from '../api'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select

const statusMap = {
  DRAFT: { color: 'default', text: '草稿' },
  PUBLISHED: { color: 'green', text: '已发布' },
  ARCHIVED: { color: 'blue', text: '已归档' }
}

const typeMap = {
  WEEKLY: '周循环',
  MONTHLY: '月循环',
  ONCE: '一次性'
}

export default function ScheduleList() {
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [teamsRes, schedulesRes] = await Promise.all([
        teamApi.getMyTeams(),
        Promise.resolve({ data: [] })
      ])
      setTeams(teamsRes.data || [])
      if (teamsRes.data?.length > 0) {
        const res = await scheduleApi.getByTeam(teamsRes.data[0].id)
        setSchedules(res.data || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingSchedule(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingSchedule(record)
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await scheduleApi.delete(id)
      message.success('删除成功')
      loadData()
    } catch (error) {
      message.error(error.message || '删除失败')
    }
  }

  const handlePublish = async (id) => {
    try {
      await scheduleApi.publish(id)
      message.success('发布成功')
      loadData()
    } catch (error) {
      message.error(error.message || '发布失败')
    }
  }

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        startDate: values.startDate?.format('YYYY-MM-DD'),
        endDate: values.endDate?.format('YYYY-MM-DD'),
        teamId: values.teamId || teams[0]?.id
      }
      if (editingSchedule) {
        await scheduleApi.update(editingSchedule.id, data)
        message.success('更新成功')
      } else {
        await scheduleApi.create(data)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (error) {
      message.error(error.message || '操作失败')
    }
  }

  const columns = [
    {
      title: '排班名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Link to={`/schedules/${record.id}`} style={{ fontWeight: 500 }}>
          {text}
        </Link>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => typeMap[type] || type
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
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate'
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/schedules/${record.id}`)}>
            查看
          </Button>
          {record.status === 'DRAFT' && (
            <>
              <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                编辑
              </Button>
              <Button type="link" icon={<PlayCircleOutlined />} onClick={() => handlePublish(record.id)}>
                发布
              </Button>
              <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
                <Button type="link" danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      )
    }
  ]

  return (
    <div>
      <Title level={4} className="page-title">排班表管理</Title>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Text type="secondary">共 {schedules.length} 个排班表</Text>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建排班
          </Button>
        </div>

        <Table
          rowKey="id"
          dataSource={schedules}
          columns={columns}
          loading={loading}
        />
      </Card>

      <Modal
        title={editingSchedule ? '编辑排班' : '新建排班'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item name="name" label="排班名称" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="请输入排班名称" />
          </Form.Item>
          <Form.Item name="teamId" label="团队" rules={[{ required: true, message: '请选择团队' }]}>
            <Select placeholder="请选择团队">
              {teams.map(team => (
                <Option key={team.id} value={team.id}>{team.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="type" label="排班类型" rules={[{ required: true }]}>
            <Select>
              <Option value="WEEKLY">周循环</Option>
              <Option value="MONTHLY">月循环</Option>
              <Option value="ONCE">一次性</Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="开始日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="结束日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
