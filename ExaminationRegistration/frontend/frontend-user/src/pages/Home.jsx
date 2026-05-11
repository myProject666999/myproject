import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Button, Carousel, Typography, Space } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { getIntroList, getProjectList, getPaperList, getPostList } from '../utils/api'

const { Title, Paragraph } = Typography

const Home = () => {
  const navigate = useNavigate()
  const [intros, setIntros] = useState([])
  const [projects, setProjects] = useState([])
  const [papers, setPapers] = useState([])
  const [posts, setPosts] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [introsRes, projectsRes, papersRes, postsRes] = await Promise.all([
        getIntroList({ page_size: 6 }),
        getProjectList({ page_size: 4 }),
        getPaperList({ page_size: 4 }),
        getPostList({ page_size: 6 })
      ])
      setIntros(introsRes.data.list || [])
      setProjects(projectsRes.data.list || [])
      setPapers(papersRes.data.list || [])
      setPosts(postsRes.data.list || [])
    } catch (error) {
      console.error('Load data error:', error)
    }
  }

  return (
    <div>
      <div className="banner">
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 56, marginBottom: 16 }}>考试报名管理系统</h1>
          <p style={{ fontSize: 20, opacity: 0.9 }}>在线报名 · 在线考试 · 一站式服务</p>
          <Space size="large" style={{ marginTop: 32 }}>
            <Button type="primary" size="large" onClick={() => navigate('/projects')}>
              立即报名
            </Button>
            <Button size="large" style={{ background: 'transparent', color: 'white', borderColor: 'white' }} onClick={() => navigate('/papers')}>
              在线考试
            </Button>
          </Space>
        </div>
      </div>

      <div style={{ padding: '40px 0' }}>
        <div style={{ marginBottom: 40 }}>
          <Title level={2} className="section-title">学校简介</Title>
          <Row gutter={[16, 16]}>
            {intros.map(item => (
              <Col span={8} key={item.id}>
                <Card 
                  className="card-hover"
                  hoverable
                  cover={
                    <div style={{ 
                      height: 200, 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 48
                    }}>
                      🏫
                    </div>
                  }
                  onClick={() => navigate(`/intros/${item.id}`)}
                >
                  <Card.Meta 
                    title={item.title}
                    description={<Paragraph ellipsis={{ rows: 2 }}>{item.content}</Paragraph>}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={2} className="section-title">热门课程</Title>
            <Button type="link" onClick={() => navigate('/projects')}>
              查看更多 <ArrowRightOutlined />
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {projects.map(item => (
              <Col span={6} key={item.id}>
                <Card 
                  className="card-hover"
                  hoverable
                  cover={
                    <div style={{ 
                      height: 180, 
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: 48
                    }}>
                      📚
                    </div>
                  }
                  onClick={() => navigate(`/projects/${item.id}`)}
                >
                  <Card.Meta 
                    title={item.name}
                    description={
                      <div>
                        <span className="price">¥{item.price}</span>
                        <span className="original-price">¥{item.original_price}</span>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={2} className="section-title">试卷中心</Title>
            <Button type="link" onClick={() => navigate('/papers')}>
              查看更多 <ArrowRightOutlined />
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {papers.map(item => (
              <Col span={6} key={item.id}>
                <Card 
                  className="card-hover"
                  hoverable
                  onClick={() => navigate('/papers')}
                >
                  <Card.Meta 
                    title={item.title}
                    description={
                      <div>
                        <p>时长: {item.duration}分钟</p>
                        <p>总分: {item.total_score}分</p>
                        <p>及格分: {item.pass_score}分</p>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={2} className="section-title">论坛动态</Title>
            <Button type="link" onClick={() => navigate('/posts')}>
              查看更多 <ArrowRightOutlined />
            </Button>
          </div>
          <Row gutter={[16, 16]}>
            {posts.map(item => (
              <Col span={8} key={item.id}>
                <Card 
                  className="card-hover"
                  hoverable
                  onClick={() => navigate(`/posts/${item.id}`)}
                >
                  <Card.Meta 
                    title={item.title}
                    description={
                      <div>
                        <Paragraph ellipsis={{ rows: 2 }}>{item.content}</Paragraph>
                        <Space size="large">
                          <span>👁 {item.view_count}</span>
                          <span>👍 {item.like_count}</span>
                        </Space>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  )
}

export default Home
