import React, { useState } from 'react';
import { Card, Form, Input, Button, Avatar, message, Upload, Tabs, Statistic, Row, Col } from 'antd';
import { UserOutlined, SaveOutlined, UploadOutlined, FileTextOutlined, FolderOpenOutlined, TeamOutlined } from '@ant-design/icons';

const Profile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('个人信息更新成功');
    } catch (error) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const statsItems = [
    { label: '文档总数', value: 28, icon: <FileTextOutlined />, color: '#1890ff' },
    { label: '空间数量', value: 3, icon: <FolderOpenOutlined />, color: '#52c41a' },
    { label: '协作成员', value: 12, icon: <TeamOutlined />, color: '#faad14' }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card title="个人中心" style={{ marginBottom: 24 }}>
        <Row gutter={24} style={{ marginBottom: 24 }}>
          {statsItems.map((item, index) => (
            <Col span={8} key={index}>
              <Card>
                <Statistic
                  title={item.label}
                  value={item.value}
                  prefix={item.icon}
                  valueStyle={{ color: item.color }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
      <Tabs
        items={[
          {
            key: 'basic',
            label: '基本信息',
            children: (
              <Card>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <Avatar size={96} icon={<UserOutlined />} style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 18, fontWeight: 600 }}>admin</div>
                  <Upload
                    showUploadList={false}
                    beforeUpload={() => {
                      message.info('头像上传功能');
                      return false;
                    }}
                  >
                    <Button size="small" icon={<UploadOutlined />} style={{ marginTop: 8 }}>
                      更换头像
                    </Button>
                  </Upload>
                </div>
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    username: 'admin',
                    email: 'admin@example.com',
                    phone: '13800138000',
                    department: '技术部'
                  }}
                  onFinish={handleSubmit}
                >
                  <Form.Item name="username" label="用户名">
                    <Input disabled />
                  </Form.Item>
                  <Form.Item name="email" label="邮箱">
                    <Input />
                  </Form.Item>
                  <Form.Item name="phone" label="手机号">
                    <Input />
                  </Form.Item>
                  <Form.Item name="department" label="部门">
                    <Input />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                      保存修改
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            )
          },
          {
            key: 'security',
            label: '安全设置',
            children: (
              <Card>
                <Form layout="vertical" onFinish={() => message.success('密码修改成功')}>
                  <Form.Item label="当前密码" name="oldPassword">
                    <Input.Password placeholder="请输入当前密码" />
                  </Form.Item>
                  <Form.Item label="新密码" name="newPassword">
                    <Input.Password placeholder="请输入新密码" />
                  </Form.Item>
                  <Form.Item label="确认新密码" name="confirmPassword">
                    <Input.Password placeholder="请再次输入新密码" />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      修改密码
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            )
          }
        ]}
      />
    </div>
  );
};

export default Profile;
