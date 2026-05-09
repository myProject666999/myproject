import React, { useEffect, useState } from 'react';
import { Table, Typography, Input, Button, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { throwAPI } from '../../services/api';

const { Title } = Typography;

function Throws() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    loadList();
  }, [page]);

  const loadList = async () => {
    try {
      const res = await throwAPI.getAdminList({ page, page_size: 10, keyword });
      setList(res.data.data?.list || []);
      setTotal(res.data.data?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '学生', dataIndex: ['student', 'real_name'], key: 'student' },
    { title: '垃圾桶', dataIndex: ['bin', 'name'], key: 'bin', render: v => v || '-' },
    { title: '垃圾类型', dataIndex: 'garbage_type', key: 'type' },
    { title: '重量(kg)', dataIndex: 'weight', key: 'weight' },
    { title: '获得积分', dataIndex: 'points', key: 'points' },
    { title: '备注', dataIndex: 'remark', key: 'remark', render: v => v || '-' },
    { title: '时间', dataIndex: 'created_at', key: 'time', render: v => new Date(v).toLocaleString() }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>📋 扔垃圾记录</Title>
        <Space>
          <Input 
            placeholder="搜索..." 
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

export default Throws;
