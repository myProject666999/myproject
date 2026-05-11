import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Select, DatePicker } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { userAPI } from '../api';
import useAuthStore from '../store/useAuthStore';

const { Option } = Select;

function ProfilePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const updateUser = useAuthStore((state) => state.updateUser);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      setUser(res.data);
      form.setFieldsValue(res.data);
    } catch (error) {
      message.error('获取个人信息失败');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await userAPI.updateProfile(values);
      updateUser(res.data.user);
      message.success('更新成功');
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h1>个人信息</h1>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={user}
        >
          <Form.Item name="username" label="用户名">
            <Input disabled prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>

          <Form.Item name="name" label="姓名">
            <Input />
          </Form.Item>

          <Form.Item name="phone" label="电话">
            <Input />
          </Form.Item>

          <Form.Item name="gender" label="性别">
            <Select>
              <Option value="男">男</Option>
              <Option value="女">女</Option>
            </Select>
          </Form.Item>

          <Form.Item name="birthday" label="生日">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="address" label="地址">
            <Input.TextArea rows={2} />
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

export default ProfilePage;
