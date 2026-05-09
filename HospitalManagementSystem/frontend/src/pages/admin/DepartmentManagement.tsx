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
import type { Department, PageResponse } from '../../types'

const { Title } = Typography
const { Option } = Select

const DEPARTMENT_TYPES = [
  { value: 1, label: '临床科室' },
  { value: 2, label: '医技科室' },
  { value: 3, label: '行政科室' },
  { value: 4, label: '其他' },
]

export const DepartmentManagement: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')

  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<Department | null>(null)
  const [form] = Form.useForm()

  const fetchList = async () => {
    try {
      setLoading(true)
      const result: PageResponse<Department> = await adminAPI.getDepartmentsList({
        page,
        page_size: pageSize,
        keyword,
      })
      if (result.list) {
        setDepartments(result.list)
        setTotal(result.total)
      } else {
        setDepartments(result as any)
        setTotal((result as any).length || 0)
      }
    } catch (error) {
      message.error('获取科室列表失败')
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

  const handleEdit = (item: Department) => {
    setEditingItem(item)
    form.setFieldsValue(item)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await adminAPI.deleteDepartment(id)
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
        await adminAPI.updateDepartment(editingItem.id, values)
        message.success('更新成功')
      } else {
        await adminAPI.createDepartment(values)
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
    { title: '科室编码', dataIndex: 'code', key: 'code' },
    { title: '科室名称', dataIndex: 'name', key: 'name' },
    {
      title: '科室类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: number) => {
        const t = DEPARTMENT_TYPES.find((d) => d.value === type)
        return t?.label || '-'
      },
    },
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
      render: (_: any, record: Department) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个科室吗？"
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
      <Title level={4}>科室管理</Title>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input
            placeholder="搜索科室名称或编码"
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
            新增科室
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={departments}
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
        title={editingItem ? '编辑科室' : '新增科室'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="科室编码"
            rules={[{ required: true, message: '请输入科室编码' }]}
          >
            <Input placeholder="例如：NK001" />
          </Form.Item>

          <Form.Item
            name="name"
            label="科室名称"
            rules={[{ required: true, message: '请输入科室名称' }]}
          >
            <Input placeholder="例如：内科" />
          </Form.Item>

          <Form.Item
            name="type"
            label="科室类型"
            rules={[{ required: true, message: '请选择科室类型' }]}
          >
            <Select placeholder="请选择科室类型">
              {DEPARTMENT_TYPES.map((t) => (
                <Option key={t.value} value={t.value}>
                  {t.label}
                </Option>
              ))}
            </Select>
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
