import { useState, useEffect } from 'react'
import {
  Table,
  Card,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Tag,
  Row,
  Col,
  Statistic,
  message,
} from 'antd'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import { inventoryApi, warehouseApi } from '../utils/api'

const typeMap: Record<number, string> = {
  1: 'green',
  2: 'red',
  3: 'blue',
  4: 'orange',
}

const typeTextMap: Record<number, string> = {
  1: '入库',
  2: '出库',
  3: '库位移动',
  4: '盘点调整',
}

const typeReverseMap: Record<string, number> = {
  '入库': 1,
  '出库': 2,
  '库位移动': 3,
  '盘点调整': 4,
}

export default function InventoryLog() {
  const [data, setData] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  useEffect(() => {
    loadData()
    loadWarehouses()
  }, [page, pageSize])

  const loadWarehouses = async () => {
    try {
      const res = await warehouseApi.list({ page: 1, pageSize: 100 })
      const result = res as any
      setWarehouses(result.data?.list || result.list || [])
    } catch (error) {
      console.error('加载仓库列表失败', error)
    }
  }

  const loadData = async (params?: any) => {
    setLoading(true)
    try {
      const queryParams: any = { page, pageSize, ...params }
      const res = await inventoryApi.logList(queryParams)
      const result = res as any
      const list = (result.data?.list || result.list || []).map((item: any, index: number) => ({
        ...item,
        key: item.id || index,
        type: typeTextMap[item.type] || item.type,
      }))
      setData(list)
      setTotal(result.data?.total || result.total || list.length)
    } catch (error) {
      message.error('加载库存流水失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '流水号',
      dataIndex: 'logNo',
      key: 'logNo',
      width: 140,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type, record) => {
        const typeNum = record.typeId !== undefined ? record.typeId :
          Number(Object.keys(typeTextMap).find(k => typeTextMap[Number(k)] === type) || 0)
        const color = typeMap[Number(typeNum)] || 'default'
        return <Tag color={color}>{type}</Tag>
      },
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
      width: 100,
    },
    {
      title: '规格',
      dataIndex: 'spec',
      key: 'spec',
    },
    {
      title: '仓库',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 100,
    },
    {
      title: '库位',
      dataIndex: 'locationCode',
      key: 'locationCode',
      width: 100,
    },
    {
      title: '变动前',
      dataIndex: 'beforeQty',
      key: 'beforeQty',
      width: 80,
      align: 'right' as const,
    },
    {
      title: '变动量',
      dataIndex: 'changeQty',
      key: 'changeQty',
      width: 80,
      align: 'right' as const,
      render: (qty) => (
        <span style={{ color: qty > 0 ? 'green' : qty < 0 ? 'red' : 'inherit' }}>
          {qty > 0 ? '+' : ''}
          {qty}
        </span>
      ),
    },
    {
      title: '变动后',
      dataIndex: 'afterQty',
      key: 'afterQty',
      width: 80,
      align: 'right' as const,
    },
    {
      title: '关联单据',
      dataIndex: 'relateOrder',
      key: 'relateOrder',
      width: 140,
      render: (order) => (
        <Button type="link" size="small">
          {order}
        </Button>
      ),
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 80,
    },
    {
      title: '操作时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
    },
  ]

  const handleSearch = () => {
    const values = form.getFieldsValue()
    const params: any = {}
    if (values.type) params.type = typeReverseMap[values.type]
    if (values.warehouseId) params.warehouseId = values.warehouseId
    if (values.sku) params.sku = values.sku
    if (values.dateRange && values.dateRange.length === 2) {
      params.startDate = values.dateRange[0].format('YYYY-MM-DD')
      params.endDate = values.dateRange[1].format('YYYY-MM-DD')
    }
    setPage(1)
    loadData(params)
    message.success('查询条件已应用')
  }

  const handleReset = () => {
    form.resetFields()
    setPage(1)
    loadData()
  }

  const todayIn = data
    .filter((item) => {
      const typeNum = item.typeId !== undefined ? item.typeId :
        Number(Object.keys(typeTextMap).find(k => typeTextMap[Number(k)] === item.type) || 0)
      return typeNum === 1
    })
    .reduce((sum, item) => sum + (item.changeQty || 0), 0)

  const todayOut = data
    .filter((item) => {
      const typeNum = item.typeId !== undefined ? item.typeId :
        Number(Object.keys(typeTextMap).find(k => typeTextMap[Number(k)] === item.type) || 0)
      return typeNum === 2
    })
    .reduce((sum, item) => sum + Math.abs(item.changeQty || 0), 0)

  const handleTableChange = (pagination: any) => {
    setPage(pagination.current)
    setPageSize(pagination.pageSize)
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>库存流水</h2>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日入库"
              value={todayIn}
              valueStyle={{ color: '#3f8600' }}
              suffix="件"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日出库"
              value={todayOut}
              valueStyle={{ color: '#cf1322' }}
              suffix="件"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日流水数"
              value={data.length}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="净变动"
              value={todayIn - todayOut}
              valueStyle={{ color: todayIn - todayOut >= 0 ? '#3f8600' : '#cf1322' }}
              suffix="件"
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item name="type" label="类型">
            <Select placeholder="全部" style={{ width: 120 }} allowClear>
              <Select.Option value="入库">入库</Select.Option>
              <Select.Option value="出库">出库</Select.Option>
              <Select.Option value="库位移动">库位移动</Select.Option>
              <Select.Option value="盘点调整">盘点调整</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="warehouseId" label="仓库">
            <Select placeholder="全部" style={{ width: 120 }} allowClear>
              {warehouses.map((wh) => (
                <Select.Option key={wh.id} value={wh.id}>
                  {wh.warehouseName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="sku" label="SKU">
            <Input placeholder="输入SKU" style={{ width: 150 }} />
          </Form.Item>
          <Form.Item name="dateRange" label="日期范围">
            <DatePicker.RangePicker />
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              查询
            </Button>
          </Form.Item>
          <Form.Item>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 1400 }}
          onChange={handleTableChange}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  )
}
