import { useEffect, useState } from 'react'
import { Card, Descriptions, Button, Space, Table, Popconfirm, message } from 'antd'
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { taskApi } from '../../api'

interface Task {
  id: number
  title: string
  description: string
  task_type: { id: number; name: string }
  publisher: { id: number; name: string }
  reward: number
  points: number
  location: string
  latitude: number
  longitude: number
  start_date: string
  end_date: string
  max_participants: number
  current_participants: number
  video_url: string
  thumbnail: string
  status: number
  audit_status: number
}

interface Comment {
  id: number
  content: string
  rating: number
  user: { username: string; nickname: string }
  created_at: string
}

const TaskDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState<Task | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentsTotal, setCommentsTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [commentPage, setCommentPage] = useState(1)

  useEffect(() => {
    if (id) {
      loadTaskDetail()
      loadComments()
    }
  }, [id, commentPage])

  const loadTaskDetail = async () => {
    try {
      setLoading(true)
      const res = await taskApi.getDetail(Number(id))
      setTask(res.data)
    } catch (error) {
      message.error('加载任务详情失败')
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      const res = await taskApi.getComments(Number(id), { page: commentPage, page_size: 10 })
      setComments(res.data?.list || [])
      setCommentsTotal(res.data?.total || 0)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    try {
      await taskApi.deleteComment(commentId)
      message.success('删除成功')
      loadComments()
    } catch (error) {
      console.error(error)
    }
  }

  const statusMap: Record<number, string> = { 0: '未发布', 1: '已发布' }
  const auditMap: Record<number, { text: string; color: string }> = {
    0: { text: '待审核', color: 'orange' },
    1: { text: '已通过', color: 'green' },
    2: { text: '已拒绝', color: 'red' }
  }

  const commentColumns = [
    {
      title: '用户',
      dataIndex: ['user', 'nickname'],
      key: 'user',
      render: (_: any, record: Comment) => record.user?.nickname || record.user?.username
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      render: (v: number) => `${v}星`
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content'
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Comment) => (
        <Popconfirm
          title="确定删除该评论吗？"
          onConfirm={() => handleDeleteComment(record.id)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      )
    }
  ]

  if (!task) return <div>加载中...</div>

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/tasks')}>
          返回列表
        </Button>
      </div>

      <Card title="任务详情" loading={loading}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="ID">{task.id}</Descriptions.Item>
          <Descriptions.Item label="标题">{task.title}</Descriptions.Item>
          <Descriptions.Item label="任务类型">{task.task_type?.name}</Descriptions.Item>
          <Descriptions.Item label="发布者">{task.publisher?.name}</Descriptions.Item>
          <Descriptions.Item label="奖励金额">¥{task.reward}</Descriptions.Item>
          <Descriptions.Item label="积分">{task.points}</Descriptions.Item>
          <Descriptions.Item label="任务地点">{task.location || '-'}</Descriptions.Item>
          <Descriptions.Item label="经纬度">
            {task.latitude && task.longitude ? `${task.latitude}, ${task.longitude}` : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="开始日期">{task.start_date || '-'}</Descriptions.Item>
          <Descriptions.Item label="结束日期">{task.end_date || '-'}</Descriptions.Item>
          <Descriptions.Item label="最大参与人数">{task.max_participants || '不限制'}</Descriptions.Item>
          <Descriptions.Item label="当前参与人数">{task.current_participants}</Descriptions.Item>
          <Descriptions.Item label="发布状态">{statusMap[task.status]}</Descriptions.Item>
          <Descriptions.Item label="审核状态" labelStyle={{ color: auditMap[task.audit_status]?.color }}>
            {auditMap[task.audit_status]?.text}
          </Descriptions.Item>
          <Descriptions.Item label="视频地址" span={2}>
            {task.video_url || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="缩略图" span={2}>
            {task.thumbnail ? (
              <img src={task.thumbnail} alt="缩略图" style={{ maxWidth: 200, maxHeight: 120 }} />
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="任务描述" span={2}>
            {task.description || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="评论列表" style={{ marginTop: 16 }}>
        <Table
          columns={commentColumns}
          dataSource={comments}
          rowKey="id"
          pagination={{
            current: commentPage,
            pageSize: 10,
            total: commentsTotal,
            onChange: setCommentPage
          }}
        />
      </Card>
    </div>
  )
}

export default TaskDetail
