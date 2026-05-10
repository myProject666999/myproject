import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  message, 
  Typography,
  Avatar,
  Divider
} from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { authAPI, userAPI } from '../utils/api';

const { Title } = Typography;

const Profile = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('请先登录');
      navigate('/login');
      return;
    }
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res);
      form.setFieldsValue({
        email: res.email,
        phone: res.phone,
        real_name: res.real_name,
        avatar: res.avatar
      });
    } catch (error) {
      message.error('获取用户信息失败');
    }
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      await userAPI.updateProfile(values);
      message.success('更新成功');
      
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...values };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      fetchUserInfo();
    } catch (error) {
      message.error(error.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        加载中...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar size={80} icon={<UserOutlined />} src={user.avatar} />
          <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>
            {user.real_name || user.username}
          </Title>
          <div style={{ color: '#999' }}>@{user.username}</div>
        </div>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            name="real_name"
            label="真实姓名"
          >
            <Input prefix={<UserOutlined />} placeholder="请输入真实姓名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
          >
            <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item
            name="avatar"
            label="头像URL"
          >
            <Input placeholder="请输入头像链接" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Profile;
