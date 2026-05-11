import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Image, Typography, Descriptions, Tag, Space } from 'antd'
import { PhoneOutlined, EnvironmentOutlined, CalendarOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import api from '../api'

const { Title, Text, Paragraph } = Typography

const LostPetDetail: React.FC = () => {
  const { id } = useParams()
  const [lostPet, setLostPet] = useState<any>(null)

  useEffect(() => {
    loadLostPet()
  }, [id])

  const loadLostPet = async () => {
    try {
      const data = await api.get(`/lost-pets/${id}`)
      setLostPet(data)
    } catch (error) {
      console.error('加载挂失信息失败', error)
    }
  }

  if (!lostPet) {
    return <div style={{ textAlign: 'center', padding: 48 }}>加载中...</div>
  }

  return (
    <div>
      <Card>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={10}>
            <Image
              width="100%"
              src={lostPet.cover_image || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=lost%20pet%20placeholder&image_size=square'}
              style={{ borderRadius: 8 }}
            />
          </Col>
          <Col xs={24} md={14}>
            <Space style={{ marginBottom: 16 }}>
              <Title level={2} style={{ margin: 0 }}>{lostPet.name}</Title>
              {lostPet.found ? <Tag color="green">已找到</Tag> : <Tag color="red">丢失中</Tag>}
            </Space>

            <Descriptions column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="品种">{lostPet.breed || '未知'}</Descriptions.Item>
              <Descriptions.Item label="年龄">{lostPet.age || '未知'}</Descriptions.Item>
              <Descriptions.Item label="性别">{lostPet.gender || '未知'}</Descriptions.Item>
              <Descriptions.Item label="丢失日期">
                <CalendarOutlined style={{ marginRight: 8 }} />
                {lostPet.lost_date ? new Date(lostPet.lost_date).toLocaleDateString() : '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="丢失地点" span={2}>
                <EnvironmentOutlined style={{ marginRight: 8 }} />
                {lostPet.lost_location}
              </Descriptions.Item>
              <Descriptions.Item label="联系人">{lostPet.contact_name}</Descriptions.Item>
              <Descriptions.Item label="联系电话">
                <PhoneOutlined style={{ marginRight: 8 }} />
                {lostPet.contact_phone}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      <Card title="详细描述" style={{ marginTop: 24 }}>
        <Paragraph>{lostPet.description || '暂无详细描述'}</Paragraph>
      </Card>
    </div>
  )
}

export default LostPetDetail
