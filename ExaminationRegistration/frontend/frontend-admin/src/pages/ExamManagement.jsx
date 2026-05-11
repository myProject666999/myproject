import React, { useState, useEffect } from 'react'
import { Table, Button, Tabs, Input, Tag, Select, Descriptions, Modal, message } from 'antd'
import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { getAdminExamPapers, getExamRecords, getWrongQuestions, getQuestionDetail } from '../utils/api'

const { Search } = Input

const ExamManagement = () => {
  const [activeTab, setActiveTab] = useState('papers')
  
  const [papers, setPapers] = useState([])
  const [papersLoading, setPapersLoading] = useState(false)
  const [papersPagination, setPapersPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [papersKeyword, setPapersKeyword] = useState('')

  const [records, setRecords] = useState([])
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [recordsPagination, setRecordsPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [recordsKeyword, setRecordsKeyword] = useState('')

  const [wrongs, setWrongs] = useState([])
  const [wrongsLoading, setWrongsLoading] = useState(false)
  const [wrongsPagination, setWrongsPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [wrongsKeyword, setWrongsKeyword] = useState('')

  const [detailModal, setDetailModal] = useState({ visible: false, data: null, type: '' })

  const fetchPapers = async (page = 1, pageSize = 10) => {
    setPapersLoading(true)
    try {
      const res = await getAdminExamPapers({ page, pageSize, keyword: papersKeyword })
      setPapers(res.data.items || [])
      setPapersPagination({ current: page, pageSize, total: res.data.total || 0 })
    } catch (error) {
      console.error(error)
    } finally {
      setPapersLoading(false)
    }
  }

  const fetchRecords = async (page = 1, pageSize = 10) => {
    setRecordsLoading(true)
    try {
      const res = await getExamRecords({ page, pageSize, keyword: recordsKeyword })
      setRecords(res.data.items || [])
      setRecordsPagination({ current: page, pageSize, total: res.data.total || 0 })
    } catch (error) {
      console.error(error)
    } finally {
      setRecordsLoading(false)
    }
  }

  const fetchWrongs = async (page = 1, pageSize = 10) => {
    setWrongsLoading(true)
    try {
      const res = await getWrongQuestions({ page, pageSize, keyword: wrongsKeyword })
      setWrongs(res.data.items || [])
      setWrongsPagination({ current: page, pageSize, total: res.data.total || 0 })
    } catch (error) {
      console.error(error)
    } finally {
      setWrongsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'papers') fetchPapers()
    if (activeTab === 'records') fetchRecords()
    if (activeTab === 'wrongs') fetchWrongs()
  }, [activeTab, papersKeyword, recordsKeyword, wrongsKeyword])

  const viewRecordDetail = (record) => {
    setDetailModal({ visible: true, data: record, type: 'record' })
  }

  const viewWrongDetail = async (questionId) => {
    try {
      const res = await getQuestionDetail(questionId)
      setDetailModal({ visible: true, data: res.data, type: 'question' })
    } catch (error) {
      console.error(error)
    }
  }

  const papersColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '试卷名称', dataIndex: 'name', key: 'name' },
    { title: '总分', dataIndex: 'total_score', key: 'total_score', width: 80 },
    { title: '时长(分钟)', dataIndex: 'duration', key: 'duration', width: 100 },
    { title: '题目数', dataIndex: 'question_count', key: 'question_count', width: 80 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      )
    }
  ]

  const recordsColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '用户', dataIndex: 'user_name', key: 'user_name', width: 120 },
    { title: '试卷', dataIndex: 'paper_name', key: 'paper_name' },
    { title: '得分', dataIndex: 'score', key: 'score', width: 80 },
    { title: '总分', dataIndex: 'total_score', key: 'total_score', width: 80 },
    {
      title: '是否通过',
      dataIndex: 'passed',
      key: 'passed',
      width: 100,
      render: (passed) => (
        <Tag color={passed ? 'green' : 'red'}>
          {passed ? '通过' : '未通过'}
        </Tag>
      )
    },
    { title: '用时(秒)', dataIndex: 'time_used', key: 'time_used', width: 100 },
    { title: '考试时间', dataIndex: 'created_at', key: 'created_at', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => viewRecordDetail(record)}
        >
          详情
        </Button>
      )
    }
  ]

  const wrongsColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '用户', dataIndex: 'user_name', key: 'user_name', width: 120 },
    { title: '试卷', dataIndex: 'paper_name', key: 'paper_name' },
    { title: '题目内容', dataIndex: 'question_content', key: 'question_content', ellipsis: true },
    { title: '用户答案', dataIndex: 'user_answer', key: 'user_answer', width: 120 },
    { title: '正确答案', dataIndex: 'correct_answer', key: 'correct_answer', width: 120 },
    { title: '错误时间', dataIndex: 'created_at', key: 'created_at', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => viewWrongDetail(record.question_id)}
        >
          题目详情
        </Button>
      )
    }
  ]

  const tabItems = [
    {
      key: 'papers',
      label: '试卷列表',
      children: (
        <div>
          <div className="table-toolbar">
            <Search
              placeholder="搜索试卷名称"
              style={{ width: 250 }}
              onSearch={setPapersKeyword}
              enterButton={<SearchOutlined />}
            />
          </div>
          <Table
            rowKey="id"
            columns={papersColumns}
            dataSource={papers}
            loading={papersLoading}
            pagination={{
              ...papersPagination,
              showSizeChanger: true,
              onChange: (page, pageSize) => fetchPapers(page, pageSize)
            }}
          />
        </div>
      )
    },
    {
      key: 'records',
      label: '考试记录',
      children: (
        <div>
          <div className="table-toolbar">
            <Search
              placeholder="搜索用户/试卷"
              style={{ width: 250 }}
              onSearch={setRecordsKeyword}
              enterButton={<SearchOutlined />}
            />
          </div>
          <Table
            rowKey="id"
            columns={recordsColumns}
            dataSource={records}
            loading={recordsLoading}
            pagination={{
              ...recordsPagination,
              showSizeChanger: true,
              onChange: (page, pageSize) => fetchRecords(page, pageSize)
            }}
          />
        </div>
      )
    },
    {
      key: 'wrongs',
      label: '错题本',
      children: (
        <div>
          <div className="table-toolbar">
            <Search
              placeholder="搜索题目内容"
              style={{ width: 250 }}
              onSearch={setWrongsKeyword}
              enterButton={<SearchOutlined />}
            />
          </div>
          <Table
            rowKey="id"
            columns={wrongsColumns}
            dataSource={wrongs}
            loading={wrongsLoading}
            pagination={{
              ...wrongsPagination,
              showSizeChanger: true,
              onChange: (page, pageSize) => fetchWrongs(page, pageSize)
            }}
          />
        </div>
      )
    }
  ]

  const questionTypeMap = {
    single: '单选题',
    multiple: '多选题',
    judge: '判断题',
    fill: '填空题',
    essay: '简答题'
  }

  return (
    <div>
      <h2 className="page-title">考试管理</h2>
      
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />

      <Modal
        title={detailModal.type === 'record' ? '考试记录详情' : '题目详情'}
        open={detailModal.visible}
        onCancel={() => setDetailModal({ visible: false, data: null, type: '' })}
        footer={null}
        width={700}
      >
        {detailModal.data && detailModal.type === 'record' && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="用户">{detailModal.data.user_name}</Descriptions.Item>
            <Descriptions.Item label="试卷">{detailModal.data.paper_name}</Descriptions.Item>
            <Descriptions.Item label="得分">{detailModal.data.score} / {detailModal.data.total_score}</Descriptions.Item>
            <Descriptions.Item label="是否通过">
              <Tag color={detailModal.data.passed ? 'green' : 'red'}>
                {detailModal.data.passed ? '通过' : '未通过'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="用时">{detailModal.data.time_used} 秒</Descriptions.Item>
            <Descriptions.Item label="考试时间">{detailModal.data.created_at}</Descriptions.Item>
          </Descriptions>
        )}
        {detailModal.data && detailModal.type === 'question' && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="题目类型">
              <Tag>{questionTypeMap[detailModal.data.type]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="所属试卷">{detailModal.data.paper_name}</Descriptions.Item>
            <Descriptions.Item label="题目内容">
              <div style={{ whiteSpace: 'pre-wrap' }}>{detailModal.data.content}</div>
            </Descriptions.Item>
            {detailModal.data.options && detailModal.data.options.length > 0 && (
              <Descriptions.Item label="选项">
                <div>
                  {detailModal.data.options.map((opt, idx) => (
                    <div key={idx}>{String.fromCharCode(65 + idx)}. {opt}</div>
                  ))}
                </div>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="正确答案">{detailModal.data.answer}</Descriptions.Item>
            {detailModal.data.analysis && (
              <Descriptions.Item label="解析">
                <div style={{ whiteSpace: 'pre-wrap' }}>{detailModal.data.analysis}</div>
              </Descriptions.Item>
            )}
            <Descriptions.Item label="分值">{detailModal.data.score} 分</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  )
}

export default ExamManagement
