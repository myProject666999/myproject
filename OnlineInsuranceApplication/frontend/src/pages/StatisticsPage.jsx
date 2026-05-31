import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, message } from 'antd'
import {
  FileProtectOutlined,
  DollarOutlined,
  FileSearchOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import ReactECharts from 'echarts-for-react'
import { statisticsApi, policyApi, paymentApi, claimApi } from '../api'
import { formatMoney, getInsuranceTypeLabel } from '../utils'

function StatisticsPage() {
  const [overview, setOverview] = useState(null)
  const [byType, setByType] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    setLoading(true)
    try {
      const [overviewData, byTypeData] = await Promise.all([
        statisticsApi.getOverview(),
        statisticsApi.getByType(),
      ])
      setOverview(overviewData)
      setByType(byTypeData)
    } catch (error) {
      message.error('获取统计数据失败')
    } finally {
      setLoading(false)
    }
  }

  const getTypeChartOption = () => {
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      series: [
        {
          name: '险种分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: byType.map(item => ({
            value: item.policyCount,
            name: getInsuranceTypeLabel(item.insuranceType),
          })),
        },
      ],
    }
  }

  const getPremiumChartOption = () => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: byType.map(item => getInsuranceTypeLabel(item.insuranceType)),
      },
      yAxis: {
        type: 'value',
        name: '保费(元)',
      },
      series: [
        {
          name: '总保费',
          type: 'bar',
          data: byType.map(item => item.totalPremium),
          itemStyle: {
            color: '#1890ff',
          },
        },
      ],
    }
  }

  const getStatusChartOption = () => {
    if (!overview) return {}
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      series: [
        {
          name: '保单状态',
          type: 'pie',
          radius: '60%',
          data: [
            { value: overview.activePolicies, name: '有效保单' },
            { value: overview.expiredPolicies, name: '过期保单' },
          ],
          color: ['#52c41a', '#f5222d'],
        },
      ],
    }
  }

  const getPaymentChartOption = () => {
    if (!overview) return {}
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      series: [
        {
          name: '缴费状态',
          type: 'pie',
          radius: '60%',
          data: [
            { value: overview.paidPayments, name: '已缴费' },
            { value: overview.pendingPayments, name: '待缴费' },
          ],
          color: ['#1890ff', '#fa8c16'],
        },
      ],
    }
  }

  const getClaimChartOption = () => {
    if (!overview) return {}
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      series: [
        {
          name: '理赔状态',
          type: 'pie',
          radius: '60%',
          data: [
            { value: overview.pendingClaims, name: '待处理' },
            { value: overview.approvedClaims, name: '已批准' },
            { value: overview.rejectedClaims, name: '已拒绝' },
            { value: overview.settledClaims, name: '已理赔' },
          ],
          color: ['#fa8c16', '#1890ff', '#f5222d', '#52c41a'],
        },
      ],
    }
  }

  if (!overview) {
    return <div style={{ textAlign: 'center', padding: 50 }}>加载中...</div>
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">数据统计</h2>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="保单总数"
              value={overview.totalPolicies}
              prefix={<FileProtectOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="有效保单"
              value={overview.activePolicies}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总保额"
              value={overview.totalSumInsured}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
              formatter={(value) => formatMoney(value)}
              valueStyle={{ color: '#722ed1', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已缴保费"
              value={overview.totalPaidAmount}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#13c2c2' }} />}
              formatter={(value) => formatMoney(value)}
              valueStyle={{ color: '#13c2c2', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待缴保费"
              value={overview.totalPendingAmount}
              precision={2}
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
              formatter={(value) => formatMoney(value)}
              valueStyle={{ color: '#fa8c16', fontSize: 20 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="理赔总数"
              value={overview.totalClaims}
              prefix={<FileSearchOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待处理理赔"
              value={overview.pendingClaims}
              prefix={<WarningOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待处理提醒"
              value={overview.pendingReminders}
              prefix={<BellOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="险种分布">
            <ReactECharts option={getTypeChartOption()} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="各险种保费统计">
            <ReactECharts option={getPremiumChartOption()} style={{ height: 350 }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="保单状态分布">
            <ReactECharts option={getStatusChartOption()} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="缴费状态分布">
            <ReactECharts option={getPaymentChartOption()} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card title="理赔状态分布">
            <ReactECharts option={getClaimChartOption()} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      <Card title="险种明细统计" style={{ marginTop: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#fafafa' }}>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>险种</th>
              <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>保单数量</th>
              <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>总保费</th>
            </tr>
          </thead>
          <tbody>
            {byType.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>
                  {getInsuranceTypeLabel(item.insuranceType)}
                </td>
                <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>
                  {item.policyCount} 张
                </td>
                <td style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>
                  {formatMoney(item.totalPremium)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

export default StatisticsPage
