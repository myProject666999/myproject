import React, { useEffect, useState } from 'react'
import { List, Card, Typography, Button, Modal, message, Empty, Pagination } from 'antd'
import { DeleteOutlined } from '@ant-design/icons'
import { getWrongQuestionList, removeWrongQuestion } from '../../utils/api'

const { Title } = Typography

const WrongQuestions = () => {
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadData(1)
  }, [])

  const loadData = async (currentPage) => {
    try {
      const res = await getWrongQuestionList({ page: currentPage, page_size: 10 })
      setList(res.data.list || [])
      setTotal(res.data.total || 0)
      setPage(currentPage)
    } catch (error) {
      console.error('Load data error:', error)
    }
  }

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要从错题本中删除该题目吗？',
      onOk: async () => {
        try {
          await removeWrongQuestion(id)
          message.success('删除成功')
          loadData(page)
        } catch (error) {
          console.error('Delete error:', error)
        }
      }
    })
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>错题本</Title>
      
      <Card>
        {list.length === 0 ? (
          <Empty description="暂无错题" />
        ) : (
          <>
            <List
              dataSource={list}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(item.id)}>删除</Button>
                  ]}
                >
                  <List.Item.Meta
                    title={`错题次数：${item.wrong_count}次`}
                    description={
                      <div>
                        <p><strong>题目ID：</strong>{item.question_id}</p>
                        <p><strong>试卷ID：</strong>{item.paper_id}</p>
                        <p><strong>添加时间：</strong>{item.created_at}</p>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Pagination 
                current={page} 
                total={total} 
                pageSize={10}
                onChange={loadData}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export default WrongQuestions
