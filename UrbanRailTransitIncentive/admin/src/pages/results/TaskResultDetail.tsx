import { useEffect, useState } from 'react'
import { Card, Descriptions, Button, Tag, Image, Space } from 'antd'
import { ArrowLeftOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { taskResultApi } from '../../api'

interface TaskResult {
  id: number
  task_assignment: {
    user: { username: string; nickname: string; phone: string; email: string }
    task: { title: string; location: string; reward: number; points: number }
  }
  description: string
  image_urls: string
  video_url: string
  latitude: number
  longitude: number
  status: number
  audit_remark: string
  created_at: string
}

const TaskResultDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState<TaskResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) {
      loadDetail()
    }
  }, [id])

  const loadDetail = async () => {
    try {
      setLoading(true)
      const res = await taskResultApi.getDetail(Number(id))
      setResult(res.data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (!result) return <div>加载中...</div>

  const statusMap: Record<number, { text: string; color: string }> = {
    0: { text: '待审核', color: 'orange' },
    1: { text: '已通过', color: 'green' },
    2: { text: '已拒绝', color: 'red' }
  }

  const images = result.image_urls ? result.image_urls.split(',').filter(Boolean) : []

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/results')}>
          返回列表
        </Button>
      </div>

      <Card title="完成结果详情" loading={loading}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="结果ID">{result.id}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusMap[result.status]?.color}>
              {statusMap[result.status]?.text}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="任务标题" span={2}>
            {result.task_assignment?.task?.title}
          </Descriptions.Item>
          <Descriptions.Item label="任务地点">
            {result.task_assignment?.task?.location}
          </Descriptions.Item>
          <Descriptions.Item label="奖励/积分">
            ¥{result.task_assignment?.task?.reward} / {result.task_assignment?.task?.points}分
          </Descriptions.Item>

          <Descriptions.Item label="用户昵称">
            {result.task_assignment?.user?.nickname || result.task_assignment?.user?.username}
          </Descriptions.Item>
          <Descriptions.Item label="用户名">
            {result.task_assignment?.user?.username}
          </Descriptions.Item>
          <Descriptions.Item label="手机号">
            {result.task_assignment?.user?.phone || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="邮箱">
            {result.task_assignment?.user?.email || '-'}
          </Descriptions.Item>

          <Descriptions.Item label="提交描述" span={2}>
            {result.description || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="经纬度">
            {result.latitude && result.longitude
              ? `${result.latitude.toFixed(6)}, ${result.longitude.toFixed(6)}`
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="提交时间">
            {result.created_at}
          </Descriptions.Item>
          <Descriptions.Item label="审核备注" span={2}>
            {result.audit_remark || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {images.length > 0 && (
        <Card title="提交图片" style={{ marginTop: 16 }}>
          <Image.PreviewGroup>
            <Space wrap>
              {images.map((img, idx) => (
                <Image
                  key={idx}
                  width={120}
                  height={80}
                  src={img}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
              ))}
            </Space>
          </Image.PreviewGroup>
        </Card>
      )}

      {result.video_url && (
        <Card title="提交视频" style={{ marginTop: 16 }}>
          <Space>
            <PlayCircleOutlined style={{ fontSize: 24 }} />
            <a href={result.video_url} target="_blank" rel="noreferrer">
              {result.video_url}
            </a>
          </Space>
        </Card>
      )}
    </div>
  )
}

export default TaskResultDetail
