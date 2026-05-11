import { Card, Table, Tabs, Button, Modal, Form, Input, Select, message, DatePicker } from 'antd'
import { useState, useEffect } from 'react'
import { API } from '../../services/api'
import dayjs from 'dayjs'

const Booking = () => {
  const [roomTypes, setRoomTypes] = useState([])
  const [availableRooms, setAvailableRooms] = useState([])
  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()

  useEffect(() => {
    loadRoomTypes()
  }, [])

  const loadRoomTypes = async () => {
    try {
      const res = await API.getRoomTypes()
      setRoomTypes(res.data)
    } catch (e) {}
  }

  const handleSearch = async values => {
    try {
      const params = {
        checkIn: values.checkIn.format('YYYY-MM-DD'),
        checkOut: values.checkOut.format('YYYY-MM-DD')
      }
      if (values.roomTypeId) {
        params.roomTypeId = values.roomTypeId
      }
      const res = await API.getAvailableRooms(params)
      setAvailableRooms(res.data)
    } catch (e) {}
  }

  const handleBook = room => {
    form.setFieldsValue({
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomTypeName: room.roomType?.name
    })
  }

  const onFinish = async values => {
    const { checkIn, checkOut } = searchForm.getFieldsValue()
    if (!checkIn || !checkOut) {
      message.error('请先选择入住和退房时间')
      return
    }
    try {
      await API.createOrder({
        ...values,
        checkIn: checkIn.format('YYYY-MM-DD'),
        checkOut: checkOut.format('YYYY-MM-DD')
      })
      message.success('预订成功')
    } catch (e) {}
  }

  const columns = [
    { title: '房间号', dataIndex: 'roomNumber', key: 'roomNumber' },
    { title: '房型', dataIndex: 'roomType', key: 'roomType', render: rt => rt?.name },
    { title: '楼层', dataIndex: 'floor', key: 'floor' },
    { title: '价格', dataIndex: 'roomType', key: 'price', render: rt => `¥${rt?.price}/晚` },
    { title: '操作', key: 'action', render: (_, record) => (
      <Button type="primary" onClick={() => handleBook(record)}>预订</Button>
    ) }
  ]

  return (
    <div>
      <h2>客房预订</h2>

      <Card title="搜索条件" style={{ marginBottom: 16 }}>
        <Form form={searchForm} layout="inline" onFinish={handleSearch} initialValues={{ checkIn: dayjs(), checkOut: dayjs().add(1, 'day') }}>
          <Form.Item name="checkIn" label="入住时间" rules={[{ required: true }]}>
            <DatePicker style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="checkOut" label="退房时间" rules={[{ required: true }]}>
            <DatePicker style={{ width: 200 }} />
          </Form.Item>
          <Form.Item name="roomTypeId" label="房型">
            <Select placeholder="请选择房型" style={{ width: 150 }} allowClear>
              {roomTypes.map(rt => (
                <Select.Option key={rt.id} value={rt.id}>{rt.name} - ¥{rt.price}/晚</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">查询</Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="可预订房间">
        <Table columns={columns} dataSource={availableRooms} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="填写预订信息" open={form.getFieldValue('roomId') > 0} onCancel={() => form.resetFields()} footer={null}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="roomId" hidden><Input /></Form.Item>
          <Form.Item label="房间号">
            <Input disabled value={form.getFieldValue('roomNumber')} />
          </Form.Item>
          <Form.Item label="房型">
            <Input disabled value={form.getFieldValue('roomTypeName')} />
          </Form.Item>
          <Form.Item name="guestName" label="入住人姓名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="guestPhone" label="入住人电话" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>确认预订</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Booking
