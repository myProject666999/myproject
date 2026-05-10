import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  NavBar, Button, Tag, Popup, ActionSheet, showConfirmDialog, showToast,
  Cell, CellGroup, Field, Form, Image as VanImage, List, Empty
} from 'vant'
import { ShareO, StarO, Star, ClockO, LocationO, UserO, VideoO, Image as ImageIcon } from '@vant/icons'
import { taskApi } from '../api'

interface Task {
  id: number
  title: string
  description: string
  thumbnail: string
  video_url: string
  reward: number
  points: number
  location: string
  latitude: number
  longitude: number
  start_date: string
  end_date: string
  task_type: { name: string }
  publisher: { name: string }
  max_participants: number
  current_participants: number
}

interface Comment {
  id: number
  content: string
  rating: number
  user: { nickname: string; username: string }
  created_at: string
}

const TaskDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [showAction, setShowAction] = useState(false)
  const [showCommentPopup, setShowCommentPopup] = useState(false)
  const [commentForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [commentPage, setCommentPage] = useState(1)
  const [commentFinished, setCommentFinished] = useState(false)

  useEffect(() => {
    if (id) {
      loadTaskDetail()
      loadComments()
    }
  }, [id])

  const loadTaskDetail = async () => {
    try {
      setLoading(true)
      const res = await taskApi.getDetail(Number(id))
      setTask(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      const res = await taskApi.getComments(Number(id), { page: commentPage, page_size: 10 })
      const list = res.data?.list || []
      setComments(prev => commentPage === 1 ? list : [...prev, ...list])
      setCommentFinished(list.length < 10)
    } catch (error) {
      console.error(error)
    }
  }

  const handleAccept = async () => {
    try {
      const token = localStorage.getItem('user_token')
      if (!token) {
        navigate('/login')
        return
      }
      await showConfirmDialog({
        title: '确认接取',
        message: '确认要接取这个任务吗？'
      })
      await taskApi.accept(Number(id))
      showToast('接取成功')
      navigate('/my/assignments')
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error(error)
      }
    }
  }

  const handleFavorite = async () => {
    const token = localStorage.getItem('user_token')
    if (!token) {
      navigate('/login')
      return
    }
    try {
      const res = await taskApi.toggleFavorite(Number(id))
      setIsFavorite(res.data?.is_favorite || false)
      showToast(isFavorite ? '已取消收藏' : '收藏成功')
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmitComment = async () => {
    try {
      const values = await commentForm.validateFields()
      await taskApi.addComment(Number(id), values)
      showToast('评论成功')
      setShowCommentPopup(false)
      commentForm.resetFields()
      setCommentPage(1)
      setCommentFinished(false)
      loadComments()
    } catch (error) {
      console.error(error)
    }
  }

  const handleNavigate = () => {
    if (task?.latitude && task?.longitude) {
      window.location.href = `https://uri.amap.com/marker?position=${task.longitude},${task.latitude}&name=${encodeURIComponent(task.location || '任务地点')}&src=urbanrail`
    } else {
      showToast('暂无位置信息')
    }
  }

  if (!task) return <div style={{ padding: 20, textAlign: 'center' }}>加载中...</div>

  return (
    <div style={{ paddingBottom: 60 }}>
      <NavBar title="任务详情" leftText="返回" onClickLeft={() => navigate(-1)} />

      <div className="detail-header">
        <img
          className="detail-header__thumb"
          src={task.thumbnail || 'https://picsum.photos/800/400?random=' + task.id}
          alt={task.title}
        />
        <div className="detail-header__title">
          <div className="detail-header__title-text">{task.title}</div>
          <div className="detail-header__reward">
            ¥{task.reward}
            <span style={{ fontSize: 14, marginLeft: 8 }}>+{task.points}积分</span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__item">
          <span className="detail-section__label"><UserO /> 任务类型</span>
          <span className="detail-section__value">{task.task_type?.name}</span>
        </div>
        <div className="detail-section__item">
          <span className="detail-section__label"><LocationO /> 任务地点</span>
          <span className="detail-section__value">{task.location || '待发布'}</span>
        </div>
        <div className="detail-section__item">
          <span className="detail-section__label"><ClockO /> 开始日期</span>
          <span className="detail-section__value">{task.start_date || '-'}</span>
        </div>
        <div className="detail-section__item">
          <span className="detail-section__label"><ClockO /> 结束日期</span>
          <span className="detail-section__value">{task.end_date || '-'}</span>
        </div>
        <div className="detail-section__item">
          <span className="detail-section__label">参与人数</span>
          <span className="detail-section__value">
            {task.current_participants} / {task.max_participants || '不限'}
          </span>
        </div>
        <div className="detail-section__item">
          <span className="detail-section__label">发布者</span>
          <span className="detail-section__value">{task.publisher?.name}</span>
        </div>
      </div>

      {task.video_url && (
        <div className="detail-section">
          <div className="detail-section__title">任务视频</div>
          <div className="video-container">
            <video src={task.video_url} controls />
          </div>
        </div>
      )}

      <div className="detail-section">
        <div className="detail-section__title">任务描述</div>
        <div className="detail-section__desc">
          {task.description || '暂无描述'}
        </div>
      </div>

      {(task.latitude || task.longitude) && (
        <div className="detail-section">
          <div className="detail-section__title">地图位置</div>
          <div className="map-container" onClick={handleNavigate} style={{ cursor: 'pointer' }}>
            <div>
              <LocationO style={{ fontSize: 32, marginBottom: 8 }} />
              <div>点击查看地图导航</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                经纬度: {task.latitude?.toFixed(4)}, {task.longitude?.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="detail-section">
        <div className="detail-section__title">用户评论</div>
        {comments.length === 0 ? (
          <Empty description="暂无评论" />
        ) : (
          comments.map(comment => (
            <div key={comment.id} style={{ padding: '12px 0', borderBottom: '1px solid #ebedf0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 500 }}>
                  {comment.user?.nickname || comment.user?.username}
                </span>
                <span style={{ color: '#969799', fontSize: 12 }}>{comment.created_at}</span>
              </div>
              <div style={{ color: '#646566' }}>{comment.content}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#ff976a' }}>
                {comment.rating}星
              </div>
            </div>
          ))
        )}
        {!commentFinished && (
          <div
            style={{ textAlign: 'center', padding: 16, color: '#969799' }}
            onClick={() => { setCommentPage(p => p + 1); loadComments() }}
          >
            加载更多
          </div>
        )}
      </div>

      <div className="fixed-bottom" style={{
        display: 'flex',
        background: '#fff',
        padding: '10px 16px',
        gap: 12,
        borderTop: '1px solid #ebedf0'
      }}>
        <Button plain type="primary" icon={<Star isActive={isFavorite} />} onClick={handleFavorite}>
          {isFavorite ? '已收藏' : '收藏'}
        </Button>
        <Button plain type="primary" icon={<ShareO />} onClick={() => setShowAction(true)}>
          分享
        </Button>
        <Button type="primary" block onClick={handleAccept}>
          接取任务
        </Button>
      </div>

      <ActionSheet
        v-model:show={showAction}
        cancelText="取消"
        actions={[
          { name: '微信好友' },
          { name: '朋友圈' },
          { name: '复制链接' }
        ]}
      />

      <Popup
        v-model:show={showCommentPopup}
        position="bottom"
        round
        style={{ height: '60%' }}
      >
        <div style={{ padding: 16 }}>
          <h3 style={{ marginBottom: 16 }}>发表评论</h3>
          <Form form={commentForm} onFinish={handleSubmitComment}>
            <Field
              name="content"
              type="textarea"
              rows={4}
              placeholder="请输入评论内容"
              rules={[{ required: true, message: '请输入评论内容' }]}
            />
            <Field
              name="rating"
              label="评分"
              placeholder="请选择评分"
              rules={[{ required: true, message: '请选择评分' }]}
            >
              <select style={{ width: '100%', border: 'none', fontSize: 14 }}>
                <option value="5">5星</option>
                <option value="4">4星</option>
                <option value="3">3星</option>
                <option value="2">2星</option>
                <option value="1">1星</option>
              </select>
            </Field>
            <Button type="primary" block nativeType="submit" style={{ marginTop: 16 }}>
              提交
            </Button>
          </Form>
        </div>
      </Popup>
    </div>
  )
}

export default TaskDetailPage
