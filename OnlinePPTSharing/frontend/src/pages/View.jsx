import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Row,
  Col,
  Typography,
  Avatar,
  Button,
  Space,
  Tag,
  Spin,
  message,
  Tooltip,
  Input,
  List,
  Empty,
  Modal,
  Result
} from 'antd'
import {
  LikeOutlined,
  LikeFilled,
  StarOutlined,
  StarFilled,
  DownloadOutlined,
  ShareAltOutlined,
  LeftOutlined,
  RightOutlined,
  FullscreenOutlined,
  SendOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { documentApi } from '../api/document'
import dayjs from 'dayjs'

const { Title, Paragraph } = Typography
const { TextArea } = Input

const View = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState(null)
  const [slides, setSlides] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const slideContainerRef = useRef(null)

  const user = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    fetchDocument()
    fetchComments()
  }, [id])

  const fetchDocument = async () => {
    setLoading(true)
    try {
      const res = await documentApi.getDetail(id)
      setDoc(res.data.document)
      setSlides(res.data.slides || [])
    } catch (error) {
      message.error('获取文档失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await documentApi.getComments(id)
      setComments(res.data.list || [])
    } catch (error) {
      console.error('获取评论失败:', error)
    }
  }

  const handleLike = async () => {
    if (!user) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    try {
      await documentApi.like(id)
      setDoc({
        ...doc,
        is_liked: !doc.is_liked,
        like_count: doc.is_liked
          ? doc.like_count - 1
          : doc.like_count + 1
      })
      message.success(doc.is_liked ? '已取消点赞' : '点赞成功')
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleFavorite = async () => {
    if (!user) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    try {
      await documentApi.favorite(id)
      setDoc({
        ...doc,
        is_favorited: !doc.is_favorited
      })
      message.success(doc.is_favorited ? '已取消收藏' : '收藏成功')
    } catch (error) {
      message.error('操作失败')
    }
  }

  const handleDownload = () => {
    if (!doc?.allow_download) {
      message.warning('此文档不允许下载')
      return
    }
    documentApi.download(id)
  }

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/view/${id}`
      await navigator.clipboard.writeText(shareUrl)
      message.success('分享链接已复制到剪贴板')
      await documentApi.share(id)
    } catch (error) {
      Modal.info({
        title: '分享链接',
        content: (
          <Input
            value={`${window.location.origin}/view/${id}`}
            readOnly
            onFocus={(e) => e.target.select()}
          />
        )
      })
    }
  }

  const handleComment = async () => {
    if (!user) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    if (!commentText.trim()) {
      message.warning('请输入评论内容')
      return
    }
    try {
      await documentApi.addComment(id, { content: commentText })
      setCommentText('')
      fetchComments()
      message.success('评论成功')
    } catch (error) {
      message.error('评论失败')
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < slides.length) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      handlePrevPage()
    } else if (e.key === 'ArrowRight') {
      handleNextPage()
    } else if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  const currentSlide = slides.find((s) => s.page_number === currentPage)

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!doc) {
    return <Empty description="文档不存在" style={{ marginTop: 100 }} />
  }

  if (doc.status === 0) {
    return (
      <div className="container page-container">
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Spin size="large" tip="文档正在转换中，请稍候..." style={{ marginBottom: 20 }} />
          <Title level={4}>文档转换中</Title>
          <Paragraph type="secondary">
            您的文档正在转换为可在线浏览的格式，此过程可能需要几分钟时间。
          </Paragraph>
          <Paragraph type="secondary">
            转换完成后，页面会自动更新。您可以刷新页面或稍后再来查看。
          </Paragraph>
        </Card>
      </div>
    )
  }

  if (doc.status === 2) {
    return (
      <div className="container page-container">
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Result
            status="error"
            title="文档转换失败"
            subTitle="很抱歉，文档转换过程中出现了错误，请尝试重新上传或联系管理员。"
            extra={[
              <Button type="primary" key="back" onClick={() => navigate('/')}>
                返回首页
              </Button>,
              <Button key="retry" onClick={() => navigate('/upload')}>
                重新上传
              </Button>
            ]}
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="container page-container">
      {isFullscreen ? (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#000',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setIsFullscreen(false)}
        >
          {currentSlide && (
            doc.file_type === 'pdf' ? (
              <iframe
                src={currentSlide.image_url}
                style={{ width: '90%', height: '90%', border: 'none' }}
              />
            ) : (
              <img
                src={currentSlide.image_url}
                alt={`Slide ${currentPage}`}
                style={{ maxWidth: '90%', maxHeight: '90%' }}
              />
            )
          )}
          <div
            style={{
              position: 'absolute',
              bottom: 30,
              color: '#fff',
              fontSize: 18
            }}
          >
            {currentPage} / {slides.length}
          </div>
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <div
              ref={slideContainerRef}
              className="slide-container"
              style={{
                background: '#fff',
                borderRadius: 8,
                overflow: 'hidden',
                marginBottom: 16,
                minHeight: 500
              }}
            >
              {currentSlide ? (
                doc.file_type === 'pdf' ? (
                  <iframe
                    src={currentSlide.image_url}
                    style={{ width: '100%', height: '500px', border: 'none' }}
                  />
                ) : (
                  <img
                    src={currentSlide.image_url}
                    alt={`Slide ${currentPage}`}
                    className="slide-image"
                    style={{ width: '100%' }}
                  />
                )
              ) : (
                <div
                  style={{
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f5f5f5'
                  }}
                >
                  暂无幻灯片
                </div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 16,
                marginBottom: 24
              }}
            >
              <Tooltip title="上一页">
                <Button
                  icon={<LeftOutlined />}
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                />
              </Tooltip>
              <span style={{ fontSize: 16 }}>
                {currentPage} / {slides.length}
              </span>
              <Tooltip title="下一页">
                <Button
                  icon={<RightOutlined />}
                  onClick={handleNextPage}
                  disabled={currentPage >= slides.length}
                />
              </Tooltip>
              <Tooltip title="全屏">
                <Button
                  icon={<FullscreenOutlined />}
                  onClick={() => setIsFullscreen(true)}
                />
              </Tooltip>
            </div>

            {slides.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  padding: 16,
                  background: '#fff',
                  borderRadius: 8
                }}
              >
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    onClick={() => setCurrentPage(slide.page_number)}
                    style={{
                      flex: '0 0 auto',
                      width: 100,
                      cursor: 'pointer',
                      border:
                        currentPage === slide.page_number
                          ? '2px solid #1890ff'
                          : '2px solid transparent',
                      borderRadius: 4,
                      overflow: 'hidden'
                    }}
                  >
                    {doc.file_type === 'pdf' ? (
                      <div
                        style={{
                          height: 75,
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 24
                        }}
                      >
                        📄
                      </div>
                    ) : (
                      <img
                        src={slide.image_url}
                        alt={`Thumbnail ${index + 1}`}
                        style={{ width: '100%', display: 'block' }}
                      />
                    )}
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: 12,
                        padding: 4,
                        background: '#f5f5f5'
                      }}
                    >
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 24 }}>
              <Title level={4}>评论 ({comments.length})</Title>
              {user ? (
                <div style={{ marginBottom: 16 }}>
                  <TextArea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="写下你的评论..."
                    rows={3}
                    maxLength={500}
                    showCount
                  />
                  <div style={{ textAlign: 'right', marginTop: 8 }}>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={handleComment}
                    >
                      发送评论
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: 'center',
                    padding: 24,
                    background: '#f5f5f5',
                    borderRadius: 8,
                    marginBottom: 16
                  }}
                >
                  请先登录后再评论{' '}
                  <Button type="link" onClick={() => navigate('/login')}>
                    去登录
                  </Button>
                </div>
              )}

              <List
                dataSource={comments}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={item.user?.avatar}
                          icon={!item.user?.avatar && '👤'}
                        />
                      }
                      title={
                        <Space>
                          <span>{item.user?.nickname || item.user?.username}</span>
                          <span style={{ color: '#999', fontSize: 12 }}>
                            {dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}
                          </span>
                        </Space>
                      }
                      description={item.content}
                    />
                  </List.Item>
                )}
              />
              {comments.length === 0 && (
                <Empty description="暂无评论" style={{ marginTop: 40 }} />
              )}
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 16 }}>
              <Title level={4} style={{ marginBottom: 16 }}>
                {doc.title}
              </Title>

              <div style={{ marginBottom: 16 }}>
                <Space>
                  <Avatar
                    src={doc.user?.avatar}
                    icon={!doc.user?.avatar && '👤'}
                  />
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {doc.user?.nickname || doc.user?.username}
                    </div>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      {dayjs(doc.created_at).format('YYYY-MM-DD')}
                    </div>
                  </div>
                </Space>
              </div>

              {doc.description && (
                <Paragraph style={{ marginBottom: 16 }}>
                  {doc.description}
                </Paragraph>
              )}

              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {doc.category && (
                  <Tag color="blue">
                    {doc.category.icon} {doc.category.name}
                  </Tag>
                )}
                <Tag color="green">{doc.total_slides} 页</Tag>
                <Tag color="purple">
                  <EyeOutlined /> {doc.view_count} 浏览
                </Tag>
              </div>

              {doc.tags && doc.tags.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  {doc.tags.split(',').map((tag, index) => (
                    <Tag key={index} style={{ marginBottom: 4 }}>
                      #{tag}
                    </Tag>
                  ))}
                </div>
              )}

              <Space wrap style={{ marginBottom: 16 }}>
                <Button
                  type={doc.is_liked ? 'primary' : 'default'}
                  icon={doc.is_liked ? <LikeFilled /> : <LikeOutlined />}
                  onClick={handleLike}
                >
                  {doc.like_count} 点赞
                </Button>
                <Button
                  type={doc.is_favorited ? 'primary' : 'default'}
                  icon={doc.is_favorited ? <StarFilled /> : <StarOutlined />}
                  onClick={handleFavorite}
                >
                  收藏
                </Button>
                {doc.allow_download && (
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleDownload}
                  >
                    {doc.download_count} 下载
                  </Button>
                )}
                <Button icon={<ShareAltOutlined />} onClick={handleShare}>
                  分享
                </Button>
              </Space>
            </div>
          </Col>
        </Row>
      )}
    </div>
  )
}

export default View
