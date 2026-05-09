import { useEffect, useState } from 'react'
import { Carousel, Card, Row, Col, Button, Typography } from 'antd'
import { RightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { publicApi } from '../../utils/api'

const { Title, Text } = Typography

function Home() {
  const navigate = useNavigate()
  const [homeData, setHomeData] = useState({ banners: [], services: [], knowledge: [], news: [] })

  useEffect(() => {
    loadHomeData()
  }, [])

  const loadHomeData = async () => {
    try {
      const data = await publicApi.getHome()
      setHomeData(data)
    } catch (error) {
      console.error(error)
    }
  }

  const bannerImages = [
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=university%20campus%20students%20studying%20academic%20planning%20consulting&image_size=landscape_16_9',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20education%20library%20learning%20center%20students%20bright&image_size=landscape_16_9',
    'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=career%20guidance%20counseling%20students%20future%20planning%20professional&image_size=landscape_16_9'
  ]

  return (
    <div>
      <div className="hero-banner">
        <div>
          <h1>学业规划咨询服务平台</h1>
          <p>为大学生提供专业的学业规划与职业发展指导</p>
          <Button type="primary" size="large" style={{ marginTop: 24 }} onClick={() => navigate('/services')}>
            立即预约咨询
          </Button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
        <div className="section-title">
          <h2>站内新闻</h2>
          <p className="subtitle">了解最新的学业规划资讯</p>
        </div>
        {homeData.news && homeData.news.length > 0 ? (
          <Row gutter={24}>
            {homeData.news.slice(0, 4).map(item => (
              <Col span={6} key={item.id}>
                <Card className="card-hover" hoverable>
                  <Card.Meta title={item.title} description={item.summary} />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Row gutter={24}>
            {[1, 2, 3, 4].map(i => (
              <Col span={6} key={i}>
                <Card className="card-hover" hoverable>
                  <Card.Meta 
                    title={`学业规划新闻标题 ${i}`} 
                    description="这里是新闻的简要描述内容，帮助学生了解最新的学业规划资讯和动态..."
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <div className="section-title" style={{ marginTop: 48 }}>
          <h2>热门服务</h2>
          <p className="subtitle">专业咨询，助力成长</p>
        </div>
        {homeData.services && homeData.services.length > 0 ? (
          <Row gutter={24}>
            {homeData.services.slice(0, 4).map(item => (
              <Col span={6} key={item.id}>
                <Card 
                  className="card-hover" 
                  hoverable
                  onClick={() => navigate(`/services/${item.id}`)}
                >
                  <Card.Meta 
                    title={item.title} 
                    description={
                      <div>
                        <p>{item.description}</p>
                        <p style={{ color: '#1890ff', marginTop: 8 }}>¥{item.price}</p>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Row gutter={24}>
            {[
              { title: '职业规划咨询', desc: '一对一职业规划指导，帮助你明确职业方向', price: 200 },
              { title: '学业选课指导', desc: '专业课程选择建议，优化你的学习计划', price: 150 },
              { title: '考研规划咨询', desc: '考研备考全流程指导，助你成功上岸', price: 300 },
              { title: '留学申请指导', desc: '出国留学申请规划，专业文书修改', price: 500 }
            ].map((item, i) => (
              <Col span={6} key={i}>
                <Card className="card-hover" hoverable>
                  <Card.Meta 
                    title={item.title} 
                    description={
                      <div>
                        <p>{item.desc}</p>
                        <p style={{ color: '#1890ff', marginTop: 8 }}>¥{item.price}</p>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <div className="section-title" style={{ marginTop: 48 }}>
          <h2>学业规划知识</h2>
          <p className="subtitle">丰富的知识库，助你成长</p>
        </div>
        {homeData.knowledge && homeData.knowledge.length > 0 ? (
          <Row gutter={24}>
            {homeData.knowledge.slice(0, 3).map(item => (
              <Col span={8} key={item.id}>
                <Card 
                  className="card-hover" 
                  hoverable
                  onClick={() => navigate(`/knowledge/${item.id}`)}
                >
                  <Card.Meta 
                    title={item.title} 
                    description={
                      <div>
                        <p style={{ color: '#666' }}>{item.summary}</p>
                        <p style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                          浏览: {item.views} 次
                        </p>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Row gutter={24}>
            {[
              { title: '大学生如何制定合理的学业计划', summary: '制定合理的学业计划是大学生成功的第一步...' },
              { title: '职业规划从大一开始', summary: '职业规划不是大四才要考虑的事情，应该从大一开始...' },
              { title: '考研还是就业？如何做出正确选择', summary: '面对考研和就业的选择，很多同学感到迷茫...' }
            ].map((item, i) => (
              <Col span={8} key={i}>
                <Card className="card-hover" hoverable>
                  <Card.Meta 
                    title={item.title} 
                    description={
                      <div>
                        <p style={{ color: '#666' }}>{item.summary}</p>
                        <p style={{ color: '#999', fontSize: 12, marginTop: 8 }}>浏览: {100 + i * 50} 次</p>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}

        <div className="section-title" style={{ marginTop: 48 }}>
          <h2>会员风采</h2>
          <p className="subtitle">优秀学长学姐的成长故事</p>
        </div>
        <Row gutter={24}>
          {[
            { name: '张同学', college: '计算机学院', desc: '成功进入知名互联网公司' },
            { name: '李同学', college: '经济学院', desc: '保研至顶尖学府' },
            { name: '王同学', college: '外语学院', desc: '成功申请海外名校' },
            { name: '赵同学', college: '机械学院', desc: '获得国家级奖学金' }
          ].map((item, i) => (
            <Col span={6} key={i}>
              <Card className="card-hover">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: 80, height: 80, 
                    borderRadius: '50%', 
                    background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                    margin: '0 auto 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold'
                  }}>
                    {item.name[0]}
                  </div>
                  <h3 style={{ margin: 0 }}>{item.name}</h3>
                  <p style={{ color: '#666', fontSize: 12 }}>{item.college}</p>
                  <p style={{ color: '#1890ff', marginTop: 8 }}>{item.desc}</p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  )
}

export default Home
