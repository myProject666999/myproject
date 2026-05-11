import { Row, Col, Card, Statistic } from 'antd'
import { HomeOutlined, StarOutlined, ShoppingOutlined, CalendarOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { API } from '../../services/api'

const Home = () => {
  const [user, setUser] = useState(null)
  const [roomTypes, setRoomTypes] = useState([])
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    const userInfo = localStorage.getItem('user')
    if (userInfo) {
      setUser(JSON.parse(userInfo))
    }
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [roomRes, reviewRes] = await Promise.all([
        API.getRoomTypes(),
        API.getReviews()
      ])
      setRoomTypes(roomRes.data)
      setReviews(reviewRes.data.slice(0, 5))
    } catch (e) {}
  }

  const memberLevelText = {
    1: '普通会员',
    2: '银卡会员',
    3: '金卡会员',
    4: '钻石会员'
  }

  return (
    <div>
      <h2>欢迎来到金港宾馆</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="会员等级" value={memberLevelText[user?.memberLevel] || '普通会员'} prefix={<StarOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="会员积分" value={user?.memberPoints || 0} prefix={<StarOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="可订房型" value={roomTypes.length} prefix={<HomeOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="最新评价" value={reviews.length} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="客房推荐">
            <Row gutter={16}>
              {roomTypes.map(room => (
                <Col span={8} key={room.id}>
                  <Card
                    type="inner"
                    title={room.name}
                    extra={`¥${room.price}/晚`}
                  >
                    <p>{room.description}</p>
                    <p>容纳人数：{room.capacity}人</p>
                    <p>设施：{room.facilities}</p>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="最新评价">
            {reviews.map(review => (
              <Card type="inner" key={review.id} style={{ marginBottom: 8 }}>
                <p><strong>{review.user?.username}</strong> - {review.rating}星</p>
                <p>{review.content}</p>
              </Card>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Home
