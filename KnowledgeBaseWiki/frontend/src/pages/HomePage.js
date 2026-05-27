import React from 'react';
import { Card, Empty, Button } from 'antd';
import { BookOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const HomePage = ({ spaces }) => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 48, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{ fontSize: 32, marginBottom: 16 }}>欢迎使用知识库Wiki</h1>
        <p style={{ fontSize: 16, color: '#666' }}>团队知识沉淀、协作分享的最佳平台</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, margin: 0 }}>我的空间</h2>
        <Button type="primary" icon={<PlusOutlined />}>创建空间</Button>
      </div>

      {spaces && spaces.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {spaces.map(space => (
            <Card
              key={space.id}
              hoverable
              onClick={() => navigate(`/space/${space.id}`)}
              style={{ cursor: 'pointer' }}
              bodyStyle={{ padding: 24 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: space.color || '#1890ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 24,
                    marginRight: 16
                  }}
                >
                  <BookOutlined />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{space.name}</h3>
                  <p style={{ margin: 0, color: '#999', fontSize: 12 }}>
                    {space.isPublic ? '公开空间' : '私有空间'}
                  </p>
                </div>
              </div>
              <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
                {space.description || '暂无描述'}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <Empty
          description="暂无空间"
          extra={
            <Button type="primary" icon={<PlusOutlined />}>
              创建第一个空间
            </Button>
          }
        />
      )}
    </div>
  );
};

export default HomePage;
