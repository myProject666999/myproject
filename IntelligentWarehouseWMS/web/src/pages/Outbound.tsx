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
import { PlusOutlined, CheckCircleOutlined, CarOutlined } from '@ant-design/icons'
import { outboundApi, pickingApi, warehouseApi } from '../utils/api'

const statusMap: Record<number, string> = {
  1: 'orange',
  2: 'blue',
  3: 'cyan',
  4: 'purple',
  5: 'green',
  0: 'red',
}

const statusTextMap: Record<number, string> = {
  1: '待审核',
  2: '待拣货',
  3: '拣货中',
  4: '部分出库',
  5: '已完成',
  0: '已取消',
}

const pickingStatusMap: Record<number, string> = {
  1: 'orange',
  2: 'green',
}

const pickingStatusTextMap: Record<number, string> = {
  1: '待拣货',
  2: '已完成',
}

const orderTypeMap: Record<number, string> = {
  1: '销售出库',
  2: '调拨出库',
  3: '退货出库',
}

const orderTypeReverseMap: Record<string, number> = {
  '销售出库': 1,
  '调拨出库': 2,
  '退货出库': 3,
}

export default function Outbound() {
  const [data, setData] = useState<any[]>([])
  const [pickingData, setPickingData] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [pickingLoading, setPickingLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPickingModalOpen, setIsPickingModalOpen] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
    loadWarehouses()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await outboundApi.list({ page: 1, pageSize: 20 })
      const result = res as any
      const list = (result.data?.list || result.list || []).map((item: any, index: number) => ({
        ...item,
        key: item.id || index,
        orderType: orderTypeMap[item.orderType] || item.orderType,
        status: statusTextMap[item.status] || item.status,
      }))
      setData(list)
    } catch (error) {
      message.error('加载出库单列表失败')
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

  const loadPickingTasks = async (orderId?: number) => {
    setPickingLoading(true)
    try {
      const params: any = { page: 1, pageSize: 100 }
      if (orderId) {
        params.orderId = orderId
      }
      const res = await pickingApi.list(params)
      const result = res as any
      const list = (result.data?.list || result.list || []).map((item: any, index: number) => ({
        ...item,
        key: item.id || index,
        status: pickingStatusTextMap[item.status] || item.status,
      }))
      setPickingData(list)
    } catch (error) {
      message.error('加载拣货任务失败')
    } finally {
      setPickingLoading(false)
    }
  }

  const orderColumns = [
    {
      title: '出库单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
    },
    {
      title: '出库类型',
      dataIndex: 'orderType',
      key: 'orderType',
    },
    {
      title: '仓库',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: '客户',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: '总数量',
      dataIndex: 'totalQty',
      key: 'totalQty',
    },
    {
      title: '已出库',
      dataIndex: 'outboundQty',
      key: 'outboundQty',
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
            {statusNum === 2 && (
              <Button
                type="link"
                size="small"
                icon={<CarOutlined />}
                onClick={() => {
                  setCurrentOrderId(record.id)
                  loadPickingTasks(record.id)
                  setIsPickingModalOpen(true)
                }}
              >
                拣货
              </Button>
            )}
          </Space>
        )
      },
    },
  ]

  const pickingColumns = [
    {
      title: '拣货顺序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 80,
    },
    {
      title: '库位',
      dataIndex: 'locationCode',
      key: 'locationCode',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '计划数量',
      dataIndex: 'planQty',
      key: 'planQty',
    },
    {
      title: '已拣数量',
      dataIndex: 'pickQty',
      key: 'pickQty',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const statusNum = record.statusId !== undefined ? record.statusId :
          Number(Object.keys(pickingStatusTextMap).find(k => pickingStatusTextMap[Number(k)] === status) || 0)
        const color = pickingStatusMap[Number(statusNum)] || 'default'
        return <Tag color={color}>{status}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) =>
        record.status === '待拣货' && (
          <Button
            type="link"
            size="small"
            onClick={() => handlePick(record)}
          >
            完成拣货
          </Button>
        ),
    },
  ]

  const handleAudit = async (record) => {
    Modal.confirm({
      title: '确认审核',
      content: `确定要审核出库单 ${record.orderNo} 吗？审核后将自动生成拣货任务。`,
      onOk: async () => {
        try {
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
          await outboundApi.audit({
            id: record.id,
            operator: userInfo.realName || '当前用户',
          })
          message.success('审核成功，已生成拣货任务')
          loadData()
        } catch (error) {
          message.error('审核失败')
        }
      },
    })
  }

  const handlePick = async (record) => {
    Modal.confirm({
      title: '确认完成拣货',
      content: `确定已完成库位 ${record.locationCode} 的拣货吗？`,
      onOk: async () => {
        try {
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
          await pickingApi.complete({
            id: record.id,
            pickQty: record.planQty,
            operator: userInfo.realName || '当前用户',
          })
          message.success('拣货完成')
          loadPickingTasks(currentOrderId || undefined)
          loadData()
        } catch (error) {
          message.error('拣货失败')
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
      await outboundApi.create({
        warehouseId: values.warehouseId,
        orderType: orderTypeReverseMap[values.orderType] || 1,
        customer: values.customer,
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
        <h2 style={{ margin: 0 }}>出库/拣货管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建出库单
        </Button>
      </div>

      <Card title="出库单列表" style={{ marginBottom: 24 }}>
        <Table columns={orderColumns} dataSource={data} loading={loading} />
      </Card>

      <Card title="拣货任务">
        <Table columns={pickingColumns} dataSource={pickingData} loading={pickingLoading} />
      </Card>

      <Modal
        title="新建出库单"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="orderType"
            label="出库类型"
            rules={[{ required: true, message: '请选择出库类型' }]}
          >
            <Select>
              <Select.Option value="销售出库">销售出库</Select.Option>
              <Select.Option value="调拨出库">调拨出库</Select.Option>
              <Select.Option value="退货出库">退货出库</Select.Option>
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
            name="customer"
            label="客户"
            rules={[{ required: true, message: '请输入客户名称' }]}
          >
            <Input placeholder="请输入客户名称" />
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

      <Modal
        title="拣货任务"
        open={isPickingModalOpen}
        onCancel={() => setIsPickingModalOpen(false)}
        footer={null}
        width={900}
      >
        <Table
          columns={pickingColumns}
          dataSource={pickingData}
          pagination={false}
        />
      </Modal>
    </div>
  )
}
