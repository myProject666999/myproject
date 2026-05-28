import { Row, Col, Card, Statistic, Table, Tag, message } from 'antd'
import {
  InboxOutlined,
  ExportOutlined,
  WarningOutlined,
  ShoppingOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { useEffect, useState } from 'react'
import { reportApi, inboundApi, outboundApi } from '../utils/api'

const inventoryTrendOption = {
  title: { text: '库存趋势' },
  tooltip: { trigger: 'axis' },
  legend: { data: ['入库量', '出库量', '库存量'] },
  xAxis: {
    type: 'category',
    data: ['1/9', '1/10', '1/11', '1/12', '1/13', '1/14', '1/15'],
  },
  yAxis: { type: 'value' },
  series: [
    {
      name: '入库量',
      type: 'bar',
      data: [500, 320, 600, 450, 380, 420, 456],
      color: '#52c41a',
    },
    {
      name: '出库量',
      type: 'bar',
      data: [350, 280, 420, 380, 320, 400, 389],
      color: '#1890ff',
    },
    {
      name: '库存量',
      type: 'line',
      data: [11200, 11240, 11420, 11490, 11550, 11570, 12580],
      color: '#722ed1',
      smooth: true,
    },
  ],
}

const categoryOption = {
  title: { text: '库存分类占比' },
  tooltip: { trigger: 'item' },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { value: 4500, name: '电子产品' },
        { value: 3200, name: '服装鞋帽' },
        { value: 2800, name: '食品饮料' },
        { value: 1500, name: '日用百货' },
        { value: 580, name: '其他' },
      ],
    },
  ],
}

const statusMap: Record<number, string> = {
  1: '待审核',
  2: '待入库',
  3: '已完成',
}

const orderTypeMap: Record<number, string> = {
  1: '采购入库',
  2: '退货入库',
  3: '销售出库',
  4: '调拨出库',
}

export default function Dashboard() {
  const [data, setData] = useState({
    totalInventory: 0,
    todayInbound: 0,
    todayOutbound: 0,
    alertCount: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
    loadRecentOrders()
  }, [])

  const loadDashboardData = async () => {
    try {
      const res = await reportApi.dashboard()
      const result = res as any
      setData({
        totalInventory: result.data?.totalInventory || result.totalInventory || 0,
        todayInbound: result.data?.inboundCount || result.inboundCount || 0,
        todayOutbound: result.data?.outboundCount || result.outboundCount || 0,
        alertCount: result.data?.pendingTask || result.pendingTask || 0,
      })
    } catch (error) {
      message.error('加载仪表盘数据失败')
    }
  }

  const loadRecentOrders = async () => {
    try {
      const [inboundRes, outboundRes] = await Promise.all([
        inboundApi.list({ page: 1, pageSize: 3 }),
        outboundApi.list({ page: 1, pageSize: 3 }),
      ])
      const inboundResult = inboundRes as any
      const outboundResult = outboundRes as any
      
      const inboundList = (inboundResult.data?.list || inboundResult.list || []).map((item: any) => ({
        key: `in-${item.id}`,
        orderNo: item.orderNo,
        type: orderTypeMap[item.orderType] || '入库',
        supplier: item.supplier,
        qty: item.totalQty,
        status: statusMap[item.status] || '未知',
        time: item.createTime,
      }))
      
      const outboundList = (outboundResult.data?.list || outboundResult.list || []).map((item: any) => ({
        key: `out-${item.id}`,
        orderNo: item.orderNo,
        type: orderTypeMap[item.orderType] || '出库',
        customer: item.customer,
        qty: item.totalQty,
        status: statusMap[item.status] || '未知',
        time: item.createTime,
      }))
      
      setRecentOrders([...inboundList, ...outboundList].slice(0, 5))
    } catch (error) {
      console.error('加载最近单据失败', error)
    }
  }

  const orderColumns = [
    {
      title: '单据号',
      dataIndex: 'orderNo',
      key: 'orderNo',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '往来方',
      dataIndex: 'supplier',
      key: 'supplier',
      render: (_, record) => record.supplier || record.customer,
    },
    {
      title: '数量',
      dataIndex: 'qty',
      key: 'qty',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colorMap = {
          '已完成': 'green',
          '待拣货': 'orange',
          '待入库': 'blue',
          '入库中': 'cyan',
        }
        return <Tag color={colorMap[status]}>{status}</Tag>
      },
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
  ]

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="库存总量"
              value={data.totalInventory}
              prefix={<ShoppingOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="今日入库"
              value={data.todayInbound}
              prefix={<InboxOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="今日出库"
              value={data.todayOutbound}
              prefix={<ExportOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="stat-card">
            <Statistic
              title="库存预警"
              value={data.alertCount}
              prefix={<WarningOutlined style={{ color: '#ff4d4f' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Card title="库存趋势分析">
            <ReactECharts option={inventoryTrendOption} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="库存分类">
            <ReactECharts option={categoryOption} style={{ height: 350 }} />
          </Card>
        </Col>
      </Row>

      <Card title="最近单据">
        <Table
          columns={orderColumns}
          dataSource={recentOrders}
          pagination={false}
        />
      </Card>
    </div>
  )
}
