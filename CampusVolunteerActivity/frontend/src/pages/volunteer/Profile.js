import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Select, message, Upload, Tabs, Radio } from 'antd';
import { UserOutlined, CameraOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { authApi, uploadApi } from '../../utils/api';

const { Option } = Select;

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        real_name: user.real_name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        major: user.major,
        student_id: user.student_id,
        gender: user.gender,
      });
    }
  }, [user]);

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      await updateUser(values);
      message.success('个人信息更新成功！');
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    if (values.new_password !== values.confirm_password) {
      message.error('两次输入的密码不一致');
      return;
    }

    try {
      setLoading(true);
      await authApi.changePassword({
        old_password: values.old_password,
        new_password: values.new_password,
      });
      message.success('密码修改成功！');
      passwordForm.resetFields();
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      const res = await uploadApi.uploadImage(file);
      await updateUser({ avatar: res.data.url });
      message.success('头像更新成功！');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
    }
    return false;
  };

  const profileForm = (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleUpdateProfile}
      style={{ maxWidth: 500 }}
    >
      <div style={{ marginBottom: 24, textAlign: 'center' }}>
        <Upload
          name="file"
          showUploadList={false}
          beforeUpload={handleAvatarUpload}
          accept="image/*"
        >
          <div>
            <Avatar
              size={100}
              icon={<UserOutlined />}
              src={user?.avatar}
              style={{ marginBottom: 12 }}
            />
            <div>
              <Button icon={<CameraOutlined />}>更换头像</Button>
            </div>
          </div>
        </Upload>
      </div>

      <Form.Item
        name="real_name"
        label="真实姓名"
      >
        <Input placeholder="请输入真实姓名" />
      </Form.Item>

      <Form.Item
        name="email"
        label="邮箱"
        rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
      >
        <Input placeholder="请输入邮箱" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="手机号"
      >
        <Input placeholder="请输入手机号" />
      </Form.Item>

      <Form.Item
        name="gender"
        label="性别"
      >
        <Radio.Group>
          <Radio value="男">男</Radio>
          <Radio value="女">女</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        name="college"
        label="学院"
      >
        <Input placeholder="请输入学院" />
      </Form.Item>

      <Form.Item
        name="major"
        label="专业"
      >
        <Input placeholder="请输入专业" />
      </Form.Item>

      <Form.Item
        name="student_id"
        label="学号"
      >
        <Input placeholder="请输入学号" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          保存修改
        </Button>
      </Form.Item>
    </Form>
  );

  const passwordChangeForm = (
    <Form
      form={passwordForm}
      layout="vertical"
      onFinish={handleChangePassword}
      style={{ maxWidth: 500 }}
    >
      <Form.Item
        name="old_password"
        label="原密码"
        rules={[{ required: true, message: '请输入原密码' }]}
      >
        <Input.Password placeholder="请输入原密码" />
      </Form.Item>

      <Form.Item
        name="new_password"
        label="新密码"
        rules={[
          { required: true, message: '请输入新密码' },
          { min: 6, message: '密码至少6个字符' }
        ]}
      >
        <Input.Password placeholder="请输入新密码" />
      </Form.Item>

      <Form.Item
        name="confirm_password"
        label="确认密码"
        rules={[{ required: true, message: '请确认新密码' }]}
      >
        <Input.Password placeholder="请再次输入新密码" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          修改密码
        </Button>
      </Form.Item>
    </Form>
  );

  const items = [
    { key: '1', label: '个人信息', children: profileForm },
    { key: '2', label: '修改密码', children: passwordChangeForm },
  ];

  return (
    <Card title="个人中心">
      <Tabs items={items} defaultActiveKey="1" />
    </Card>
  );
};

export default Profile;
