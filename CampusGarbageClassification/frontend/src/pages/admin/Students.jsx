import React, { useEffect, useState } from 'react';
import { Table, Typography, Input, Button, Space, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { adminAPI } from '../../services/api';

const { Title } = Typography;

function Students() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    loadList();
  }, [page]);

  const loadList = async () => {
    try {
      const res = await adminAPI.getStudents({ page, page_size: 10, keyword });
      setList(res.data.data?.list || []);
      setTotal(res.data.data?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '用户名', dataIndex: ['user', 'username'], key: 'username' },
    { title: '真实姓名', dataIndex: 'real_name', key: 'real_name', render: v => v || '-' },
    { title: '学号', dataIndex: 'student_no', key: 'student_no', render: v => v || '-' },
    { title: '班级', dataIndex: 'class', key: 'class', render: v => v || '-' },
    { title: '电话', dataIndex: 'phone', key: 'phone', render: v => v || '-' },
    { title: '积分', dataIndex: 'points', key: 'points', render: v => <Tag color="gold">{v}</Tag> },
    { title: '注册时间', dataIndex: 'created_at', key: 'time', render: v => new Date(v).toLocaleDateString() }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>👥 学生管理</Title>
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

export default Students;
