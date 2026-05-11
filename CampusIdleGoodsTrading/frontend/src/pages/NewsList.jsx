import React, { useState, useEffect } from 'react'
import { Card, Typography, List, Button, Empty, Pagination, Input } from 'antd'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import AppLayout from '../components/Layout'
import { publicApi } from '../utils/api'

const { Title, Text, Paragraph } = Typography
const { Search } = Input

function NewsList() {
  const navigate = useNavigate()
  const [news, setNews] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    loadNews()
  }, [pagination.current, pagination.pageSize, keyword])

  const loadNews = async () => {
    try {
      const params = {
        page: pagination.current,
        page_size: pagination.pageSize,
        ...(keyword && { keyword })
      }
      const res = await publicApi.getNews(params)
      setNews(res.data.list || [])
      setPagination(p => ({ ...p, total: res.data.total }))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <AppLayout>
      <Title level={3}>商品资讯</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Search
          placeholder="搜索资讯标题..."
          allowClear
          enterButton="搜索"
          value={keyword}
          onSearch={(value) => {
            setKeyword(value)
            setPagination(p => ({ ...p, current: 1 }))
          }}
          style={{ maxWidth: 400 }}
        />
      </Card>

      {news.length > 0 ? (
        <>
          <Card>
            <List
              dataSource={news}
              renderItem={item => (
                <List.Item
                  className="news-card"
                  style={{ padding: 16, cursor: 'pointer' }}
                  onClick={() => navigate(`/news/${item.id}`)}
                >
                  <List.Item.Meta
                    title={<Title level={4} style={{ margin: 0 }}>{item.title}</Title>}
                    description={
                      <div>
                        <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                          {item.content}
                        </Paragraph>
                        <div style={{ color: '#999', fontSize: 12 }}>
                          <Text type="secondary">作者: {item.author || '管理员'}</Text>
                          <Text type="secondary" style={{ marginLeft: 24 }}>
                            浏览: {item.views}
                          </Text>
                          <Text type="secondary" style={{ marginLeft: 24 }}>
                            发布时间: {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
          
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onChange={(page, pageSize) => setPagination(p => ({ ...p, current: page, pageSize }))}
            />
          </div>
        </>
      ) : (
        <Empty description="暂无资讯" />
      )}
    </AppLayout>
  )
}

export default NewsList
