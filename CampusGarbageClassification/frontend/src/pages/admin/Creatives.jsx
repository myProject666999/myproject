import React, { useEffect, useState } from 'react';
import { Table, Typography, Tag, Button, Space, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { adminAPI } from '../../services/api';

const { Title } = Typography;

function Creatives() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    loadList();
  }, [page]);

  const loadList = async () => {
    try {
      const res = await adminAPI.getCreatives({ page, page_size: 10, keyword });
      setList(res.data.data?.list || []);
      setTotal(res.data.data?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '学生', dataIndex: ['student', 'real_name'], key: 'student', render: v => v || '-' },
    { title: '标题', dataIndex: 'title', key: 'title' },
    { title: '类型', dataIndex: ['type', 'name'], key: 'type', render: v => v || '-' },
    { title: '状态', dataIndex: 'status', key: 'status', render: v => {
      if (v === 0) return <Tag color="orange">待审核</Tag>;
      if (v === 1) return <Tag color="green">已通过</Tag>;
      return <Tag color="red">已拒绝</Tag>;
    }},
    { title: '发布时间', dataIndex: 'created_at', key: 'time', render: v => new Date(v).toLocaleString() }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>💡 创意信息</Title>
        <Space>
          <Input 
            placeholder="搜索标题..." 
            prefix={<SearchOutlined />} 
            style={{ width: 200 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => { setPage(1); loadList(); }}
          />
          <Button onClick={() => { setPage(1); loadList(); }}>搜索</Button>
        </Space>
      </div>
      <Table columns={columns} dataSource={list} rowKey="id" pagination={{ current: page, total, pageSize: 10, onChange: setPage }} />
    </div>
  );
}

export default Creatives;
