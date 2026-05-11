import React, { useEffect, useState } from 'react'
import { List, Card, Typography, Button, Modal, message, Empty } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { getFavoriteList, removeFavorite } from '../../utils/api'

const { Title } = Typography

const Favorites = () => {
  const [list, setList] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await getFavoriteList({})
      setList(res.data || [])
    } catch (error) {
      console.error('Load data error:', error)
    }
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认取消收藏',
      content: '确定要取消收藏吗？',
      onOk: async () => {
        try {
          await removeFavorite(id)
          message.success('取消收藏成功')
          loadData()
        } catch (error) {
          console.error('Delete error:', error)
        }
      }
    })
  }

  const getTypeLabel = (type) => {
    const typeMap = {
      intro: '学校简介',
      project: '报名项目',
      paper: '试卷'
    }
    return typeMap[type] || type
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>我的收藏</Title>
      
      <Card>
        {list.length === 0 ? (
          <Empty description="暂无收藏" />
        ) : (
          <List
            dataSource={list}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)}>取消收藏</Button>
                ]}
              >
                <List.Item.Meta
                  title={`收藏类型：${getTypeLabel(item.target_type)}`}
                  description={
                    <div>
                      <p><strong>目标ID：</strong>{item.target_id}</p>
                      <p><strong>收藏时间：</strong>{item.created_at}</p>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}

export default Favorites
