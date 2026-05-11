import React, { useState, useEffect, useRef } from 'react'
import { Table, Button, Modal, message, Space, Tag } from 'antd'
import { PrinterOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { getUserBills, payWaterBill } from '../../utils/api'

const UserBills = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [receiptVisible, setReceiptVisible] = useState(false)
  const [receiptData, setReceiptData] = useState(null)
  const printRef = useRef()

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await getUserBills()
      setData(res.data)
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handlePay = async (id) => {
    try {
      await payWaterBill(id)
      message.success('缴费成功')
      fetchData()
    } catch (error) {
      console.error('Pay error:', error)
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
    { title: '账单编号', dataIndex: 'bill_no', key: 'bill_no' },
    {
      title: '水表',
      dataIndex: 'meter',
      key: 'meter',
      render: (meter) => meter?.meter_no || '-'
    },
    { title: '上期读数(吨)', dataIndex: 'previous_reading', key: 'previous_reading' },
    { title: '本期读数(吨)', dataIndex: 'current_reading', key: 'current_reading' },
    { title: '用水量(吨)', dataIndex: 'water_usage', key: 'water_usage' },
    { title: '单价(元/吨)', dataIndex: 'unit_price', key: 'unit_price' },
    { title: '金额(元)', dataIndex: 'total_amount', key: 'total_amount' },
    { title: '开单日期', dataIndex: 'billing_date', key: 'billing_date' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => status === 'paid'
        ? <Tag color="green">已缴费</Tag>
        : <Tag color="orange">未缴费</Tag>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'unpaid' && (
            <Button type="link" icon={<CheckCircleOutlined />} onClick={() => handlePay(record.id)}>
              缴费
            </Button>
          )}
          <Button type="link" icon={<PrinterOutlined />} onClick={() => handlePrint(record)}>
            打印
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <h3 style={{ marginBottom: 16 }}>我的水费账单</h3>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
      />
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

export default UserBills
