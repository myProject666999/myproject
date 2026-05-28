import { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Card,
  DatePicker,
  InputNumber,
  Steps,
} from 'antd'
import {
  PlusOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import { stocktakeApi, warehouseApi } from '../utils/api'

const statusMap: Record<number, string> = {
  1: 'orange',
  2: 'blue',
  3: 'green',
  0: 'red',
}

const statusTextMap: Record<number, string> = {
  1: '待开始',
  2: '盘点中',
  3: '已完成',
  0: '已取消',
}

const typeMap: Record<number, string> = {
  1: '月度盘点',
  2: '季度盘点',
  3: '年度盘点',
  4: '抽样盘点',
  5: '临时盘点',
}

const typeReverseMap: Record<string, number> = {
  '月度盘点': 1,
  '季度盘点': 2,
  '年度盘点': 3,
  '抽样盘点': 4,
  '临时盘点': 5,
}

const diffStatusMap: Record<string, string> = {
  正常: 'green',
  盘盈: 'blue',
  盘亏: 'red',
}

export default function Stocktake() {
  const [data, setData] = useState<any[]>([])
  const [detailData, setDetailData] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isInputModalOpen, setIsInputModalOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<any>(null)
  const [currentDetail, setCurrentDetail] = useState<any>(null)
  const [form] = Form.useForm()
  const [detailForm] = Form.useForm()

  useEffect(() => {
    loadData()
    loadWarehouses()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await stocktakeApi.list({ page: 1, pageSize: 20 })
      const result = res as any
      const list = (result.data?.list || result.list || []).map((item: any, index: number) => ({
        ...item,
        key: item.id || index,
        type: typeMap[item.type] || item.type,
        status: statusTextMap[item.status] || item.status,
      }))
      setData(list)
    } catch (error) {
      message.error('加载盘点列表失败')
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

  const loadDetails = async (taskId: number) => {
    setDetailLoading(true)
    try {
      const res = await stocktakeApi.detail(taskId)
      const result = res as any
      const details = result.data?.details || result.details || []
      const list = details.map((item: any, index: number) => ({
        ...item,
        key: item.id || index,
        diffQty: (item.actualQty || 0) - (item.bookQty || 0),
        status:
          (item.actualQty || 0) > (item.bookQty || 0)
            ? '盘盈'
            : (item.actualQty || 0) < (item.bookQty || 0)
            ? '盘亏'
            : '正常',
      }))
      setDetailData(list)
    } catch (error) {
      message.error('加载盘点详情失败')
    } finally {
      setDetailLoading(false)
    }
  }

  const columns = [
    {
      title: '盘点单号',
      dataIndex: 'taskNo',
      key: 'taskNo',
    },
    {
      title: '任务名称',
      dataIndex: 'taskName',
      key: 'taskName',
    },
    {
      title: '仓库',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: '盘点类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '盘点范围',
      dataIndex: 'locationRange',
      key: 'locationRange',
    },
    {
      title: '进度',
      key: 'progress',
      render: (_, record) => (
        <span>
          {record.checkedSkus}/{record.totalSkus}
          <span style={{ color: '#999', fontSize: 12 }}>
            ({((record.checkedSkus / record.totalSkus) * 100).toFixed(0)}%)
          </span>
        </span>
      ),
    },
    {
      title: '差异数',
      dataIndex: 'diffCount',
      key: 'diffCount',
      render: (count) => (count > 0 ? <Tag color="orange">{count}</Tag> : count),
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
            <Button
              type="link"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleViewDetail(record)}
            >
              详情
            </Button>
            {statusNum === 1 && (
              <Button
                type="link"
                size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => handleStart(record)}
              >
                开始
              </Button>
            )}
            {statusNum === 2 && (
              <Button
                type="link"
                size="small"
                onClick={() => handleComplete(record)}
              >
                完成
              </Button>
            )}
          </Space>
        )
      },
    },
  ]

  const detailColumns = [
    {
      title: '库位',
      dataIndex: 'locationCode',
      key: 'locationCode',
    },
    {
      title: '商品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: '规格',
      dataIndex: 'spec',
      key: 'spec',
    },
    {
      title: '账面数量',
      dataIndex: 'bookQty',
      key: 'bookQty',
    },
    {
      title: '实盘数量',
      dataIndex: 'actualQty',
      key: 'actualQty',
    },
    {
      title: '差异数量',
      dataIndex: 'diffQty',
      key: 'diffQty',
      render: (qty) => (
        <span style={{ color: qty > 0 ? 'blue' : qty < 0 ? 'red' : 'inherit' }}>
          {qty > 0 ? '+' : ''}
          {qty}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={diffStatusMap[status]}>{status}</Tag>,
    },
  ]

  const handleCreate = () => {
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleViewDetail = async (record) => {
    setCurrentTask(record)
    await loadDetails(record.id)
    setIsDetailModalOpen(true)
  }

  const handleStart = async (record) => {
    Modal.confirm({
      title: '确认开始',
      content: `确定要开始盘点任务 ${record.taskName} 吗？`,
      onOk: async () => {
        try {
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
          await stocktakeApi.start({
            id: record.id,
            operator: userInfo.realName || '当前用户',
          })
          message.success('盘点任务已开始')
          loadData()
        } catch (error) {
          message.error('开始盘点失败')
        }
      },
    })
  }

  const handleComplete = async (record) => {
    Modal.confirm({
      title: '确认完成',
      content: `确定要完成盘点任务 ${record.taskName} 吗？系统将根据差异调整库存。`,
      onOk: async () => {
        try {
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
          await stocktakeApi.complete({
            id: record.id,
            operator: userInfo.realName || '当前用户',
          })
          message.success('盘点任务已完成，库存已调整')
          loadData()
        } catch (error) {
          message.error('完成盘点失败')
        }
      },
    })
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      await stocktakeApi.create({
        taskName: values.taskName,
        warehouseId: values.warehouseId,
        type: typeReverseMap[values.type] || 1,
        locationRange: values.locationRange,
        planTime: values.planTime?.format('YYYY-MM-DD') || '',
        remark: values.remark || '',
        operator: userInfo.realName || '当前用户',
        status: 1,
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
        <h2 style={{ margin: 0 }}>盘点管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          新建盘点任务
        </Button>
      </div>

      <Card>
        <Table columns={columns} dataSource={data} loading={loading} />
      </Card>

      <Modal
        title="新建盘点任务"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="taskName"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="如：A区月度盘点" />
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
            name="type"
            label="盘点类型"
            rules={[{ required: true, message: '请选择盘点类型' }]}
          >
            <Select>
              <Select.Option value="月度盘点">月度盘点</Select.Option>
              <Select.Option value="季度盘点">季度盘点</Select.Option>
              <Select.Option value="年度盘点">年度盘点</Select.Option>
              <Select.Option value="抽样盘点">抽样盘点</Select.Option>
              <Select.Option value="临时盘点">临时盘点</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="locationRange"
            label="盘点范围"
            rules={[{ required: true, message: '请输入盘点范围' }]}
          >
            <Input placeholder="如：A区所有库位" />
          </Form.Item>
          <Form.Item name="planTime" label="计划时间">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`盘点详情 - ${currentTask?.taskNo}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={null}
        width={900}
      >
        <Steps
          size="small"
          current={
            currentTask?.status === '待开始'
              ? 0
              : currentTask?.status === '盘点中'
              ? 1
              : 2
          }
          items={[
            { title: '创建任务' },
            { title: '盘点中' },
            { title: '已完成' },
          ]}
          style={{ marginBottom: 24 }}
        />
        <Table
          columns={detailColumns}
          dataSource={detailData}
          pagination={false}
          size="small"
          loading={detailLoading}
        />
      </Modal>
    </div>
  )
}
