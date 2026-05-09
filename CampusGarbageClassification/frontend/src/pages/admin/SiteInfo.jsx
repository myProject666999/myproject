import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, Typography, Tabs } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { adminAPI } from '../../services/api';

const { Title, Text } = Typography;

function SiteInfo() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [aboutContent, setAboutContent] = useState('');
  const [contactContent, setContactContent] = useState('');

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    try {
      const about = await adminAPI.getSiteInfo('about_us');
      const contact = await adminAPI.getSiteInfo('contact_us');
      setAboutContent(about.data.data?.content || '');
      setContactContent(contact.data.data?.content || '');
      form.setFieldsValue({
        about: about.data.data?.content || '',
        contact: contact.data.data?.content || ''
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveAbout = async (values) => {
    setLoading(true);
    try {
      await adminAPI.updateSiteInfo({ type: 'about_us', content: values.about || aboutContent });
      message.success('保存成功');
      loadInfo();
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContact = async (values) => {
    setLoading(true);
    try {
      await adminAPI.updateSiteInfo({ type: 'contact_us', content: values.contact || contactContent });
      message.success('保存成功');
      loadInfo();
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>📄 网站信息管理</Title>
      <Card>
        <Tabs
          items={[
            {
              key: 'about',
              label: '关于我们',
              children: (
                <Form form={form} layout="vertical" onFinish={handleSaveAbout}>
                  <Form.Item name="about" label="关于我们内容" help="支持HTML内容">
                    <Input.TextArea rows={12} placeholder="请输入关于我们内容..." />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" icon={<SaveOutlined />} htmlType="submit" loading={loading}>保存</Button>
                  </Form.Item>
                </Form>
              )
            },
            {
              key: 'contact',
              label: '联系我们',
              children: (
                <Form form={form} layout="vertical" onFinish={handleSaveContact}>
                  <Form.Item name="contact" label="联系我们内容" help="支持HTML内容">
                    <Input.TextArea rows={12} placeholder="请输入联系我们内容..." />
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" icon={<SaveOutlined />} htmlType="submit" loading={loading}>保存</Button>
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

export default SiteInfo;
