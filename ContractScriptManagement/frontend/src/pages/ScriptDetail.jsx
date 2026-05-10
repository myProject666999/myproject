import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Row, Col, Typography, Button, Modal, Form, Select, InputNumber, Input, DatePicker, TimePicker, message } from 'antd'
import { ClockCircleOutlined, TeamOutlined, TagOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { scriptApi, roomApi, orderApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import WebLayout from '../components/Layout'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

function ScriptDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [script, setScript] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [orderModalVisible, setOrderModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [scriptRes, roomRes] = await Promise.all([
        scriptApi.get(id),
        roomApi.list()
      ])
      setScript(scriptRes.data)
      setRooms(roomRes.data || [])
    } finally {
      setLoading(false)
    }
  }

  const handleOrder = () => {
    if (!user) {
      message.info('请先登录')
      navigate('/login')
      return
    }
    form.resetFields()
    form.setFieldsValue({ players: script.players })
    setOrderModalVisible(true)
  }

  const handleSubmitOrder = async (values) => {
    try {
      await orderApi.create({
        script_id: parseInt(id),
        room_id: values.room_id,
        play_date: values.play_date.format('YYYY-MM-DD'),
        play_time: values.play_time.format('HH:mm'),
        players: values.players,
        remark: values.remark
      })
      message.success('下单成功！请等待管理员审核')
      setOrderModalVisible(false)
      navigate('/profile')
    } catch (err) {
      // Error handled by interceptor
    }
  }

  if (loading) return <WebLayout><div style={{ padding: 100, textAlign: 'center' }}>加载中...</div></WebLayout>
  if (!script) return <WebLayout><div style={{ padding: 100, textAlign: 'center' }}>剧本不存在</div></WebLayout>

  return (
    <WebLayout>
      <Row gutter={24}>
        <Col xs={24} md={8}>
          <Card>
            <img
              src={script.cover || 'https://placehold.co/400x500?text=剧本封面'}
              alt={script.title}
              style={{ width: '100%' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card>
            <Title level={2}>{script.title}</Title>
            <div style={{ marginBottom: 16 }}>
              <TagOutlined /> <Text type="secondary">{script.type?.name}</Text>
              <span style={{ marginLeft: 24 }}><TeamOutlined /> {script.players}人</span>
              <span style={{ marginLeft: 24 }}><ClockCircleOutlined /> {script.duration}分钟</span>
            </div>
            <Title level={3} style={{ color: '#f5222d' }}>¥{script.price} / 人</Title>
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
              {script.description || '暂无描述'}
            </Paragraph>
            <Button
              type="primary"
              size="large"
              icon={<ShoppingCartOutlined />}
              onClick={handleOrder}
            >
              立即预约
            </Button>
          </Card>
        </Col>
      </Row>

      <Modal
        title="预约剧本"
        open={orderModalVisible}
        onCancel={() => setOrderModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitOrder}
        >
          <Form.Item
            name="room_id"
            label="选择房间"
            rules={[{ required: true, message: '请选择房间' }]}
          >
            <Select placeholder="请选择房间">
              {rooms.map(room => (
                <Select.Option key={room.id} value={room.id}>
                  {room.name} (容量{room.capacity}人)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="play_date"
            label="游戏日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
          <Form.Item
            name="play_time"
            label="游戏时间"
            rules={[{ required: true, message: '请选择时间' }]}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>
          <Form.Item
            name="players"
            label="参与人数"
            rules={[{ required: true, message: '请输入人数' }]}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              确认预约
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </WebLayout>
  )
}

export default ScriptDetail
