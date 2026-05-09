import { useEffect, useState } from 'react'
import { Card, Button, message, Tag, Space } from 'antd'
import { ArrowLeftOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { publicApi } from '../../utils/api'

function KnowledgeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [knowledge, setKnowledge] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadKnowledge()
  }, [id])

  const loadKnowledge = async () => {
    setLoading(true)
    try {
      const data = await publicApi.getKnowledgeItem(id)
      setKnowledge(data)
    } catch (error) {
      message.error('加载失败')
    }
    setLoading(false)
  }

  if (!knowledge) return <div style={{ padding: 48, textAlign: 'center' }}>加载中...</div>

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/knowledge')}
        style={{ marginBottom: 16 }}
      >
        返回知识列表
      </Button>

      <Card className="knowledge-detail">
        <h1 style={{ marginBottom: 16 }}>{knowledge.title}</h1>
        <div style={{ display: 'flex', gap: 16, marginBottom: 24, color: '#666' }}>
          {knowledge.category && <Tag color="blue">{knowledge.category}</Tag>}
          {knowledge.author && <span>作者: {knowledge.author}</span>}
          <span><EyeOutlined /> {knowledge.views} 次浏览</span>
        </div>
        
        {knowledge.summary && (
          <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, marginBottom: 24 }}>
            <strong>摘要: </strong>{knowledge.summary}
          </div>
        )}

        <div className="content" style={{ whiteSpace: 'pre-wrap' }}>
          {knowledge.content || '暂无内容'}
        </div>

        {knowledge.attachment && (
          <div style={{ marginTop: 32, padding: 16, background: '#e6f7ff', borderRadius: 4 }}>
            <Space>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={() => window.open(publicApi.downloadKnowledge(id))}
              >
                下载附件
              </Button>
              <span style={{ color: '#666' }}>{knowledge.attachment_name || knowledge.attachment}</span>
            </Space>
          </div>
        )}
      </Card>
    </div>
  )
}

export default KnowledgeDetail
