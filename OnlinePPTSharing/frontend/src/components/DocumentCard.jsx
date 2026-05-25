import { Card, Avatar, Space, Tag, Button } from 'antd'
import {
  EyeOutlined,
  LikeOutlined,
  DownloadOutlined,
  StarFilled
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'

const DocumentCard = ({ document }) => {
  return (
    <Card
      hoverable
      className="card-hover"
      cover={
        <Link to={`/view/${document.id}`}>
          <div
            style={{
              height: 180,
              background: document.cover_image
                ? `url(${document.cover_image}) center/cover`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 48
            }}
          >
            {!document.cover_image && (document.title || 'PPT').charAt(0)}
          </div>
        </Link>
      }
      actions={[
        <Space key="view">
          <EyeOutlined />
          {document.view_count}
        </Space>,
        <Space key="like">
          <LikeOutlined />
          {document.like_count}
        </Space>,
        <Space key="download">
          <DownloadOutlined />
          {document.download_count}
        </Space>
      ]}
    >
      <Card.Meta
        title={
          <Link to={`/view/${document.id}`} style={{ color: '#333' }}>
            {document.title}
          </Link>
        }
        description={
          <div>
            <Space size="small" style={{ marginBottom: 8 }}>
              <Avatar
                size="small"
                src={document.user?.avatar}
                icon={!document.user?.avatar && '👤'}
              />
              <span style={{ fontSize: 12, color: '#666' }}>
                {document.user?.nickname || document.user?.username}
              </span>
            </Space>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {document.category && (
                <Tag color="blue" style={{ margin: 0 }}>
                  {document.category.icon} {document.category.name}
                </Tag>
              )}
              <Tag color="green" style={{ margin: 0 }}>
                {document.total_slides} 页
              </Tag>
            </div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
              {dayjs(document.created_at).format('YYYY-MM-DD')}
            </div>
          </div>
        }
      />
    </Card>
  )
}

export default DocumentCard
