import React from 'react';
import { Card, Row, Col, Statistic, Typography, List, Avatar } from 'antd';
import {
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Paragraph } = Typography;

const Dashboard = () => {
  const { user, isAdmin, isDoctor, isPatient } = useAuth();

  return (
    <div>
      <Title level={2}>欢迎，{user?.real_name || user?.username}</Title>
      <Paragraph>社区养老医疗综合服务平台</Paragraph>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="居民医保"
              value={'-'}
              prefix={<SafetyCertificateOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="药物信息"
              value={'-'}
              prefix={<MedicineBoxOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="预约数量"
              value={'-'}
              prefix={<CalendarOutlined style={{ color: '#fa8c16' }} />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="就诊记录"
              value={'-'}
              prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Card title="系统介绍">
            <List
              dataSource={[
                '社区养老医疗综合服务平台是为社区居民提供便捷医疗服务的综合平台',
                '支持居民预约挂号、查看健康档案、管理医保信息等功能',
                '医生可以管理患者信息、记录就诊历史、开具处方',
                '管理员负责系统维护、用户管理和权限配置'
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    description={item}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="快速入口">
            <List
              dataSource={[
                { title: '医保信息', desc: '查看和管理居民医保信息' },
                { title: '药物管理', desc: '查看药物库存和价格' },
                { title: '预约管理', desc: '查看和处理预约请求' },
                { title: '就诊记录', desc: '查看和记录就诊历史' }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={item.desc}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
