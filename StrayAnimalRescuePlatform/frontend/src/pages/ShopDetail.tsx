import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Image, Button, Typography, Descriptions, Modal, Form, Input, DatePicker, message } from 'antd'
import { PhoneOutlined, EnvironmentOutlined, HomeOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const { Title, Text, Paragraph } = Typography
const { RangePicker } = DatePicker

const ShopDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [shop, setShop] = useState<any>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadShop()
  }, [id])

  const loadShop = async () => {
    try {
      const data = await api.get(`/shops/${id}`)
      setShop(data)
    } catch (error) {
      console.error('加载商店失败', error)
    }
  }

  const handleBoarding = async (values: any) => {
    try {
      await api.post('/boardings', {
        shop_id: shop.id,
        pet_name: values.pet_name,
        pet_type: values.pet_type,
        pet_age: values.pet_age,
        start_date: values.dates[0].format('YYYY-MM-DD'),
        end_date: values.dates[1].format('YYYY-MM-DD'),
        description: values.description
      })
      message.success('寄存申请已提交，请等待审核')
      setModalVisible(false)
    } catch (error: any) {
      message.error(error.message || '提交失败')
    }
  }

  if (!shop) {
    return <div style={{ textAlign: 'center', padding: 48 }}>加载中...</div>
  }

  return (
    <div>
      <Card>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={10}>
            <Image
              width="100%"
              src={shop.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pet%20shop%20placeholder&image_size=landscape_4_3'}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col xs={24} md={14}>
            <Title level={2}>{shop.name}</Title>

            <Descriptions column={1} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="联系电话">
                <Text>
                  <PhoneOutlined style={{ marginRight: 8 }} />
                  {shop.phone}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="地址">
                <Text>
                  <EnvironmentOutlined style={{ marginRight: 8 }} />
                  {shop.address}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Button
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              onClick={() => {
                if (!user) {
                  message.warning('请先登录')
                  navigate('/login')
                  return
                }
                setModalVisible(true)
              }}
            >
              申请宠物寄存
            </Button>
          </Col>
        </Row>
      </Card>

      <Card title="商店介绍" style={{ marginTop: 24 }}>
        <Paragraph>{shop.description || '暂无详细介绍'}</Paragraph>
      </Card>

      <Modal
        title="申请宠物寄存"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleBoarding}
        >
          <Form.Item name="pet_name" label="宠物名称" rules={[{ required: true }]}>
            <Input placeholder="请输入宠物名称" />
          </Form.Item>
          <Form.Item name="pet_type" label="宠物类型" rules={[{ required: true }]}>
            <Input placeholder="如：狗、猫" />
          </Form.Item>
          <Form.Item name="pet_age" label="宠物年龄">
            <Input placeholder="请输入宠物年龄" />
          </Form.Item>
          <Form.Item name="dates" label="寄存时间" rules={[{ required: true }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="备注">
            <Input.TextArea rows={3} placeholder="其他需要说明的事项" />
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

export default ShopDetail
