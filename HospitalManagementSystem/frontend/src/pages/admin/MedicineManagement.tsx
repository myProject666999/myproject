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
import type { Medicine, PageResponse } from '../../types'

const { Title } = Typography
const { Option } = Select

const MEDICINE_TYPES = [
  { value: 1, label: '西药' },
  { value: 2, label: '中成药' },
  { value: 3, label: '中药饮片' },
  { value: 4, label: '其他' },
]

export const MedicineManagement: React.FC = () => {
  const [items, setItems] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')

  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<Medicine | null>(null)
  const [form] = Form.useForm()

  const fetchList = async () => {
    try {
      setLoading(true)
      const result: PageResponse<Medicine> = await adminAPI.getMedicines({
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
      message.error('获取药品列表失败')
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

  const handleEdit = (item: Medicine) => {
    setEditingItem(item)
    form.setFieldsValue(item)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await adminAPI.deleteMedicine(id)
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
        await adminAPI.updateMedicine(editingItem.id, values)
        message.success('更新成功')
      } else {
        await adminAPI.createMedicine(values)
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
    { title: '药品编码', dataIndex: 'code', key: 'code' },
    { title: '药品名称', dataIndex: 'name', key: 'name' },
    { title: '通用名', dataIndex: 'generic_name', key: 'generic_name' },
    { title: '规格', dataIndex: 'specification', key: 'specification' },
    { title: '单位', dataIndex: 'unit', key: 'unit' },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price?.toFixed(2) || 0}`,
    },
    { title: '库存', dataIndex: 'stock', key: 'stock' },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: number) => {
        const t = MEDICINE_TYPES.find((d) => d.value === type)
        return t?.label || '-'
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (status === 1 ? '启用' : '禁用'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Medicine) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个药品吗？"
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
      <Title level={4}>药品管理</Title>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input
            placeholder="搜索药品名称或编码"
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
            新增药品
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
        title={editingItem ? '编辑药品' : '新增药品'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="药品编码"
            rules={[{ required: true, message: '请输入药品编码' }]}
          >
            <Input placeholder="例如：YP001" />
          </Form.Item>

          <Form.Item
            name="name"
            label="药品名称"
            rules={[{ required: true, message: '请输入药品名称' }]}
          >
            <Input placeholder="例如：阿莫西林胶囊" />
          </Form.Item>

          <Form.Item name="generic_name" label="通用名">
            <Input placeholder="例如：阿莫西林" />
          </Form.Item>

          <Form.Item name="specification" label="规格">
            <Input placeholder="例如：0.25g*24粒" />
          </Form.Item>

          <Form.Item name="unit" label="单位">
            <Input placeholder="例如：盒" />
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
              placeholder="例如：25.00"
              prefix="¥"
            />
          </Form.Item>

          <Form.Item name="stock" label="初始库存">
            <InputNumber style={{ width: '100%' }} min={0} defaultValue={0} />
          </Form.Item>

          <Form.Item name="manufacturer" label="生产厂家">
            <Input placeholder="例如：石药集团" />
          </Form.Item>

          <Form.Item
            name="type"
            label="药品类型"
            rules={[{ required: true, message: '请选择药品类型' }]}
          >
            <Select placeholder="请选择药品类型">
              {MEDICINE_TYPES.map((t) => (
                <Option key={t.value} value={t.value}>
                  {t.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="pinyin_code" label="拼音码">
            <Input placeholder="自动生成或手动输入" />
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
