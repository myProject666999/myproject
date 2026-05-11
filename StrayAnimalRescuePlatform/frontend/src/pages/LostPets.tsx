import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Pagination, Input, Select, Typography, Space, Button, Modal, Form, DatePicker, message, Tag } from 'antd'
import { SearchOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const { Title, Text } = Typography

const LostPets: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [lostPets, setLostPets] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(12)
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadLostPets()
  }, [page, keyword, location])

  const loadLostPets = async () => {
    try {
      let url = `/lost-pets?page=${page}&page_size=${pageSize}`
      if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`
      if (location) url += `&location=${encodeURIComponent(location)}`
      const data = await api.get(url)
      setLostPets(data.list || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('加载挂失信息失败', error)
    }
  }

  const handlePublish = async (values: any) => {
    try {
      await api.post('/lost-pets', {
        ...values,
        lost_date: values.lost_date?.format('YYYY-MM-DD')
      })
      message.success('发布成功')
      setModalVisible(false)
      form.resetFields()
      loadLostPets()
    } catch (error: any) {
      message.error(error.message || '发布失败')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>宠物挂失</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            if (!user) {
              message.warning('请先登录')
              navigate('/login')
              return
            }
            setModalVisible(true)
          }}
        >
          发布挂失
        </Button>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="搜索宠物名称或品种"
                prefix={<SearchOutlined />}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <Input
                placeholder="搜索丢失地点"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </Space.Compact>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {lostPets.map(item => (
          <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
            <Card
              hoverable
              onClick={() => navigate(`/lost-pets/${item.id}`)}
              cover={
                <img
                  alt={item.name}
                  src={item.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lost%20pet%20placeholder&image_size=square'}
                  style={{ height: 180, objectFit: 'cover' }}
                />
              }
            >
              <Card.Meta
                title={
                  <Space>
                    <Text strong>{item.name}</Text>
                    {item.found ? <Tag color="green">已找到</Tag> : <Tag color="red">丢失中</Tag>}
                  </Space>
                }
                description={
                  <div>
                    <Text type="secondary">{item.breed || '未知品种'}</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" ellipsis>丢失地点：{item.lost_location}</Text>
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {lostPets.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
      )}

      <Modal
        title="发布宠物挂失"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePublish}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="name" label="宠物名称" rules={[{ required: true }]}>
                <Input placeholder="请输入宠物名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="breed" label="品种">
                <Input placeholder="请输入品种" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="age" label="年龄">
                <Input placeholder="请输入年龄" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="性别">
                <Select placeholder="请选择">
                  <Select.Option value="公">公</Select.Option>
                  <Select.Option value="母">母</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="lost_date" label="丢失日期" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lost_location" label="丢失地点" rules={[{ required: true }]}>
                <Input placeholder="请输入丢失地点" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="contact_name" label="联系人" rules={[{ required: true }]}>
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="contact_phone" label="联系电话" rules={[{ required: true }]}>
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="详细描述">
            <Input.TextArea rows={3} placeholder="请描述宠物特征等信息" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              发布
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default LostPets
