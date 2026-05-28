import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Tag,
  Card,
  Tree,
  Row,
  Col,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { locationApi, warehouseApi, shelfApi } from '../utils/api'

const statusMap: Record<number, string> = {
  1: 'green',
  2: 'orange',
  0: 'red',
}

const statusTextMap: Record<number, string> = {
  1: '正常',
  2: '盘点中',
  0: '禁用',
}

export default function Location() {
  const [data, setData] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [shelves, setShelves] = useState<any[]>([])
  const [treeData, setTreeData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [form] = Form.useForm()
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  useEffect(() => {
    loadData()
    loadWarehouses()
  }, [])

  const loadData = async (warehouseId?: number, shelfId?: number) => {
    setLoading(true)
    try {
      const params: any = { page: 1, pageSize: 100 }
      if (warehouseId) params.warehouseId = warehouseId
      if (shelfId) params.shelfId = shelfId
      const res = await locationApi.list(params)
      const result = res as any
      const list = (result.data?.list || result.list || []).map((item: any, index: number) => ({
        ...item,
        key: item.id || index,
        status: statusTextMap[item.status] || item.status,
        usedQty: item.usedCapacity || 0,
      }))
      setData(list)
    } catch (error) {
      message.error('加载库位列表失败')
    } finally {
      setLoading(false)
    }
  }

  const loadWarehouses = async () => {
    try {
      const res = await warehouseApi.list({ page: 1, pageSize: 100 })
      const result = res as any
      const whList = result.data?.list || result.list || []
      setWarehouses(whList)
      
      const treeDataResult = await Promise.all(
        whList.map(async (wh: any) => {
          const shelfRes = await shelfApi.list({ page: 1, pageSize: 100, warehouseId: wh.id })
          const shelfResult = shelfRes as any
          const shelfList = shelfResult.data?.list || shelfResult.list || []
          return {
            title: `${wh.warehouseName} (${wh.warehouseCode})`,
            key: `WH-${wh.id}`,
            children: shelfList.map((shelf: any) => ({
              title: shelf.shelfName,
              key: `SHELF-${shelf.id}`,
            })),
          }
        })
      )
      setTreeData(treeDataResult)
    } catch (error) {
      console.error('加载仓库列表失败', error)
    }
  }

  const loadShelves = async (warehouseId: number) => {
    try {
      const res = await shelfApi.list({ page: 1, pageSize: 100, warehouseId })
      const result = res as any
      setShelves(result.data?.list || result.list || [])
    } catch (error) {
      console.error('加载货架列表失败', error)
    }
  }

  const columns = [
    {
      title: '库位编码',
      dataIndex: 'locationCode',
      key: 'locationCode',
    },
    {
      title: '库位名称',
      dataIndex: 'locationName',
      key: 'locationName',
    },
    {
      title: '仓库',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: '货架',
      dataIndex: 'shelfCode',
      key: 'shelfCode',
    },
    {
      title: '容量',
      dataIndex: 'capacity',
      key: 'capacity',
    },
    {
      title: '已用',
      dataIndex: 'usedQty',
      key: 'usedQty',
      render: (used, record) => (
        <span>
          {used}
          <span style={{ color: '#999', fontSize: 12 }}>
            ({((used / record.capacity) * 100).toFixed(0)}%)
          </span>
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const statusNum = record.statusId !== undefined ? record.statusId :
          Number(Object.keys(statusTextMap).find(k => statusTextMap[Number(k)] === status) || 0)
        const color = statusMap[Number(statusNum)] || 'default'
        return <Tag color={color}>{status}</Tag>
      },
    },
    {
      title: '存储类别',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const handleCreate = () => {
    setEditingRecord(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleDelete = async (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除库位 ${record.locationCode} 吗？`,
      onOk: async () => {
        try {
          await locationApi.delete(record.id)
          message.success('删除成功')
          loadData()
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingRecord) {
        await locationApi.update({
          id: editingRecord.id,
          locationCode: values.locationCode,
          locationName: values.locationName,
          warehouseId: values.warehouseId,
          shelfId: values.shelfId,
          capacity: values.capacity,
          category: values.category || '',
          status: 1,
        })
        message.success('更新成功')
      } else {
        await locationApi.create({
          locationCode: values.locationCode,
          locationName: values.locationName,
          warehouseId: values.warehouseId,
          shelfId: values.shelfId,
          capacity: values.capacity,
          category: values.category || '',
          status: 1,
        })
        message.success('创建成功')
      }
      setIsModalOpen(false)
      form.resetFields()
      loadData()
    } catch (error) {
      message.error(editingRecord ? '更新失败' : '创建失败')
    }
  }

  const handleEdit = async (record) => {
    setEditingRecord(record)
    await loadShelves(record.warehouseId)
    form.setFieldsValue({
      locationCode: record.locationCode,
      locationName: record.locationName,
      warehouseId: record.warehouseId,
      shelfId: record.shelfId,
      capacity: record.capacity,
      category: record.category,
    })
    setIsModalOpen(true)
  }

  const onSelect = (selectedKeysValue: string[]) => {
    setSelectedKeys(selectedKeysValue)
    if (selectedKeysValue.length > 0) {
      const key = selectedKeysValue[0]
      if (key.startsWith('WH-')) {
        const warehouseId = Number(key.replace('WH-', ''))
        loadData(warehouseId)
      } else if (key.startsWith('SHELF-')) {
        const shelfId = Number(key.replace('SHELF-', ''))
        loadData(undefined, shelfId)
      }
    } else {
      loadData()
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>库位管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新增库位
        </Button>
      </div>

      <Row gutter={16}>
        <Col span={6}>
          <Card title="仓库结构" size="small" style={{ height: '100%' }}>
            <Tree
              showLine
              defaultExpandAll
              onSelect={onSelect}
              selectedKeys={selectedKeys}
              treeData={treeData}
            />
          </Card>
        </Col>
        <Col span={18}>
          <Card>
            <Table columns={columns} dataSource={data} loading={loading} />
          </Card>
        </Col>
      </Row>

      <Modal
        title={editingRecord ? '编辑库位' : '新增库位'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="locationCode"
            label="库位编码"
            rules={[{ required: true, message: '请输入库位编码' }]}
          >
            <Input placeholder="如：A-01-01" />
          </Form.Item>
          <Form.Item
            name="locationName"
            label="库位名称"
            rules={[{ required: true, message: '请输入库位名称' }]}
          >
            <Input placeholder="如：A区1层1号位" />
          </Form.Item>
          <Form.Item
            name="warehouseId"
            label="仓库"
            rules={[{ required: true, message: '请选择仓库' }]}
          >
            <Select
              placeholder="请选择仓库"
              onChange={(value) => {
                loadShelves(value)
                form.setFieldsValue({ shelfId: undefined })
              }}
            >
              {warehouses.map((wh) => (
                <Select.Option key={wh.id} value={wh.id}>
                  {wh.warehouseName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="shelfId"
            label="货架"
            rules={[{ required: true, message: '请选择货架' }]}
          >
            <Select placeholder="请选择货架">
              {shelves.map((shelf) => (
                <Select.Option key={shelf.id} value={shelf.id}>
                  {shelf.shelfName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="capacity"
            label="容量"
            rules={[{ required: true, message: '请输入容量' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="category" label="存储类别">
            <Select>
              <Select.Option value="电子产品">电子产品</Select.Option>
              <Select.Option value="服装">服装</Select.Option>
              <Select.Option value="食品">食品</Select.Option>
              <Select.Option value="日用品">日用品</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
