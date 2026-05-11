import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import api from '../utils/request';

function Profile() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await api.get('/user/me');
        setUser(res.data);
        form.setFieldsValue(res.data);
      } catch (error) {
        console.error('Load user error:', error);
      }
    };
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await api.put('/user/profile', values);
      message.success('更新成功');
      
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...userData, ...values };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">个人资料</h2>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          style={{ maxWidth: 600 }}
        >
          <Form.Item label="用户名">
            <span>{user.username}</span>
          </Form.Item>
          <Form.Item label="角色">
            <span>{user.role === 'admin' ? '管理员' : user.role === 'teacher' ? '教师' : '学生'}</span>
          </Form.Item>
          <Form.Item name="real_name" label="真实姓名" rules={[{ required: true, message: '请输入真实姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="电话">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存修改
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default Profile;
