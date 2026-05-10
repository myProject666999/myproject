import { useState, useEffect } from 'react';
import { Layout, Card, Form, Input, Button, message, Avatar, Upload } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { authApi, uploadApi } from '../../api';
import { useAuth } from '../../context/AuthContext';

const { Content } = Layout;

export default function Profile() {
  const { user, loading, refreshUser } = useAuth();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (user) {
      setAvatar(user.avatar);
      form.setFieldsValue({
        nickname: user.nickname,
        email: user.email,
        phone: user.phone,
      });
    }
  }, [user]);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const data = { ...values };
      if (avatar) {
        data.avatar = avatar;
      }
      await authApi.updateProfile(data);
      message.success('保存成功');
      await refreshUser();
    } catch (error) {
      message.error(error.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const customUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file);
      if (res.code === 200) {
        const url = 'http://localhost:8080' + res.data.url;
        setAvatar(url);
        onSuccess(res.data);
        message.success('头像上传成功，请点击保存按钮保存修改');
      } else {
        onError(new Error(res.message || '上传失败'));
      }
    } catch (error) {
      onError(error);
      message.error(error.message || '头像上传失败');
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    name: 'file',
    customRequest: customUpload,
    showUploadList: false,
  };

  if (loading) return <div style={{ padding: 50, textAlign: 'center' }}>加载中...</div>;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px 50px', background: '#f0f2f5' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Card title="个人中心">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                size={100}
                icon={<UserOutlined />}
                src={avatar || user?.avatar}
              />
              <div style={{ marginTop: 16 }}>
                <Upload {...uploadProps} showUploadList={false}>
                  <Button icon={<UploadOutlined />}>更换头像</Button>
                </Upload>
              </div>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSave}>
              <Form.Item label="用户名">
                <Input value={user?.username} disabled />
              </Form.Item>
              <Form.Item name="nickname" label="昵称">
                <Input />
              </Form.Item>
              <Form.Item name="email" label="邮箱">
                <Input />
              </Form.Item>
              <Form.Item name="phone" label="手机号">
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" block loading={saving}>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  );
}
