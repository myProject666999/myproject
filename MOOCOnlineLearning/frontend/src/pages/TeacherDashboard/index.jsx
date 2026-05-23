import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Typography, Table, Button, Space, Tag, Statistic, Modal, Form, Input, Select, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getTeacherCourses, publishCourse, offlineCourse, deleteCourse } from '../../api/course'
import { createCourse, updateCourse } from '../../api/course'

const { Title, Text } = Typography
const { Option } = Select

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    setLoading(true)
    try {
      const res = await getTeacherCourses()
      setCourses(res.list || [])
    } catch (err) {
      message.error(err.message || '加载失败')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (id) => {
    try {
      await publishCourse(id)
      message.success('课程已发布')
      loadCourses()
    } catch (err) {
      message.error(err.message || '发布失败')
    }
  }

  const handleOffline = async (id) => {
    try {
      await offlineCourse(id)
      message.success('课程已下架')
      loadCourses()
    } catch (err) {
      message.error(err.message || '下架失败')
    }
  }

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后课程将无法恢复，确认删除吗？',
      onOk: async () => {
        try {
          await deleteCourse(id)
          message.success('删除成功')
          loadCourses()
        } catch (err) {
          message.error(err.message || '删除失败')
        }
      }
    })
  }

  const handleAdd = () => {
    setEditingCourse(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingCourse(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingCourse) {
        await updateCourse(editingCourse.id, values)
        message.success('更新成功')
      } else {
        await createCourse(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadCourses()
    } catch (err) {
      message.error(err.message || '操作失败')
    }
  }

  const columns = [
    {
      title: '课程名称',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: '分类',
      dataIndex: 'category_id',
      key: 'category_id'
    },
    {
      title: '难度',
      dataIndex: 'level',
      key: 'level',
      render: (level) => {
        const text = ['入门', '初级', '中级', '高级']
        const color = ['green', 'blue', 'orange', 'red']
        return <Tag color={color[level]}>{text[level]}</Tag>
      }
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => price > 0 ? `¥${price}` : '免费'
    },
    {
      title: '学员数',
      dataIndex: 'student_count',
      key: 'student_count'
    },
    {
      title: '评分',
      dataIndex: 'rating_avg',
      key: 'rating_avg',
      render: (rating) => rating > 0 ? rating : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const map = {
          0: { text: '草稿', color: 'default' },
          1: { text: '已发布', color: 'green' },
          2: { text: '已下架', color: 'orange' }
        }
        return <Tag color={map[status]?.color}>{map[status]?.text}</Tag>
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/course/${record.id}`)}>
            查看
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {record.status === 0 && (
            <Button type="link" icon={<CheckCircleOutlined />} onClick={() => handlePublish(record.id)}>
              发布
            </Button>
          )}
          {record.status === 1 && (
            <Button type="link" icon={<StopOutlined />} onClick={() => handleOffline(record.id)}>
              下架
            </Button>
          )}
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  const stats = {
    total: courses.length,
    published: courses.filter(c => c.status === 1).length,
    students: courses.reduce((sum, c) => sum + (c.student_count || 0), 0)
  }

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="课程总数" value={stats.total} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="已发布" value={stats.published} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="学员总数" value={stats.students} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
      </Row>

      <Card
        title="课程管理"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>创建课程</Button>}
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={courses}
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={editingCourse ? '编辑课程' : '创建课程'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="课程标题" rules={[{ required: true }]}>
            <Input placeholder="请输入课程标题" />
          </Form.Item>
          <Form.Item name="subtitle" label="课程副标题">
            <Input placeholder="请输入课程副标题" />
          </Form.Item>
          <Form.Item name="category_id" label="课程分类" rules={[{ required: true }]}>
            <Select placeholder="请选择分类">
              <Option value={1}>前端开发</Option>
              <Option value={2}>后端开发</Option>
              <Option value={3}>移动开发</Option>
              <Option value={4}>数据库</Option>
              <Option value={5}>运维</Option>
            </Select>
          </Form.Item>
          <Form.Item name="level" label="难度等级" rules={[{ required: true }]}>
            <Select placeholder="请选择难度">
              <Option value={0}>入门</Option>
              <Option value={1}>初级</Option>
              <Option value={2}>中级</Option>
              <Option value={3}>高级</Option>
            </Select>
          </Form.Item>
          <Form.Item name="price" label="价格" rules={[{ required: true }]}>
            <Input type="number" placeholder="0 表示免费" />
          </Form.Item>
          <Form.Item name="description" label="课程描述" rules={[{ required: true }]}>
            <Input.TextArea rows={4} placeholder="请输入课程描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
