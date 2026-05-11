import { Card, Table, Tabs, List, Button, Modal, message } from 'antd'
import { useState, useEffect } from 'react'
import { API } from '../../services/api'

const MemberCenter = () => {
  const [pointsRecords, setPointsRecords] = useState([])
  const [products, setProducts] = useState([])
  const [productOrders, setProductOrders] = useState([])
  const [user, setUser] = useState(null)
  const [exchangeModalVisible, setExchangeModalVisible] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)

  useEffect(() => {
    const userInfo = localStorage.getItem('user')
    if (userInfo) {
      setUser(JSON.parse(userInfo))
    }
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [pointsRes, productsRes, ordersRes, profileRes] = await Promise.all([
        API.getPointsRecords(),
        API.getProducts(),
        API.getProductOrders(),
        API.getProfile()
      ])
      setPointsRecords(pointsRes.data)
      setProducts(productsRes.data)
      setProductOrders(ordersRes.data)
      setUser(profileRes.data)
      localStorage.setItem('user', JSON.stringify(profileRes.data))
    } catch (e) {}
  }

  const handleExchange = product => {
    setCurrentProduct(product)
    setExchangeModalVisible(true)
  }

  const confirmExchange = async () => {
    try {
      await API.exchangeProduct({ productId: currentProduct.id, quantity: 1 })
      message.success('兑换成功')
      setExchangeModalVisible(false)
      loadData()
    } catch (e) {}
  }

  const pointsColumns = [
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt' },
    { title: '类型', dataIndex: 'type', key: 'type', render: v => v === 1 ? '获得' : '消费' },
    { title: '积分', dataIndex: 'points', key: 'points' },
    { title: '原因', dataIndex: 'reason', key: 'reason' }
  ]

  const memberLevelText = { 1: '普通会员', 2: '银卡会员', 3: '金卡会员', 4: '钻石会员' }
  const memberLevelDiscount = { 1: '100%', 2: '95%', 3: '90%', 4: '85%' }

  const items = [
    {
      key: '1',
      label: '会员信息',
      children: (
        <Card>
          <p>会员等级：{memberLevelText[user?.memberLevel] || '普通会员'}</p>
          <p>当前积分：{user?.memberPoints || 0} 分</p>
          <p>折扣优惠：{memberLevelDiscount[user?.memberLevel] || '100%'}</p>
        </Card>
      )
    },
    {
      key: '2',
      label: '积分记录',
      children: (
        <Card>
          <Table columns={pointsColumns} dataSource={pointsRecords} rowKey="id" pagination={{ pageSize: 10 }} />
        </Card>
      )
    },
    {
      key: '3',
      label: '会员商城',
      children: (
        <Card>
          <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={products}
            renderItem={item => (
              <List.Item>
                <Card
                  title={item.name}
                  extra={`${item.points} 积分`}
                >
                  <p>{item.description}</p>
                  <p>库存：{item.stock}</p>
                  <Button type="primary" onClick={() => handleExchange(item)} disabled={item.stock === 0 || (user?.memberPoints || 0) < item.points}>
                    立即兑换
                  </Button>
                </Card>
              </List.Item>
            )}
          />
        </Card>
      )
    },
    {
      key: '4',
      label: '兑换记录',
      children: (
        <Card>
          <Table
            columns={[
              { title: '订单号', dataIndex: 'orderNo', key: 'orderNo' },
              { title: '商品', dataIndex: 'product', key: 'product', render: p => p?.name },
              { title: '数量', dataIndex: 'quantity', key: 'quantity' },
              { title: '积分', dataIndex: 'totalPoints', key: 'totalPoints' },
              { title: '时间', dataIndex: 'createdAt', key: 'createdAt' }
            ]}
            dataSource={productOrders}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    }
  ]

  return (
    <div>
      <h2>会员中心</h2>
      <Tabs items={items} />

      <Modal
        title="确认兑换"
        open={exchangeModalVisible}
        onOk={confirmExchange}
        onCancel={() => setExchangeModalVisible(false)}
      >
        <p>商品：{currentProduct?.name}</p>
        <p>所需积分：{currentProduct?.points}</p>
        <p>当前积分：{user?.memberPoints}</p>
      </Modal>
    </div>
  )
}

export default MemberCenter
