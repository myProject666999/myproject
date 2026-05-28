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
} from 'antd'
import { PlusOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { inboundApi, warehouseApi } from '../utils/api'

const statusMap: Record<number, string> = {
  1: 'orange',
  2: 'blue',
  3: 'cyan',
  4: 'green',
  0: 'red',
}

const statusTextMap: Record<number, string> = {
  1: '待审核',
  2: '待入库',
  3: '部分入库',
  4: '已完成',
  0: '已取消',
}

const orderTypeMap: Record<number, string> = {
  1: '采购入库',
  2: '退货入库',
  3: '调拨入库',
}

const orderTypeReverseMap: Record<string, number> = {
  '采购入库': 1,
  '退货入库': 2,
  '调拨入库': 3,
}

export default function Inbound() {
  const [data, setData] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
    loadWarehouses()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await inboundApi.list({ page: 1, pageSize: 20 })
      const result = res as any
      const list = (result.data?.list || result.list || []).map((item: any, index: number) => ({
        ...item,
        key: item.id || index,
        orderType: orderTypeMap[item.orderType] || item.orderType,
        status: statusTextMap[item.status] || item.status,
      }))
      setData(list)
    } catch (error) {
      message.error('加载入库单列表失败')
    } finally {
      setLoading(false)
    }
  }

  const loadWarehouses = async () => {
    try {
      const res = await warehouseApi.list({ page: 1, pageSize: 100 })
      const result = res as any
      setWarehouses(result.data?.list || result.list || [])
    } catch (error) {
      console.error('加载仓库列表失败', error)
    }
  }

  const columns = [
    {
      title: '入库单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
    },
    {
      title: '入库类型',
      dataIndex: 'orderType',
      key: 'orderType',
    },
    {
      title: '仓库',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: '总数量',
      dataIndex: 'totalQty',
      key: 'totalQty',
    },
    {
      title: '已入库',
      dataIndex: 'inboundQty',
      key: 'inboundQty',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const statusNum = record.statusId !== undefined ? record.statusId : 
          Object.keys(statusTextMap).find(k => statusTextMap[Number(k)] === status)
        const color = statusMap[Number(statusNum)] || 'default'
        return <Tag color={color}>{status}</Tag>
      },
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        const statusNum = record.statusId !== undefined ? record.statusId :
          Number(Object.keys(statusTextMap).find(k => statusTextMap[Number(k)] === record.status) || 0)
        return (
          <Space size="small">
            <Button type="link" size="small">
              详情
            </Button>
            {statusNum === 1 && (
              <Button
                type="link"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleAudit(record)}
              >
                审核
              </Button>
            )}
          </Space>
        )
      },
    },
  ]

  const handleAudit = async (record) => {
    Modal.confirm({
      title: '确认审核',
      content: `确定要审核入库单 ${record.orderNo} 吗？`,
      onOk: async () => {
        try {
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
          await inboundApi.audit({
            id: record.id,
            operator: userInfo.realName || '当前用户',
          })
          message.success('审核成功')
          loadData()
        } catch (error) {
          message.error('审核失败')
        }
      },
    })
  }

  const handleCreate = () => {
    setIsModalOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      await inboundApi.create({
        warehouseId: values.warehouseId,
        orderType: orderTypeReverseMap[values.orderType] || 1,
        supplier: values.supplier,
        totalQty: values.totalQty,
        status: 1,
        operator: userInfo.realName || '当前用户',
        remark: values.remark || '',
      })
      message.success('创建成功')
      setIsModalOpen(false)
      form.resetFields()
      loadData()
    } catch (error) {
      message.error('创建失败')
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>入库管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建入库单
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={data} loading={loading} />
      </Card>

      <Modal
        title="新建入库单"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="orderType"
            label="入库类型"
            rules={[{ required: true, message: '请选择入库类型' }]}
          >
            <Select>
              <Select.Option value="采购入库">采购入库</Select.Option>
              <Select.Option value="退货入库">退货入库</Select.Option>
              <Select.Option value="调拨入库">调拨入库</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="warehouseId"
            label="仓库"
            rules={[{ required: true, message: '请选择仓库' }]}
          >
            <Select placeholder="请选择仓库">
              {warehouses.map((wh) => (
                <Select.Option key={wh.id} value={wh.id}>
                  {wh.warehouseName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="supplier"
            label="供应商"
            rules={[{ required: true, message: '请输入供应商' }]}
          >
            <Input placeholder="请输入供应商名称" />
          </Form.Item>
          <Form.Item
            name="totalQty"
            label="总数量"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
