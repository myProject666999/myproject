import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Image, Button, Typography, Descriptions, Tag, Modal, Form, Input, message } from 'antd'
import { HeartOutlined, HomeOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const { Title, Text, Paragraph } = Typography

const PetDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pet, setPet] = useState<any>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadPet()
  }, [id])

  const loadPet = async () => {
    try {
      const data = await api.get(`/pets/${id}`)
      setPet(data)
    } catch (error) {
      console.error('加载宠物失败', error)
    }
  }

  const handleAdoption = async (values: any) => {
    try {
      await api.post('/adoptions', {
        pet_id: pet.id,
        ...values
      })
      message.success('领养申请已提交，请等待审核')
      setModalVisible(false)
    } catch (error: any) {
      message.error(error.message || '提交失败')
    }
  }

  if (!pet) {
    return <div style={{ textAlign: 'center', padding: 48 }}>加载中...</div>
  }

  return (
    <div>
      <Card>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={10}>
            <Image
              width="100%"
              src={pet.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20pet%20placeholder&image_size=square'}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col xs={24} md={14}>
            <Title level={2}>{pet.name}</Title>
            <Tag color="blue" style={{ marginBottom: 16 }}>{pet.pet_category?.name || '未知'}</Tag>

            <Descriptions column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="品种">{pet.breed || '未知'}</Descriptions.Item>
              <Descriptions.Item label="年龄">{pet.age || '未知'}</Descriptions.Item>
              <Descriptions.Item label="性别">{pet.gender || '未知'}</Descriptions.Item>
              <Descriptions.Item label="状态">
                {pet.adopted ? <Tag color="red">已领养</Tag> : <Tag color="green">待领养</Tag>}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                type="primary"
                size="large"
                icon={<HeartOutlined />}
                disabled={pet.adopted}
                onClick={() => {
                  if (!user) {
                    message.warning('请先登录')
                    navigate('/login')
                    return
                  }
                  setModalVisible(true)
                }}
              >
                {pet.adopted ? '已被领养' : '申请领养'}
              </Button>
              <Button
                size="large"
                icon={<HeartOutlined />}
              >
                收藏
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      <Card title="宠物简介" style={{ marginTop: 24 }}>
        <Paragraph>{pet.description || '暂无详细描述'}</Paragraph>
      </Card>

      <Modal
        title="申请领养"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAdoption}
        >
          <Form.Item name="name" label="您的姓名" rules={[{ required: true }]}>
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item name="phone" label="联系电话" rules={[{ required: true }]}>
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item name="address" label="居住地址" rules={[{ required: true }]}>
            <Input placeholder="请输入地址" />
          </Form.Item>
          <Form.Item name="reason" label="领养理由">
            <Input.TextArea rows={4} placeholder="请简单描述您的领养理由" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              提交申请
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PetDetail
