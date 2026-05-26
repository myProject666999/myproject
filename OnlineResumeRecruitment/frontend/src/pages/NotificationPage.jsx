import React, { useState, useEffect, useCallback } from 'react'
import {
  List, Badge, Empty, Tag, Button, Space, Card, Typography, Divider,
  Row, Col, Affix
} from 'antd'
import {
  BellOutlined, ReadOutlined, CheckSquareOutlined,
  MailOutlined, ExclamationCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { notificationApi } from '../api'

const { Title, Text, Paragraph } = Typography

const typeConfig = {
  SYSTEM: { color: 'blue', icon: <BellOutlined />, label: '系统通知' },
  APPLICATION: { color: 'green', icon: <MailOutlined />, label: '投递通知' },
  INTERVIEW: { color: 'orange', icon: <ExclamationCircleOutlined />, label: '面试通知' },
  MESSAGE: { color: 'purple', icon: <BellOutlined />, label: '聊天消息' }
}

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await notificationApi.getNotifications({ pageNum: 1, pageSize: 50 })
      setNotifications(data.records || data || [])
      const count = await notificationApi.getUnreadCount()
      setUnreadCount(count)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleSelect = async (item) => {
    setSelectedId(item.id)
    if (!item.isRead) {
      try {
        await notificationApi.markAsRead(item.id)
        setNotifications(prev =>
          prev.map(n => n.id === item.id ? { ...n, isRead: 1, readAt: new Date() } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch (e) { console.error(e) }
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: 1 })))
      setUnreadCount(0)
    } catch (e) { console.error(e) }
  }

  const selectedNotification = notifications.find(n => n.id === selectedId)

  return (
    <div style={{ padding: '24px', background: '#fff', minHeight: 'calc(100vh - 180px)' }}>
      <Card
        title={
          <Space>
            <BellOutlined style={{ fontSize: 20, color: '#1890ff' }} />
            <span style={{ fontSize: 18 }}>消息通知</span>
            <Badge count={unreadCount} style={{ backgroundColor: '#ff4d4f' }} />
          </Space>
        }
        extra={
          unreadCount > 0 && (
            <Button type="primary" icon={<CheckSquareOutlined />} onClick={handleMarkAllRead}>
              全部标为已读
            </Button>
          )
        }
        bodyStyle={{ padding: 0 }}
      >
        <Row gutter={0} style={{ minHeight: 500 }}>
          <Col span={10} style={{ borderRight: '1px solid #f0f0f0' }}>
            <List
              loading={loading}
              dataSource={notifications}
              locale={{ emptyText: <Empty description="暂无通知" /> }}
              renderItem={(item) => {
                const cfg = typeConfig[item.type] || typeConfig.SYSTEM
                return (
                  <List.Item
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    style={{
                      cursor: 'pointer',
                      padding: '12px 16px',
                      background: selectedId === item.id ? '#e6f7ff' : (!item.isRead ? '#fafafa' : '#fff'),
                      borderLeft: selectedId === item.id ? '3px solid #1890ff' : (!item.isRead ? '3px solid #1890ff' : '3px solid transparent')
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge dot={!item.isRead} color="#1890ff" offset={[-2, 2]}>
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%',
                            background: `${cfg.color}20`, color: cfg.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18
                          }}>
                            {cfg.icon}
                          </div>
                        </Badge>
                      }
                      title={
                        <Space>
                          <Text strong={!item.isRead} style={{ fontSize: 14 }}>{item.title}</Text>
                          <Tag color={cfg.color} style={{ fontSize: 11 }}>{cfg.label}</Tag>
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={2}>
                          <Text type="secondary" ellipsis style={{ fontSize: 12, maxWidth: 280 }}>
                            {item.content}
                          </Text>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {dayjs(item.createdAt).format('MM-DD HH:mm')}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )
              }}
              style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}
            />
          </Col>
          <Col span={14}>
            {selectedNotification ? (
              <div style={{ padding: 24 }}>
                <Affix offsetTop={0}>
                  <Space align="center" style={{ marginBottom: 16 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: `${typeConfig[selectedNotification.type]?.color || 'blue'}20`,
                      color: typeConfig[selectedNotification.type]?.color || 'blue',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20
                    }}>
                      {typeConfig[selectedNotification.type]?.icon || <BellOutlined />}
                    </div>
                    <div>
                      <Title level={4} style={{ margin: 0 }}>{selectedNotification.title}</Title>
                      <Space size={8}>
                        <Tag color={typeConfig[selectedNotification.type]?.color}>
                          {typeConfig[selectedNotification.type]?.label || '通知'}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {dayjs(selectedNotification.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                        </Text>
                        {!selectedNotification.isRead && (
                          <Badge status="processing" text="未读" />
                        )}
                      </Space>
                    </div>
                  </Space>
                </Affix>
                <Divider style={{ margin: '16px 0' }} />
                <Paragraph style={{ fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                  {selectedNotification.content}
                </Paragraph>
                {selectedNotification.relatedId && (
                  <div style={{ marginTop: 24 }}>
                    <Divider />
                    <Text type="secondary">
                      关联ID: {selectedNotification.relatedType} - {selectedNotification.relatedId}
                    </Text>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100%', minHeight: 400
              }}>
                <Empty
                  image={<BellOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
                  description={<Text type="secondary">请选择一条通知查看详情</Text>}
                />
              </div>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default NotificationPage
