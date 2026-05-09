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
import type { SettlementCategory, PageResponse } from '../../types'

const { Title } = Typography
const { Option } = Select

export const SettlementCategoryManagement: React.FC = () => {
  const [items, setItems] = useState<SettlementCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')

  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<SettlementCategory | null>(null)
  const [form] = Form.useForm()

  const fetchList = async () => {
    try {
      setLoading(true)
      const result: PageResponse<SettlementCategory> = await adminAPI.getSettlementCategoriesList({
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
      message.error('获取结算类别列表失败')
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

  const handleEdit = (item: SettlementCategory) => {
    setEditingItem(item)
    form.setFieldsValue(item)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await adminAPI.deleteSettlementCategory(id)
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
        await adminAPI.updateSettlementCategory(editingItem.id, values)
        message.success('更新成功')
      } else {
        await adminAPI.createSettlementCategory(values)
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
    { title: '类别名称', dataIndex: 'name', key: 'name' },
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
      render: (_: any, record: SettlementCategory) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个结算类别吗？"
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
      <Title level={4}>结算类别管理</Title>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input
            placeholder="搜索类别名称"
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
            新增结算类别
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
        title={editingItem ? '编辑结算类别' : '新增结算类别'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="类别名称"
            rules={[{ required: true, message: '请输入类别名称' }]}
          >
            <Input placeholder="例如：医保" />
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
