import React, { useEffect, useState } from 'react'
import { Table, Card, Typography, Tag, Button, Modal, Empty } from 'antd'
import { getExamRecordList, getExamRecordDetail } from '../../utils/api'

const { Title } = Typography

const ExamRecords = () => {
  const [list, setList] = useState([])
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [recordDetail, setRecordDetail] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await getExamRecordList()
      setList(res.data || [])
    } catch (error) {
      console.error('Load data error:', error)
    }
  }

  const handleViewDetail = async (id) => {
    try {
      const res = await getExamRecordDetail(id)
      setRecordDetail(res.data)
      setDetailModalVisible(true)
    } catch (error) {
      console.error('Load detail error:', error)
    }
  }

  const columns = [
    {
      title: '试卷名称',
      dataIndex: 'paper_title',
      key: 'paper_title',
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      render: (score, record) => (
        <span>
          <strong style={{ color: record.is_pass === 1 ? '#52c41a' : '#ff4d4f' }}>{score}</strong>
          <span style={{ color: '#999' }}>/{record.total_score}</span>
        </span>
      )
    },
    {
      title: '是否通过',
      dataIndex: 'is_pass',
      key: 'is_pass',
      render: (isPass) => (
        <Tag color={isPass === 1 ? 'green' : 'red'}>
          {isPass === 1 ? '通过' : '未通过'}
        </Tag>
      )
    },
    {
      title: '用时',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${Math.floor(duration / 60)}分${duration % 60}秒`
    },
    {
      title: '考试时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewDetail(record.id)}>查看详情</Button>
      )
    }
  ]

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>考试记录</Title>
      
      <Card>
        {list.length === 0 ? (
          <Empty description="暂无考试记录" />
        ) : (
          <Table 
            columns={columns} 
            dataSource={list.map(item => ({ ...item, key: item.id }))}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>

      <Modal
        title="考试详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={700}
      >
        {recordDetail && (
          <div>
            <p><strong>试卷名称：</strong>{recordDetail.record?.paper_title}</p>
            <p><strong>得分：</strong>
              <span style={{ color: recordDetail.record?.is_pass === 1 ? '#52c41a' : '#ff4d4f', fontWeight: 'bold', fontSize: 24 }}>
                {recordDetail.record?.score}
              </span>
              <span style={{ color: '#999' }}>/{recordDetail.record?.total_score}</span>
            </p>
            <p><strong>是否通过：</strong>
              <Tag color={recordDetail.record?.is_pass === 1 ? 'green' : 'red'}>
                {recordDetail.record?.is_pass === 1 ? '通过' : '未通过'}
              </Tag>
            </p>
            <p><strong>考试时间：</strong>{recordDetail.record?.created_at}</p>
            
            <h4 style={{ marginTop: 16 }}>答题详情：</h4>
            {recordDetail.answers?.map((item, index) => (
              <div key={item.id} style={{ padding: 12, borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
                <p><strong>第{index + 1}题：</strong>{item.is_correct === 1 ? '✅ 正确' : '❌ 错误'}</p>
                <p>你的答案：{item.user_answer || '未作答'}</p>
                <p>正确答案：{item.correct_answer}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ExamRecords
