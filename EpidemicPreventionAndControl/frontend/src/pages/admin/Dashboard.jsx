import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { 
  MedicineBoxOutlined, 
  ShopOutlined, 
  TeamOutlined, 
  CalendarOutlined,
  BellOutlined,
  DollarOutlined
} from '@ant-design/icons';
import request from '../../utils/request';

const Dashboard = () => {
  const [stats, setStats] = useState({
    hospitals: 0,
    manufacturers: 0,
    volunteers: 0,
    activities: 0,
    announcements: 0,
    finance: { total_income: 0, total_expense: 0 }
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [hospitals, manufacturers, volunteers, activities, announcements, finance] = await Promise.all([
        request.get('/admin/hospitals?page_size=1'),
        request.get('/admin/manufacturers?page_size=1'),
        request.get('/admin/volunteers?page_size=1'),
        request.get('/admin/activities?page_size=1'),
        request.get('/admin/announcements?page_size=1'),
        request.get('/admin/finances/stats'),
      ]);

      setStats({
        hospitals: hospitals.data.total,
        manufacturers: manufacturers.data.total,
        volunteers: volunteers.data.total,
        activities: activities.data.total,
        announcements: announcements.data.total,
        finance: finance.data,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>系统概览</h2>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="医院数量"
              value={stats.hospitals}
              prefix={<MedicineBoxOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="厂商数量"
              value={stats.manufacturers}
              prefix={<ShopOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="志愿者数量"
              value={stats.volunteers}
              prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="活动数量"
              value={stats.activities}
              prefix={<CalendarOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="公告数量"
              value={stats.announcements}
              prefix={<BellOutlined style={{ color: '#eb2f96' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="总收入"
              value={stats.finance.total_income}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="总支出"
              value={stats.finance.total_expense}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#ff4d4f' }} />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="净收入"
              value={stats.finance.total_income - stats.finance.total_expense}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#1890ff' }} />}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
