import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Typography, Spin } from 'antd'
import { discussionApi } from '../services/api'
import WebLayout from '../components/Layout'

const { Title, Paragraph, Text } = Typography

function DiscussionDetail() {
  const { id } = useParams()
  const [discussion, setDiscussion] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await discussionApi.get(id)
      setDiscussion(res.data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <WebLayout><div style={{ padding: 100, textAlign: 'center' }}>加载中...</div></WebLayout>
  if (!discussion) return <WebLayout><div style={{ padding: 100, textAlign: 'center' }}>帖子不存在</div></WebLayout>

  return (
    <WebLayout>
      <Card>
        <Title level={2}>{discussion.title}</Title>
        <div style={{ marginBottom: 24 }}>
          <Text type="secondary">
            作者：{discussion.user?.nickname || discussion.user?.username}
            <span style={{ marginLeft: 16 }}>关联：{discussion.script?.title || '综合讨论'}</span>
            <span style={{ marginLeft: 16 }}>浏览 {discussion.views}</span>
            <span style={{ marginLeft: 16 }}>
              发布于 {new Date(discussion.created_at).toLocaleString()}
            </span>
          </Text>
        </div>
        <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: 16, lineHeight: 1.8 }}>
          {discussion.content}
        </Paragraph>
      </Card>
    </WebLayout>
  )
}

export default DiscussionDetail
