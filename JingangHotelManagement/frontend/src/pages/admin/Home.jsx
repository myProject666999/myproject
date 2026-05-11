import { Row, Col, Card, Statistic } from 'antd'
import { HomeOutlined, UserOutlined, ShoppingOutlined, StarOutlined } from '@ant-design/icons'

const AdminHome = () => {
  return (
    <div>
      <h2>欢迎使用金港宾馆管理系统后台</h2>

      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="在线用户" value={123} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日订单" value={45} prefix={<ShoppingOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="总订单数" value={1568} prefix={<ShoppingOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="评价数" value={321} prefix={<StarOutlined />} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminHome
