import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Modal, Form, message, Popconfirm, InputNumber, Select } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { getExamPapers, createExamPaper, updateExamPaper, deleteExamPaper } from '../utils/api'

const { Search } = Input
const { TextArea } = Input

const ExamPaperManagement = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [keyword, setKeyword] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const res = await getExamPapers({ page, pageSize, keyword })
      setData(res.data.items || [])
      setPagination({
        current: page,
        pageSize,
        total: res.data.total || 0
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [keyword])

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingItem) {
        await updateExamPaper(editingItem.id, values)
        message.success('更新成功')
      } else {
        await createExamPaper(values)
        message.success('添加成功')
      }
      setModalVisible(false)
      fetchData(pagination.current)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteExamPaper(id)
      message.success('删除成功')
      fetchData(pagination.current)
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '试卷名称', dataIndex: 'name', key: 'name' },
    { title: '试卷描述', dataIndex: 'description', key: 'description', ellipsis: true },
    { title: '总分', dataIndex: 'total_score', key: 'total_score', width: 80 },
    { title: '考试时长(分钟)', dataIndex: 'duration', key: 'duration', width: 120 },
    { title: '题目数量', dataIndex: 'question_count', key: 'question_count', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <span style={{ color: status === 1 ? '#52c41a' : '#ff4d4f' }}>
          {status === 1 ? '启用' : '禁用'}
        </span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除吗？"
            onConfirm={() => handleDelete(record.id)}
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
      <h2 className="page-title">试卷管理</h2>
      
      <div className="table-toolbar">
        <Search
          placeholder="搜索试卷名称"
          style={{ width: 250 }}
          onSearch={setKeyword}
          enterButton={<SearchOutlined />}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加试卷
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          onChange: (page, pageSize) => fetchData(page, pageSize)
        }}
      />

      <Modal
        title={editingItem ? '编辑试卷' : '添加试卷'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="试卷名称"
            name="name"
            rules={[{ required: true, message: '请输入试卷名称' }]}
          >
            <Input placeholder="请输入试卷名称" />
          </Form.Item>
          <Form.Item label="试卷描述" name="description">
            <TextArea rows={3} placeholder="请输入试卷描述" />
          </Form.Item>
          <Form.Item
            label="总分"
            name="total_score"
            rules={[{ required: true, message: '请输入总分' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入总分" />
          </Form.Item>
          <Form.Item
            label="考试时长(分钟)"
            name="duration"
            rules={[{ required: true, message: '请输入考试时长' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入考试时长" />
          </Form.Item>
          <Form.Item label="及格分数" name="pass_score">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入及格分数" />
          </Form.Item>
          <Form.Item label="状态" name="status" initialValue={1}>
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ExamPaperManagement
