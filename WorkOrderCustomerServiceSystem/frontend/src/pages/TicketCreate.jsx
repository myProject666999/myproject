import React, { useState, useEffect } from 'react'
import { Form, Input, Select, Button, Card, message } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { ticketApi, categoryApi } from '../api/index.js'

const { TextArea } = Input
const { Option } = Select

function TicketCreate() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll()
      setCategories(data || [])
    } catch (error) {
      console.error('获取分类列表失败:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      await ticketApi.create({
        ...values,
        customerId: 4
      })
      message.success('工单提交成功')
      navigate('/tickets')
    } catch (error) {
      if (error.errorFields) return
      message.error('工单提交失败: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          返回
        </Button>
        <h1 className="page-title">提交工单</h1>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          style={{ maxWidth: 800 }}
          initialValues={{ priority: 'MEDIUM' }}
        >
          <Form.Item
            name="title"
            label="工单标题"
            rules={[
              { required: true, message: '请输入工单标题' },
              { max: 200, message: '标题不能超过200个字符' }
            ]}
          >
            <Input placeholder="请简要描述您的问题" size="large" />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="问题分类"
            rules={[{ required: true, message: '请选择问题分类' }]}
          >
            <Select placeholder="请选择问题分类" size="large">
              {categories.filter(c => !c.parentId).map(category => (
                <Option key={category.id} value={category.id}>{category.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select size="large">
              <Option value="LOW">低</Option>
              <Option value="MEDIUM">中</Option>
              <Option value="HIGH">高</Option>
              <Option value="URGENT">紧急</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="问题描述"
            rules={[
              { required: true, message: '请输入问题描述' },
              { min: 10, message: '描述内容至少10个字符' }
            ]}
          >
            <TextArea
              rows={6}
              placeholder="请详细描述您遇到的问题，包括：问题现象、出现时间、已尝试的解决方法等"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={handleSubmit}
            >
              提交工单
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default TicketCreate