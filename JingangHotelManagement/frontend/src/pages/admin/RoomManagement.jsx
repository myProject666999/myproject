import { Card, Table, Button, Modal, Form, Input, Select, InputNumber, message, Popconfirm, Tabs } from 'antd'
import { useState, useEffect } from 'react'
import { API } from '../../services/api'

const RoomManagement = () => {
  const [activeTab, setActiveTab] = useState('types')
  const [roomTypes, setRoomTypes] = useState([])
  const [rooms, setRooms] = useState([])
  const [typeModalVisible, setTypeModalVisible] = useState(false)
  const [roomModalVisible, setRoomModalVisible] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [editingRoom, setEditingRoom] = useState(null)
  const [typeForm] = Form.useForm()
  const [roomForm] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    try {
      const [typeRes, roomRes] = await Promise.all([
        API.getAdminRoomTypes(),
        API.getAdminRooms()
      ])
      setRoomTypes(typeRes.data)
      setRooms(roomRes.data)
    } catch (e) {}
  }

  const handleAddType = () => {
    setEditingType(null)
    typeForm.resetFields()
    setTypeModalVisible(true)
  }

  const handleEditType = record => {
    setEditingType(record)
    typeForm.setFieldsValue(record)
    setTypeModalVisible(true)
  }

  const handleDeleteType = async id => {
    try {
      await API.deleteRoomType(id)
      message.success('删除成功')
      loadData()
    } catch (e) {}
  }

  const onTypeFinish = async values => {
    try {
      if (editingType) {
        await API.updateRoomType(editingType.id, values)
        message.success('更新成功')
      } else {
        await API.createRoomType(values)
        message.success('创建成功')
      }
      setTypeModalVisible(false)
      loadData()
    } catch (e) {}
  }

  const handleAddRoom = () => {
    setEditingRoom(null)
    roomForm.resetFields()
    setRoomModalVisible(true)
  }

  const handleEditRoom = record => {
    setEditingRoom(record)
    roomForm.setFieldsValue({
      ...record,
      roomTypeId: record.roomTypeId
    })
    setRoomModalVisible(true)
  }

  const handleDeleteRoom = async id => {
    try {
      await API.deleteRoom(id)
      message.success('删除成功')
      loadData()
    } catch (e) {}
  }

  const onRoomFinish = async values => {
    try {
      if (editingRoom) {
        await API.updateRoom(editingRoom.id, values)
        message.success('更新成功')
      } else {
        await API.createRoom(values)
        message.success('创建成功')
      }
      setRoomModalVisible(false)
      loadData()
    } catch (e) {}
  }

  const typeColumns = [
    { title: '房型名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '价格', dataIndex: 'price', key: 'price', render: p => `¥${p}` },
    { title: '容纳人数', dataIndex: 'capacity', key: 'capacity' },
    { title: '设施', dataIndex: 'facilities', key: 'facilities' },
    { title: '状态', dataIndex: 'status', key: 'status', render: s => s ? '启用' : '禁用' },
    { title: '操作', key: 'action', render: (_, record) => (
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="small" onClick={() => handleEditType(record)}>编辑</Button>
        <Popconfirm title="确认删除" onConfirm={() => handleDeleteType(record.id)}>
          <Button size="small" danger>删除</Button>
        </Popconfirm>
      </div>
    ) }
  ]

  const roomColumns = [
    { title: '房间号', dataIndex: 'roomNumber', key: 'roomNumber' },
    { title: '房型', dataIndex: 'roomType', key: 'roomType', render: rt => rt?.name },
    { title: '楼层', dataIndex: 'floor', key: 'floor' },
    { title: '状态', dataIndex: 'status', key: 'status', render: s => s ? '可预订' : '不可用' },
    { title: '操作', key: 'action', render: (_, record) => (
      <div style={{ display: 'flex', gap: 8 }}>
        <Button size="small" onClick={() => handleEditRoom(record)}>编辑</Button>
        <Popconfirm title="确认删除" onConfirm={() => handleDeleteRoom(record.id)}>
          <Button size="small" danger>删除</Button>
        </Popconfirm>
      </div>
    ) }
  ]

  const items = [
    { key: 'types', label: '房型管理' },
    { key: 'rooms', label: '房间管理' }
  ]

  return (
    <div>
      <h2>客房管理</h2>
      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />

        {activeTab === 'types' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" onClick={handleAddType}>添加房型</Button>
            </div>
            <Table columns={typeColumns} dataSource={roomTypes} rowKey="id" pagination={{ pageSize: 10 }} />
          </>
        )}

        {activeTab === 'rooms' && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" onClick={handleAddRoom}>添加房间</Button>
            </div>
            <Table columns={roomColumns} dataSource={rooms} rowKey="id" pagination={{ pageSize: 10 }} />
          </>
        )}
      </Card>

      <Modal title={editingType ? '编辑房型' : '添加房型'} open={typeModalVisible} onCancel={() => setTypeModalVisible(false)} footer={null}>
        <Form form={typeForm} layout="vertical" onFinish={onTypeFinish}>
          <Form.Item name="name" label="房型名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="price" label="价格(元/晚)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="capacity" label="容纳人数">
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="facilities" label="设施">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>保存</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal title={editingRoom ? '编辑房间' : '添加房间'} open={roomModalVisible} onCancel={() => setRoomModalVisible(false)} footer={null}>
        <Form form={roomForm} layout="vertical" onFinish={onRoomFinish}>
          <Form.Item name="roomNumber" label="房间号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="roomTypeId" label="房型" rules={[{ required: true }]}>
            <Select>
              {roomTypes.map(rt => (
                <Select.Option key={rt.id} value={rt.id}>{rt.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="floor" label="楼层" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Select.Option value={1}>可预订</Select.Option>
              <Select.Option value={0}>不可用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>保存</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default RoomManagement
