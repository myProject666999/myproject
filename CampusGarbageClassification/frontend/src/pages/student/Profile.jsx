import React, { useEffect, useState } from 'react';
import { 
  Card, Typography, Tabs, Form, Input, Button, Table, Tag, 
  Modal, message, Avatar, Descriptions, Space, InputNumber, Select
} from 'antd';
import { UserOutlined, EditOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authAPI, bagAPI, productAPI, throwAPI, binAPI } from '../../services/api';

const { Title, Text } = Typography;

function ProfilePage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  
  const [purchases, setPurchases] = useState([]);
  const [pTotal, setPTotal] = useState(0);
  const [pPage, setPPage] = useState(1);
  
  const [throws, setThrows] = useState([]);
  const [tTotal, setTTotal] = useState(0);
  const [tPage, setTPage] = useState(1);
  
  const [exchanges, setExchanges] = useState([]);
  const [eTotal, setETotal] = useState(0);
  const [ePage, setEPage] = useState(1);

  const [bins, setBins] = useState([]);
  const [throwModalOpen, setThrowModalOpen] = useState(false);
  const [throwForm] = Form.useForm();

  useEffect(() => {
    if (user.student) {
      profileForm.setFieldsValue(user.student);
    }
    loadPurchases();
    loadThrows();
    loadExchanges();
    loadBins();
  }, []);

  const loadPurchases = async () => {
    try {
      const res = await bagAPI.getMyPurchases({ page: pPage, page_size: 10 });
      setPurchases(res.data.data?.list || []);
      setPTotal(res.data.data?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const loadThrows = async () => {
    try {
      const res = await throwAPI.getMyRecords({ page: tPage, page_size: 10 });
      setThrows(res.data.data?.list || []);
      setTTotal(res.data.data?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const loadExchanges = async () => {
    try {
      const res = await productAPI.getMyExchanges({ page: ePage, page_size: 10 });
      setExchanges(res.data.data?.list || []);
      setETotal(res.data.data?.total || 0);
    } catch (error) {
      console.error(error);
    }
  };

  const loadBins = async () => {
    try {
      const res = await binAPI.getList();
      setBins(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const updateProfile = async (values) => {
    try {
      const res = await authAPI.updateProfile(values);
      if (res.data.code === 200) {
        message.success('更新成功');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.student = { ...user.student, ...values };
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      message.error('更新失败');
    }
  };

  const updatePassword = async (values) => {
    if (values.new_password !== values.confirm_password) {
      message.error('两次输入的密码不一致');
      return;
    }
    try {
      const res = await authAPI.updatePassword({
        old_password: values.old_password,
        new_password: values.new_password
      });
      if (res.data.code === 200) {
        message.success('密码修改成功');
        passwordForm.resetFields();
      }
    } catch (error) {
      message.error(error.response?.data?.message || '修改失败');
    }
  };

  const submitThrow = async (values) => {
    try {
      const res = await throwAPI.add(values);
      if (res.data.code === 200) {
        message.success(`记录成功！获得 ${res.data.data.points} 积分`);
        setThrowModalOpen(false);
        throwForm.resetFields();
        loadThrows();
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.student) {
          user.student.points += res.data.data.points;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
    } catch (error) {
      message.error('记录失败');
    }
  };

  const purchaseColumns = [
    { title: '垃圾袋', dataIndex: ['bag', 'name'], key: 'bag_name' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '总价', dataIndex: 'total_price', key: 'total_price', render: v => `¥${v}` },
    { title: '时间', dataIndex: 'created_at', key: 'created_at', render: v => new Date(v).toLocaleString() }
  ];

  const throwColumns = [
    { title: '垃圾桶', dataIndex: ['bin', 'name'], key: 'bin_name', render: v => v || '-' },
    { title: '垃圾类型', dataIndex: 'garbage_type', key: 'garbage_type' },
    { title: '重量(kg)', dataIndex: 'weight', key: 'weight' },
    { title: '获得积分', dataIndex: 'points', key: 'points', render: v => <Tag color="gold">+{v}</Tag> },
    { title: '时间', dataIndex: 'created_at', key: 'created_at', render: v => new Date(v).toLocaleString() }
  ];

  const exchangeColumns = [
    { title: '商品', dataIndex: ['product', 'name'], key: 'product_name' },
    { title: '数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '消耗积分', dataIndex: 'total_points', key: 'total_points', render: v => <Tag color="red">-{v}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', render: v => v === 1 ? <Tag color="green">已完成</Tag> : <Tag color="orange">处理中</Tag> },
    { title: '时间', dataIndex: 'created_at', key: 'created_at', render: v => new Date(v).toLocaleString() }
  ];

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar size={80} icon={<UserOutlined />} />
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>
              {user.student?.real_name || user.username}
            </Title>
            <Space>
              <Text type="secondary">学号: {user.student?.student_no || '-'}</Text>
              <Text type="secondary">班级: {user.student?.class || '-'}</Text>
              <Tag color="gold" style={{ fontSize: 14, padding: '4px 12px' }}>
                积分: {user.student?.points || 0}
              </Tag>
            </Space>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <Button type="primary" onClick={() => setThrowModalOpen(true)}>
              记录扔垃圾
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'profile',
              label: '个人信息',
              children: (
                <Form form={profileForm} layout="vertical" onFinish={updateProfile} style={{ maxWidth: 500 }}>
                  <Form.Item name="real_name" label="真实姓名">
                    <Input />
                  </Form.Item>
                  <Form.Item name="student_no" label="学号">
                    <Input />
                  </Form.Item>
                  <Form.Item name="class" label="班级">
                    <Input />
                  </Form.Item>
                  <Form.Item name="phone" label="联系电话">
                    <Input />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">保存修改</Button>
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'password',
              label: '修改密码',
              children: (
                <Form form={passwordForm} layout="vertical" onFinish={updatePassword} style={{ maxWidth: 500 }}>
                  <Form.Item name="old_password" label="旧密码" rules={[{ required: true }]}>
                    <Input.Password />
                  </Form.Item>
                  <Form.Item name="new_password" label="新密码" rules={[{ required: true, min: 6 }]}>
                    <Input.Password />
                  </Form.Item>
                  <Form.Item name="confirm_password" label="确认新密码" rules={[{ required: true }]}>
                    <Input.Password />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">修改密码</Button>
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'creative',
              label: '创意信息',
              children: (
                <div style={{ textAlign: 'center', padding: 48 }}>
                  <Button type="primary" size="large" onClick={() => navigate('/profile/creative')}>
                    管理我的创意信息
                  </Button>
                </div>
              )
            },
            {
              key: 'purchases',
              label: '垃圾袋购买记录',
              children: (
                <Table
                  columns={purchaseColumns}
                  dataSource={purchases}
                  rowKey="id"
                  pagination={{ current: pPage, total: pTotal, pageSize: 10, onChange: (p) => { setPPage(p); setTimeout(loadPurchases, 0); } }}
                />
              )
            },
            {
              key: 'throws',
              label: '扔垃圾记录',
              children: (
                <Table
                  columns={throwColumns}
                  dataSource={throws}
                  rowKey="id"
                  pagination={{ current: tPage, total: tTotal, pageSize: 10, onChange: (p) => { setTPage(p); setTimeout(loadThrows, 0); } }}
                />
              )
            },
            {
              key: 'exchanges',
              label: '商品兑换记录',
              children: (
                <Table
                  columns={exchangeColumns}
                  dataSource={exchanges}
                  rowKey="id"
                  pagination={{ current: ePage, total: eTotal, pageSize: 10, onChange: (p) => { setEPage(p); setTimeout(loadExchanges, 0); } }}
                />
              )
            }
          ]}
        />
      </Card>

      <Modal
        title="记录扔垃圾"
        open={throwModalOpen}
        onCancel={() => setThrowModalOpen(false)}
        footer={null}
      >
        <Form form={throwForm} layout="vertical" onFinish={submitThrow}>
          <Form.Item name="bin_id" label="投放垃圾桶" rules={[{ required: true }]}>
            <Select placeholder="请选择投放位置">
              {bins.map(bin => (
                <Select.Option key={bin.id} value={bin.id} disabled={bin.status !== 1}>
                  {bin.name} - {bin.location} {bin.status !== 1 ? '(损坏)' : ''}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="garbage_type" label="垃圾类型" rules={[{ required: true }]}>
            <Select placeholder="请选择">
              <Select.Option value="可回收物">可回收物</Select.Option>
              <Select.Option value="厨余垃圾">厨余垃圾</Select.Option>
              <Select.Option value="其他垃圾">其他垃圾</Select.Option>
              <Select.Option value="有害垃圾">有害垃圾</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="weight" label="重量(kg)" rules={[{ required: true }]}>
            <InputNumber min={0.1} max={100} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>提交记录 (每kg获得10积分)</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ProfilePage;
