import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { 
  UserOutlined, 
  ShoppingCartOutlined, 
  GiftOutlined, 
  ReconciliationOutlined,
  BellOutlined,
  BookOutlined,
  DeleteOutlined,
  BulbOutlined
} from '@ant-design/icons';
import { adminAPI, noticeAPI, advocateAPI, bagAPI, productAPI, binAPI } from '../../services/api';

const { Title } = Typography;

function AdminHome() {
  const [stats, setStats] = useState({
    students: 0,
    notices: 0,
    advocates: 0,
    bags: 0,
    products: 0,
    bins: 0,
    throws: 0,
    creatives: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [students, notices, advocates, bags, products, bins, throws, creatives] = await Promise.all([
        adminAPI.getStudents({ page_size: 1 }),
        noticeAPI.getAdminList({ page_size: 1 }),
        advocateAPI.getAdminList({ page_size: 1 }),
        bagAPI.getAdminList({ page_size: 1 }),
        productAPI.getAdminList({ page_size: 1 }),
        binAPI.getList(),
        productAPI.getExchanges({ page_size: 1 }),
        bagAPI.getTypes()
      ]);

      setStats({
        students: students.data.data?.total || 0,
        notices: notices.data.data?.total || 0,
        advocates: advocates.data.data?.total || 0,
        bags: bags.data.data?.total || 0,
        products: products.data.data?.total || 0,
        bins: bins.data.data?.length || 0,
        throws: throws.data.data?.total || 0,
        creatives: creatives.data.data?.length || 0
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>📊 数据概览</Title>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="学生总数" 
              value={stats.students} 
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="公告数量" 
              value={stats.notices} 
              prefix={<BellOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="文明倡导" 
              value={stats.advocates} 
              prefix={<BookOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="垃圾袋数量" 
              value={stats.bags} 
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="商品数量" 
              value={stats.products} 
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="垃圾桶数量" 
              value={stats.bins} 
              prefix={<DeleteOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="兑换记录" 
              value={stats.throws} 
              prefix={<ReconciliationOutlined />}
              valueStyle={{ color: '#2f54eb' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="创意类型" 
              value={stats.creatives} 
              prefix={<BulbOutlined />}
              valueStyle={{ color: '#fadb14' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminHome;
