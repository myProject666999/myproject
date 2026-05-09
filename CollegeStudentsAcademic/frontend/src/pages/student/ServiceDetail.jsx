import { useEffect, useState } from 'react'
import { Card, Button, Descriptions, Modal, Form, Input, DatePicker, Select, message } from 'antd'
import { CalendarOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { publicApi, studentApi } from '../../utils/api'
import dayjs from 'dayjs'

function ServiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const isLoggedIn = localStorage.getItem('token') && 
    JSON.parse(localStorage.getItem('user') || '{}').role === 'student'

  useEffect(() => {
    loadService()
  }, [id])

  const loadService = async () => {
    setLoading(true)
    try {
      const data = await publicApi.getService(id)
      setService(data)
    } catch (error) {
      message.error('加载失败')
    }
    setLoading(false)
  }

  const handleAppointment = async (values) => {
    try {
      if (!isLoggedIn) {
        message.warning('请先登录')
        navigate('/login')
        return
      }

      const appointmentData = {
        service_id: parseInt(id),
        appointment_date: values.date ? values.date.format('YYYY-MM-DD') : null,
        appointment_time: values.time,
        contact_phone: values.contact_phone,
        remark: values.remark
      }

      await studentApi.createAppointment(appointmentData)
      message.success('预约成功，请等待确认')
      setModalVisible(false)
      form.resetFields()
    } catch (error) {
      message.error(error.message || '预约失败')
    }
  }

  const timeSlots = [
    '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
  ]

  if (!service) return <div style={{ padding: 48, textAlign: 'center' }}>加载中...</div>

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/services')}
        style={{ marginBottom: 16 }}
      >
        返回服务列表
      </Button>

      <Card className="service-detail">
        <h1 style={{ marginBottom: 16 }}>{service.title}</h1>
        <div style={{ display: 'flex', gap: 24, marginBottom: 24, color: '#666' }}>
          <span>分类: {service.category || '未分类'}</span>
          <span>顾问: {service.consultant || '专业顾问'}</span>
          <span>时长: {service.duration || '-'}</span>
          <span style={{ color: '#1890ff', fontSize: 24, fontWeight: 'bold' }}>¥{service.price}</span>
        </div>

        <Descriptions bordered column={1} style={{ marginBottom: 24 }}>
          <Descriptions.Item label="服务简介">{service.description || '暂无简介'}</Descriptions.Item>
          <Descriptions.Item label="详细内容">
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
              {service.content || '暂无详细内容'}
            </div>
          </Descriptions.Item>
        </Descriptions>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Button 
            type="primary" 
            size="large" 
            icon={<CalendarOutlined />}
            onClick={() => setModalVisible(true)}
          >
            立即预约
          </Button>
        </div>
      </Card>

      <Modal
        title="预约服务"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
        destroyOnClose={true}
      >
        <Form form={form} onFinish={handleAppointment} layout="vertical" preserve={false}>
          <Form.Item label="服务">
            <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              {service.title} - ¥{service.price}
            </div>
          </Form.Item>
          <Form.Item name="date" label="预约日期" rules={[{ required: true, message: '请选择日期' }]}>
            <DatePicker 
              style={{ width: '100%' }} 
              disabledDate={current => current && current < dayjs().startOf('day')}
            />
          </Form.Item>
          <Form.Item name="time" label="预约时间" rules={[{ required: true, message: '请选择时间' }]}>
            <Select placeholder="请选择时间段">
              {timeSlots.map(t => (
                <Select.Option key={t} value={t}>{t}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="contact_phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注（可选）" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>确认预约</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ServiceDetail
