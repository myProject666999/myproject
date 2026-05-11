import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Spin, message } from 'antd'
import {
  UserOutlined,
  UsergroupAddOutlined,
  MedicineBoxOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import request from '../utils/request'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    doctors: 0,
    nurses: 0,
    patients: 0,
    medicines: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [doctorsRes, nursesRes, patientsRes, medicinesRes] = await Promise.all([
        request.get('/doctors?page_size=1'),
        request.get('/nurses?page_size=1'),
        request.get('/patients?page_size=1'),
        request.get('/medicines?page_size=1'),
      ])

      setStats({
        doctors: doctorsRes.data.total || 0,
        nurses: nursesRes.data.total || 0,
        patients: patientsRes.data.total || 0,
        medicines: medicinesRes.data.total || 0,
      })
    } catch (error) {
      message.error('获取统计数据失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">系统概览</h2>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="医生数量"
              value={stats.doctors}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="护士数量"
              value={stats.nurses}
              prefix={<UsergroupAddOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="病人数量"
              value={stats.patients}
              prefix={<UserOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="药品数量"
              value={stats.medicines}
              prefix={<MedicineBoxOutlined style={{ color: '#eb2f96' }} />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="欢迎使用医院病历管理系统">
            <p>本系统提供以下功能：</p>
            <ul style={{ paddingLeft: 20 }}>
              <li>用户管理：管理员可以管理系统用户账户</li>
              <li>医护人员管理：管理医生和护士信息</li>
              <li>病人管理：管理病人基本信息</li>
              <li>病历管理：管理病人的病历记录</li>
              <li>药品管理：管理药品信息，支持图片上传</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
