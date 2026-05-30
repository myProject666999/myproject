import React from 'react';
import { Card, Form, Input, Switch, Button, message, Tabs, Table, Tag, Space, Modal } from 'antd';
import { SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const Settings = () => {
  const [form] = Form.useForm();
  const [roleForm] = Form.useForm();
  const [roleModalVisible, setRoleModalVisible] = React.useState(false);

  const handleSaveSettings = async (values) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      message.success('系统设置保存成功');
    } catch (error) {
      message.error('保存失败');
    }
  };

  const roleColumns = [
    { title: '角色名称', dataIndex: 'name', key: 'name' },
    { title: '角色标识', dataIndex: 'code', key: 'code' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small">编辑</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Space>
      )
    }
  ];

  const roleData = [
    { key: 1, name: '管理员', code: 'admin', status: 'active' },
    { key: 2, name: '编辑者', code: 'editor', status: 'active' },
    { key: 3, name: '查看者', code: 'viewer', status: 'active' },
    { key: 4, name: '访客', code: 'guest', status: 'inactive' }
  ];

  return (
    <div style={{ padding: 24 }}>
      <Tabs
        items={[
          {
            key: 'general',
            label: '基本设置',
            children: (
              <Card title="系统配置">
                <Form
                  form={form}
                  layout="vertical"
                  initialValues={{
                    siteName: '知识库Wiki',
                    siteDescription: '团队知识管理系统',
                    enableRegister: true,
                    enableComment: true,
                    defaultSpace: 1
                  }}
                  onFinish={handleSaveSettings}
                >
                  <Form.Item label="站点名称" name="siteName">
                    <Input />
                  </Form.Item>
                  <Form.Item label="站点描述" name="siteDescription">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                  <Form.Item label="开启用户注册" name="enableRegister" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item label="开启评论功能" name="enableComment" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      保存设置
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            )
          },
          {
            key: 'roles',
            label: '角色管理',
            children: (
              <Card
                title="角色列表"
                extra={
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setRoleModalVisible(true)}>
                    新增角色
                  </Button>
                }
              >
                <Table columns={roleColumns} dataSource={roleData} pagination={false} />
              </Card>
            )
          },
          {
            key: 'storage',
            label: '存储设置',
            children: (
              <Card title="存储配置">
                <Form layout="vertical" onFinish={() => message.success('存储配置保存成功')}>
                  <Form.Item label="存储类型" name="storageType" initialValue="local">
                    <Input />
                  </Form.Item>
                  <Form.Item label="文件大小限制(MB)" name="maxFileSize" initialValue={50}>
                    <Input type="number" />
                  </Form.Item>
                  <Form.Item label="允许的文件类型" name="allowedTypes" initialValue="md,txt,pdf,jpg,png">
                    <Input />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      保存配置
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            )
          }
        ]}
      />
      <Modal
        title="新增角色"
        open={roleModalVisible}
        onCancel={() => setRoleModalVisible(false)}
        onOk={() => {
          roleForm.validateFields().then(values => {
            message.success(`角色 "${values.name}" 创建成功`);
            setRoleModalVisible(false);
          });
        }}
      >
        <Form form={roleForm} layout="vertical">
          <Form.Item label="角色名称" name="name" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item label="角色标识" name="code" rules={[{ required: true, message: '请输入角色标识' }]}>
            <Input placeholder="请输入角色标识" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings;
