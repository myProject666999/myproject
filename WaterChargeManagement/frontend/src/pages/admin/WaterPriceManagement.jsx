import React, { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Select, Popconfirm, message, Space, DatePicker } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { getWaterPrices, createWaterPrice, updateWaterPrice, deleteWaterPrice, getSettlementTypes } from '../../utils/api'
import dayjs from 'dayjs'

const WaterPriceManagement = () => {
  const [data, setData] = useState([])
  const [settlementTypes, setSettlementTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getWaterPrices()
      setData(res.data)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSettlementTypes = async () => {
    try {
      const res = await getSettlementTypes()
      setSettlementTypes(res.data)
    } catch (error) {
      console.error('Fetch settlement types error:', error)
    }
  }

  useEffect(() => {
    fetchData()
    fetchSettlementTypes()
  }, [])

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue({
      ...record,
      effective_date: record.effective_date ? dayjs(record.effective_date) : null
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteWaterPrice(id)
      message.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const submitData = {
        ...values,
        effective_date: values.effective_date ? values.effective_date.format('YYYY-MM-DD') : null
      }
      if (editingItem) {
        await updateWaterPrice(editingItem.id, submitData)
        message.success('更新成功')
      } else {
        await createWaterPrice(submitData)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchData()
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '价格编码', dataIndex: 'price_code', key: 'price_code' },
    { title: '价格名称', dataIndex: 'price_name', key: 'price_name' },
    { title: '单价 (元/吨)', dataIndex: 'unit_price', key: 'unit_price' },
    {
      title: '结算类型',
      dataIndex: 'settlement_type',
      key: 'settlement_type',
      render: (item) => item?.type_name || '-'
    },
    { title: '生效日期', dataIndex: 'effective_date', key: 'effective_date' },
    { title: '描述', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增水费价格
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />
      <Modal
        title={editingItem ? '编辑水费价格' : '新增水费价格'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="price_code"
            label="价格编码"
            rules={[{ required: true, message: '请输入价格编码' }]}
          >
            <Input placeholder="请输入价格编码" disabled={!!editingItem} />
          </Form.Item>
          <Form.Item
            name="price_name"
            label="价格名称"
            rules={[{ required: true, message: '请输入价格名称' }]}
          >
            <Input placeholder="请输入价格名称" />
          </Form.Item>
          <Form.Item
            name="unit_price"
            label="单价 (元/吨)"
            rules={[{ required: true, message: '请输入单价' }]}
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="请输入单价" />
          </Form.Item>
          <Form.Item name="settlement_type_id" label="结算类型">
            <Select placeholder="请选择结算类型" allowClear>
              {settlementTypes.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.type_name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="effective_date" label="生效日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default WaterPriceManagement
