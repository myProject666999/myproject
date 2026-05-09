import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Select,
  message,
  Space,
  Popconfirm,
  Card,
  Typography,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { adminAPI } from '../../services/api'
import type { PageResponse } from '../../types'

const { Title } = Typography
const { Option } = Select

interface ExpenseSubject {
  id: number
  name: string
  code: string
  description: string
  status: number
}

export const ExpenseSubjectManagement: React.FC = () => {
  const [items, setItems] = useState<ExpenseSubject[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')

  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<ExpenseSubject | null>(null)
  const [form] = Form.useForm()

  const fetchList = async () => {
    try {
      setLoading(true)
      const result: PageResponse<ExpenseSubject> = await adminAPI.getExpenseSubjectsList({
        page,
        page_size: pageSize,
        keyword,
      })
      if (result.list) {
        setItems(result.list)
        setTotal(result.total)
      } else {
        setItems(result as any)
        setTotal((result as any).length || 0)
      }
    } catch (error) {
      message.error('获取费用科目列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchList()
  }, [page, pageSize, keyword])

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (item: ExpenseSubject) => {
    setEditingItem(item)
    form.setFieldsValue(item)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await adminAPI.deleteExpenseSubject(id)
      message.success('删除成功')
      fetchList()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (editingItem) {
        await adminAPI.updateExpenseSubject(editingItem.id, values)
        message.success('更新成功')
      } else {
        await adminAPI.createExpenseSubject(values)
        message.success('创建成功')
      }

      setModalVisible(false)
      fetchList()
    } catch (error: any) {
      if (error.errorFields) {
        return
      }
      message.error('操作失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '科目编码', dataIndex: 'code', key: 'code' },
    { title: '科目名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (status === 1 ? '启用' : '禁用'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ExpenseSubject) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个费用科目吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={4}>费用科目管理</Title>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input
            placeholder="搜索科目名称或编码"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => {
              setPage(1)
              fetchList()
            }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增费用科目
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={items}
          loading={loading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            },
          }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑费用科目' : '新增费用科目'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="科目编码"
            rules={[{ required: true, message: '请输入科目编码' }]}
          >
            <Input placeholder="例如：FY001" />
          </Form.Item>

          <Form.Item
            name="name"
            label="科目名称"
            rules={[{ required: true, message: '请输入科目名称' }]}
          >
            <Input placeholder="例如：挂号费" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Option value={1}>启用</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
