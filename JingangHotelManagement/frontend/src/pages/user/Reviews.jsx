import { Card, Table, List, Rate, Tabs, Modal, Form, Input, Button, message } from 'antd'
import { useState, useEffect } from 'react'
import { API } from '../../services/api'

const Reviews = () => {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      const res = await API.getReviews()
      setReviews(res.data)
    } catch (e) {}
  }

  return (
    <div>
      <h2>宾馆评价</h2>
      <Card>
        <List
          dataSource={reviews}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={
                  <div>
                    <span style={{ marginRight: 16 }}>{item.user?.username}</span>
                    <Rate disabled value={item.rating} />
                  </div>
                }
                description={
                  <div>
                    <p>{item.content}</p>
                    {item.reply && <p style={{ color: '#666', background: '#f5f5f5', padding: 8, borderRadius: 4 }}>回复：{item.reply}</p>}
                    <span style={{ color: '#999', fontSize: 12 }}>{item.createdAt}</span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export default Reviews
