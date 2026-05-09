import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, InputNumber, message, Row, Col } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { resumeApi } from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

const Resume = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadResume();
  }, []);

  const loadResume = async () => {
    setLoading(true);
    try {
      const data = await resumeApi.getMyResume();
      form.setFieldsValue(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setSaving(true);
    try {
      await resumeApi.saveResume(values);
      message.success('简历保存成功');
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Card 
        title="我的简历" 
        loading={loading}
        extra={
          <Button 
            type="primary" 
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            loading={saving}
          >
            保存简历
          </Button>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="性别">
                <Select placeholder="请选择性别">
                  <Option value="男">男</Option>
                  <Option value="女">女</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="age" label="年龄">
                <InputNumber min={18} max={65} placeholder="请输入年龄" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="email" label="邮箱" rules={[{ type: 'email', message: '邮箱格式不正确' }]}>
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="education" label="学历">
                <Select placeholder="请选择学历">
                  <Option value="大专">大专</Option>
                  <Option value="本科">本科</Option>
                  <Option value="硕士">硕士</Option>
                  <Option value="博士">博士</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="school" label="毕业院校">
                <Input placeholder="请输入毕业院校" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="major" label="所学专业">
                <Input placeholder="请输入所学专业" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item name="experience" label="工作经验">
                <Select placeholder="请选择工作经验">
                  <Option value="应届生">应届生</Option>
                  <Option value="1年以内">1年以内</Option>
                  <Option value="1-3年">1-3年</Option>
                  <Option value="3-5年">3-5年</Option>
                  <Option value="5-10年">5-10年</Option>
                  <Option value="10年以上">10年以上</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="expected_position" label="期望职位">
                <Input placeholder="请输入期望职位" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="expected_salary" label="期望薪资">
            <Input placeholder="例如：10k-15k" />
          </Form.Item>
          <Form.Item name="skills" label="技能特长">
            <TextArea rows={3} placeholder="请描述您的技能特长" />
          </Form.Item>
          <Form.Item name="introduction" label="个人简介">
            <TextArea rows={4} placeholder="请输入个人简介" />
          </Form.Item>
          <Form.Item name="work_experience" label="工作经历">
            <TextArea rows={6} placeholder="请描述您的工作经历" />
          </Form.Item>
          <Form.Item name="education_experience" label="教育经历">
            <TextArea rows={4} placeholder="请描述您的教育经历" />
          </Form.Item>
          <Form.Item name="project_experience" label="项目经验">
            <TextArea rows={6} placeholder="请描述您的项目经验" />
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Resume;
