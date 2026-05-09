import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import request from '../../utils/request';

function SystemSettings() {
  const [form] = Form.useForm();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await request.get('/admin/system-settings');
      if (res.code === 200) {
        form.setFieldsValue(res.data || {});
      }
    } catch (error) {
      console.error('加载设置失败', error);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const res = await request.put('/admin/system-settings', values);
      if (res.code === 200) {
        message.success('保存成功');
      }
    } catch (error) {
      message.error('保存失败');
    }
  };

  return (
    <div>
      <h2>系统设置</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ maxWidth: 800 }}
      >
        <Card title="系统简介" style={{ marginBottom: 16 }}>
          <Form.Item name="system_intro" label="系统简介">
            <Input.TextArea rows={4} placeholder="请输入系统简介" />
          </Form.Item>
        </Card>

        <Card title="关于我们" style={{ marginBottom: 16 }}>
          <Form.Item name="about_us" label="关于我们">
            <Input.TextArea rows={4} placeholder="请输入关于我们内容" />
          </Form.Item>
        </Card>

        <Card title="联系方式" style={{ marginBottom: 16 }}>
          <Form.Item name="contact_email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="contact_phone" label="电话">
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item name="contact_address" label="地址">
            <Input placeholder="请输入地址" />
          </Form.Item>
        </Card>

        <Form.Item>
          <Button type="primary" htmlType="submit">保存设置</Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default SystemSettings;
