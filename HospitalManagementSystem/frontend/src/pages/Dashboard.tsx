import React, { useState, useEffect } from 'react'
import { Row, Col, Card, Statistic, Typography, Table, Tag, Space, Button } from 'antd'
import {
  UserOutlined,
  DollarOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
  TeamOutlined,
  ScheduleOutlined,
} from '@ant-design/icons'
import { statisticsAPI } from '../services/api'
import { useAuthStore } from '../store/useAuthStore'
import { ROLE_NAME_MAP } from '../types'

const { Title } = Typography

export const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>({
    total_patients: 0,
    total_income: 0,
    pending_count: 0,
    diagnosis_count: 0,
  })
  const [loading, setLoading] = useState(false)
  const { user, role } = useAuthStore()

  const fetchOverview = async () => {
    try {
      setLoading(true)
      const data = await statisticsAPI.getTodayOverview()
      setOverview(data)
    } catch (error) {
      console.error('获取概览数据失败', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [])

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>
        欢迎回来，{user?.name}（{role ? ROLE_NAME_MAP[role] : ''}）
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="今日挂号人数"
              value={overview.total_patients}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="今日收入"
              value={overview.total_income}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待诊患者"
              value={overview.pending_count}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="正在接诊"
              value={overview.diagnosis_count}
              prefix={<ScheduleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="快速操作">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" block icon={<UserOutlined />}>
                挂号管理
              </Button>
              <Button block icon={<MedicineBoxOutlined />}>
                药品管理
              </Button>
              <Button block icon={<FileTextOutlined />}>
                病历管理
              </Button>
              <Button block icon={<DollarOutlined />}>
                收费管理
              </Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="系统信息">
            <Table
              columns={[
                { title: '项目', dataIndex: 'key', key: 'key' },
                { title: '内容', dataIndex: 'value', key: 'value' },
              ]}
              dataSource={[
                { key: '系统名称', value: '医院管理系统' },
                { key: '版本', value: '1.0.0' },
                { key: '当前用户', value: user?.name },
                { key: '角色', value: role ? ROLE_NAME_MAP[role] : '' },
                { key: '状态', value: <Tag color="green">正常运行</Tag> },
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
