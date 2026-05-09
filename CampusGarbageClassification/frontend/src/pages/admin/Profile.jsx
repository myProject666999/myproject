import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, Typography, Tabs } from 'antd';
import { SaveOutlined, KeyOutlined, UserOutlined } from '@ant-design/icons';
import { authAPI } from '../../services/api';

const { Title } = Typography;

function Profile() {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await authAPI.getMe();
      const data = res.data.data;
      setUser(data);
      profileForm.setFieldsValue({
        username: data?.user?.username,
        real_name: data?.real_name,
        phone: data?.phone,
        email: data?.email
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateProfile = async (values) => {
    try {
      await authAPI.updateProfile(values);
      message.success('更新成功');
      loadProfile();
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleChangePassword = async (values) => {
    if (values.new_password !== values.confirm_password) {
      message.error('两次密码不一致');
      return;
    }
    try {
      await authAPI.changePassword({
        old_password: values.old_password,
        new_password: values.new_password
      });
      message.success('密码修改成功');
      passwordForm.resetFields();
    } catch (error) {
      message.error('密码修改失败，请检查原密码是否正确');
    }
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>👤 个人设置</Title>
      <Card>
        <Tabs
          items={[
            {
              key: 'profile',
              label: <span><UserOutlined /> 个人信息</span>,
              children: (
                <Form form={profileForm} layout="vertical" onFinish={handleUpdateProfile} style={{ maxWidth: 500 }}>
                  <Form.Item name="username" label="用户名">
                    <Input disabled />
                  </Form.Item>
                  <Form.Item name="real_name" label="真实姓名">
                    <Input />
                  </Form.Item>
                  <Form.Item name="phone" label="电话">
                    <Input />
                  </Form.Item>
                  <Form.Item name="email" label="邮箱">
                    <Input />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" icon={<SaveOutlined />} htmlType="submit">保存</Button>
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'password',
              label: <span><KeyOutlined /> 修改密码</span>,
              children: (
                <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword} style={{ maxWidth: 500 }}>
                  <Form.Item name="old_password" label="原密码" rules={[{ required: true, message: '请输入原密码' }]}>
                    <Input.Password />
                  </Form.Item>
                  <Form.Item name="new_password" label="新密码" rules={[{ required: true, message: '请输入新密码', min: 6 }]}>
                    <Input.Password />
                  </Form.Item>
                  <Form.Item name="confirm_password" label="确认密码" rules={[{ required: true, message: '请确认密码' }]}>
                    <Input.Password />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" icon={<SaveOutlined />} htmlType="submit">修改密码</Button>
                  </Form.Item>
                </Form>
              )
            }
          ]}
        />
      </Card>
    </div>
  );
}

export default Profile;
