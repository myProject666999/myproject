import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Select,
  InputNumber,
  message,
  Space,
  Popconfirm,
  Card,
  Typography,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { adminAPI } from '../../services/api'
import type { ChargeItem, PageResponse } from '../../types'

const { Title } = Typography
const { Option } = Select

const CATEGORIES = [
  { value: 'examination', label: '检查项目' },
  { value: 'laboratory', label: '检验项目' },
  { value: 'treatment', label: '治疗项目' },
  { value: 'other', label: '其他项目' },
]

export const ChargeItemManagement: React.FC = () => {
  const [items, setItems] = useState<ChargeItem[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')

  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<ChargeItem | null>(null)
  const [form] = Form.useForm()

  const fetchList = async () => {
    try {
      setLoading(true)
      const result: PageResponse<ChargeItem> = await adminAPI.getChargeItems({
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
      message.error('获取收费项目列表失败')
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

  const handleEdit = (item: ChargeItem) => {
    setEditingItem(item)
    form.setFieldsValue(item)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await adminAPI.deleteChargeItem(id)
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
        await adminAPI.updateChargeItem(editingItem.id, values)
        message.success('更新成功')
      } else {
        await adminAPI.createChargeItem(values)
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
    { title: '项目编码', dataIndex: 'code', key: 'code' },
    { title: '项目名称', dataIndex: 'name', key: 'name' },
    {
      title: '项目类别',
      dataIndex: 'category',
      key: 'category',
      render: (cat: string) => {
        const c = CATEGORIES.find((d) => d.value === cat)
        return c?.label || cat
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price?.toFixed(2) || 0}`,
    },
    { title: '拼音码', dataIndex: 'pinyin_code', key: 'pinyin_code' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (status === 1 ? '启用' : '禁用'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ChargeItem) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个收费项目吗？"
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
      <Title level={4}>收费项目管理</Title>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input
            placeholder="搜索项目名称或编码"
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
            新增收费项目
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
        title={editingItem ? '编辑收费项目' : '新增收费项目'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="项目编码"
            rules={[{ required: true, message: '请输入项目编码' }]}
          >
            <Input placeholder="例如：JC001" />
          </Form.Item>

          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="例如：血常规检查" />
          </Form.Item>

          <Form.Item
            name="category"
            label="项目类别"
            rules={[{ required: true, message: '请选择项目类别' }]}
          >
            <Select placeholder="请选择项目类别">
              {CATEGORIES.map((c) => (
                <Option key={c.value} value={c.value}>
                  {c.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.01}
              placeholder="例如：50.00"
              prefix="¥"
            />
          </Form.Item>

          <Form.Item name="pinyin_code" label="拼音码">
            <Input placeholder="自动生成或手动输入" />
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
