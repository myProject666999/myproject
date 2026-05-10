import { useState, useEffect } from 'react';
import { Table, Button, Input, Select, message, Space, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { adminApi } from '../../api';

const { Option } = Select;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState(undefined);

  useEffect(() => {
    loadUsers();
  }, [page, status]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = { page, page_size: 10 };
      if (keyword) params.keyword = keyword;
      if (status !== undefined) params.status = status;

      const res = await adminApi.getUsers(params);
      setUsers(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch (error) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  const handleDisable = async (id) => {
    try {
      await adminApi.disableUser(id);
      message.success('禁用成功');
      loadUsers();
    } catch (error) {
      message.error('禁用失败');
    }
  };

  const handleEnable = async (id) => {
    try {
      await adminApi.enableUser(id);
      message.success('解禁成功');
      loadUsers();
    } catch (error) {
      message.error('解禁失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '用户名', dataIndex: 'username' },
    { title: '昵称', dataIndex: 'nickname' },
    { title: '邮箱', dataIndex: 'email' },
    { title: '手机号', dataIndex: 'phone' },
    {
      title: '状态',
      dataIndex: 'status',
      render: (s) => (s === 1 ? <Tag color="green">正常</Tag> : <Tag color="red">已禁用</Tag>),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      render: (t) => new Date(t).toLocaleString(),
    },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          {record.status === 1 ? (
            <Button type="link" danger onClick={() => handleDisable(record.id)}>禁用</Button>
          ) : (
            <Button type="link" onClick={() => handleEnable(record.id)}>解禁</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <Input
          placeholder="搜索用户名/邮箱/手机号"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 200 }}
          onPressEnter={handleSearch}
        />
        <Select
          placeholder="状态筛选"
          style={{ width: 150 }}
          allowClear
          value={status}
          onChange={(v) => { setStatus(v); setPage(1); }}
        >
          <Option value={1}>正常</Option>
          <Option value={0}>已禁用</Option>
        </Select>
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage,
        }}
      />
    </div>
  );
}
