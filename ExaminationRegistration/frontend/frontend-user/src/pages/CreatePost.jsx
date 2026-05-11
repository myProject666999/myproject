import React from 'react'
import { Card, Form, Input, Select, Button, message, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { createPost } from '../utils/api'

const { Title } = Typography
const { TextArea } = Input

const CreatePost = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const onFinish = async (values) => {
    try {
      await createPost(values)
      message.success('发布成功')
      navigate('/posts')
    } catch (error) {
      console.error('Create post error:', error)
    }
  }

  return (
    <div>
      <Title level={2} className="section-title">发布帖子</Title>
      
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="title"
            label="帖子标题"
            rules={[{ required: true, message: '请输入帖子标题' }]}
          >
            <Input placeholder="请输入帖子标题" size="large" />
          </Form.Item>

          <Form.Item
            name="category"
            label="帖子分类"
          >
            <Select 
              placeholder="请选择分类" 
              size="large"
              options={[
                { value: '学习交流', label: '学习交流' },
                { value: '求职面试', label: '求职面试' },
                { value: '技术分享', label: '技术分享' },
                { value: '其他', label: '其他' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="帖子内容"
            rules={[{ required: true, message: '请输入帖子内容' }]}
          >
            <TextArea 
              rows={10} 
              placeholder="请输入帖子内容" 
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" size="large" htmlType="submit">
              发布帖子
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default CreatePost
