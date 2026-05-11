import React, { useState, useEffect, useRef } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, Select, Popconfirm, message, Space, DatePicker, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, PrinterOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { getWaterBills, createWaterBill, updateWaterBill, deleteWaterBill, payWaterBill, getUsers, getWaterMeters, getWaterPrices } from '../../utils/api'
import dayjs from 'dayjs'

const WaterBillManagement = () => {
  const [data, setData] = useState([])
  const [users, setUsers] = useState([])
  const [meters, setMeters] = useState([])
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [receiptVisible, setReceiptVisible] = useState(false)
  const [receiptData, setReceiptData] = useState(null)
  const [form] = Form.useForm()
  const printRef = useRef()

  const fetchData = async (userNo = '') => {
    setLoading(true)
    try {
      const res = await getWaterBills({ user_no: userNo })
      setData(res.data)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedData = async () => {
    try {
      const [usersRes, metersRes, pricesRes] = await Promise.all([
        getUsers(),
        getWaterMeters(),
        getWaterPrices()
      ])
      setUsers(usersRes.data)
      setMeters(metersRes.data)
      setPrices(pricesRes.data)
    } catch (error) {
      console.error('Fetch related data error:', error)
    }
  }

  useEffect(() => {
    fetchData()
    fetchRelatedData()
  }, [])

  const handleSearch = () => {
    fetchData(searchText)
  }

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue({
      ...record,
      billing_date: record.billing_date ? dayjs(record.billing_date) : null
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteWaterBill(id)
      message.success('删除成功')
      fetchData(searchText)
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handlePay = async (id) => {
    try {
      await payWaterBill(id)
      message.success('缴费成功')
      fetchData(searchText)
    } catch (error) {
      console.error('Pay error:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const submitData = {
        ...values,
        billing_date: values.billing_date ? values.billing_date.format('YYYY-MM-DD') : null
      }
      if (editingItem) {
        await updateWaterBill(editingItem.id, submitData)
        message.success('更新成功')
      } else {
        await createWaterBill(submitData)
        message.success('创建成功')
      }
      setModalVisible(false)
      fetchData(searchText)
    } catch (error) {
      console.error('Submit error:', error)
    }
  }

  const handlePrint = (record) => {
    setReceiptData(record)
    setReceiptVisible(true)
  }

  const doPrint = () => {
    if (printRef.current) {
      const printWindow = window.open('', '_blank')
      printWindow.document.write(`
        <html>
          <head>
            <title>水费缴费小票</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 10px; width: 300px; }
              .receipt { text-align: center; }
              .title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
              .company { font-size: 12px; margin-bottom: 10px; }
              .divider { border-top: 1px dashed #000; margin: 10px 0; }
              .row { display: flex; justify-content: space-between; font-size: 12px; margin: 5px 0; }
              .total { font-size: 14px; font-weight: bold; margin-top: 10px; }
              .footer { font-size: 10px; margin-top: 20px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="title">水费缴费凭证</div>
              <div class="company">自来水分公司</div>
              <div class="divider"></div>
              <div class="row"><span>账单编号:</span><span>${receiptData.bill_no}</span></div>
              <div class="row"><span>用户编号:</span><span>${receiptData.user?.user_no || '-'}</span></div>
              <div class="row"><span>姓名:</span><span>${receiptData.user?.real_name || receiptData.user?.username || '-'}</span></div>
              <div class="row"><span>水表编号:</span><span>${receiptData.meter?.meter_no || '-'}</span></div>
              <div class="divider"></div>
              <div class="row"><span>上期读数:</span><span>${receiptData.previous_reading} 吨</span></div>
              <div class="row"><span>本期读数:</span><span>${receiptData.current_reading} 吨</span></div>
              <div class="row"><span>用水量:</span><span>${receiptData.water_usage} 吨</span></div>
              <div class="row"><span>单价:</span><span>¥${receiptData.unit_price}/吨</span></div>
              <div class="divider"></div>
              <div class="total">应收金额: ¥${receiptData.total_amount.toFixed(2)}</div>
              <div class="row"><span>状态:</span><span>${receiptData.status === 'paid' ? '已缴费' : '未缴费'}</span></div>
              <div class="row"><span>开单日期:</span><span>${receiptData.billing_date || '-'}</span></div>
              ${receiptData.paid_date ? `<div class="row"><span>缴费日期:</span><span>${receiptData.paid_date}</span></div>` : ''}
              <div class="divider"></div>
              <div class="footer">本小票仅作缴费凭证</div>
              <div class="footer">谢谢惠顾！</div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '账单编号', dataIndex: 'bill_no', key: 'bill_no', width: 160 },
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
      render: (user) => user ? `${user.user_no} - ${user.real_name || user.username}` : '-'
    },
    {
      title: '水表',
      dataIndex: 'meter',
      key: 'meter',
      render: (meter) => meter?.meter_no || '-'
    },
    { title: '上期读数', dataIndex: 'previous_reading', key: 'previous_reading', width: 100 },
    { title: '本期读数', dataIndex: 'current_reading', key: 'current_reading', width: 100 },
    { title: '用水量(吨)', dataIndex: 'water_usage', key: 'water_usage', width: 100 },
    { title: '单价(元/吨)', dataIndex: 'unit_price', key: 'unit_price', width: 110 },
    { title: '金额(元)', dataIndex: 'total_amount', key: 'total_amount', width: 100 },
    { title: '开单日期', dataIndex: 'billing_date', key: 'billing_date', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => status === 'paid'
        ? <Tag color="green">已缴费</Tag>
        : <Tag color="orange">未缴费</Tag>
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'unpaid' && (
            <Button type="link" icon={<CheckCircleOutlined />} onClick={() => handlePay(record.id)}>
              缴费
            </Button>
          )}
          <Button type="link" icon={<PrinterOutlined />} onClick={() => handlePrint(record)}>
            打印
          </Button>
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
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Input.Search
          placeholder="按用户编号搜索"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onSearch={handleSearch}
          style={{ width: 300 }}
          enterButton={<SearchOutlined />}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增水费账单
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1400 }}
      />
      <Modal
        title={editingItem ? '编辑水费账单' : '新增水费账单'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="user_id"
            label="用户"
            rules={[{ required: true, message: '请选择用户' }]}
          >
            <Select placeholder="请选择用户" showSearch optionFilterProp="children">
              {users.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.user_no} - {item.real_name || item.username}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="meter_id"
            label="水表"
            rules={[{ required: true, message: '请选择水表' }]}
          >
            <Select placeholder="请选择水表">
              {meters.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.meter_no} ({item.user?.real_name || item.user?.username || '未分配'})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="water_price_id"
            label="水费价格"
            rules={[{ required: true, message: '请选择水费价格' }]}
          >
            <Select placeholder="请选择水费价格">
              {prices.map((item) => (
                <Select.Option key={item.id} value={item.id}>
                  {item.price_name} (¥{item.unit_price}/吨)
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item
              name="previous_reading"
              label="上期读数 (吨)"
              rules={[{ required: true, message: '请输入上期读数' }]}
              style={{ flex: 1 }}
            >
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="上期读数" />
            </Form.Item>
            <Form.Item
              name="current_reading"
              label="本期读数 (吨)"
              rules={[{ required: true, message: '请输入本期读数' }]}
              style={{ flex: 1 }}
            >
              <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="本期读数" />
            </Form.Item>
          </div>
          <Form.Item
            name="unit_price"
            label="单价 (元/吨)"
            rules={[{ required: true, message: '请输入单价' }]}
          >
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="单价" />
          </Form.Item>
          <Form.Item name="billing_date" label="开单日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          {editingItem && (
            <Form.Item name="status" label="状态" initialValue="unpaid">
              <Select>
                <Select.Option value="unpaid">未缴费</Select.Option>
                <Select.Option value="paid">已缴费</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
      <Modal
        title="打印水费缴费小票"
        open={receiptVisible}
        onCancel={() => setReceiptVisible(false)}
        footer={[
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={doPrint}>
            打印
          </Button>,
          <Button key="close" onClick={() => setReceiptVisible(false)}>
            关闭
          </Button>
        ]}
        width={400}
      >
        {receiptData && (
          <div ref={printRef} className="print-receipt" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>水费缴费凭证</div>
            <div style={{ fontSize: 12, marginBottom: 10 }}>自来水分公司</div>
            <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, margin: '5px 0' }}>
              <span>账单编号:</span><span>{receiptData.bill_no}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, margin: '5px 0' }}>
              <span>用户编号:</span><span>{receiptData.user?.user_no || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, margin: '5px 0' }}>
              <span>姓名:</span><span>{receiptData.user?.real_name || receiptData.user?.username || '-'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, margin: '5px 0' }}>
              <span>水表编号:</span><span>{receiptData.meter?.meter_no || '-'}</span>
            </div>
            <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, margin: '5px 0' }}>
              <span>上期读数:</span><span>{receiptData.previous_reading} 吨</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, margin: '5px 0' }}>
              <span>本期读数:</span><span>{receiptData.current_reading} 吨</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, margin: '5px 0' }}>
              <span>用水量:</span><span>{receiptData.water_usage} 吨</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, margin: '5px 0' }}>
              <span>单价:</span><span>¥{receiptData.unit_price}/吨</span>
            </div>
            <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>
            <div style={{ fontSize: 14, fontWeight: 'bold', marginTop: 10 }}>
              应收金额: ¥{receiptData.total_amount.toFixed(2)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, margin: '5px 0' }}>
              <span>状态:</span><span>{receiptData.status === 'paid' ? '已缴费' : '未缴费'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, margin: '5px 0' }}>
              <span>开单日期:</span><span>{receiptData.billing_date || '-'}</span>
            </div>
            {receiptData.paid_date && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, margin: '5px 0' }}>
                <span>缴费日期:</span><span>{receiptData.paid_date}</span>
              </div>
            )}
            <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }}></div>
            <div style={{ fontSize: 10, marginTop: 20, textAlign: 'center' }}>本小票仅作缴费凭证</div>
            <div style={{ fontSize: 10, textAlign: 'center' }}>谢谢惠顾！</div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default WaterBillManagement
