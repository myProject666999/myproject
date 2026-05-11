import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Input, Modal, Form, message, Popconfirm, Select, InputNumber, Tag, Divider } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { getQuestions, getExamPapers, createQuestion, updateQuestion, deleteQuestion } from '../utils/api'

const { Search } = Input
const { TextArea } = Input

const QuestionManagement = () => {
  const [data, setData] = useState([])
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [keyword, setKeyword] = useState('')
  const [paperId, setPaperId] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const res = await getQuestions({ page, pageSize, keyword, paper_id: paperId })
      setData(res.data.items || [])
      setPagination({
        current: page,
        pageSize,
        total: res.data.total || 0
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPapers = async () => {
    try {
      const res = await getExamPapers({ page: 1, pageSize: 100 })
      setPapers(res.data.items || [])
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchData()
    fetchPapers()
  }, [keyword, paperId])

  const questionTypeMap = {
    single: '单选题',
    multiple: '多选题',
    judge: '判断题',
    fill: '填空题',
    essay: '简答题'
  }

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingItem(record)
    const options = record.options ? record.options : []
    form.setFieldsValue({
      ...record,
      optionA: options[0],
      optionB: options[1],
      optionC: options[2],
      optionD: options[3]
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const questionData = {
        paper_id: values.paper_id,
        type: values.type,
        content: values.content,
        options: [],
        answer: values.answer,
        analysis: values.analysis,
        score: values.score
      }
      
      if (['single', 'multiple'].includes(values.type)) {
        questionData.options = [
          values.optionA,
          values.optionB,
          values.optionC,
          values.optionD
        ]
      }

      if (editingItem) {
        await updateQuestion(editingItem.id, questionData)
        message.success('更新成功')
      } else {
        await createQuestion(questionData)
        message.success('添加成功')
      }
      setModalVisible(false)
      fetchData(pagination.current)
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteQuestion(id)
      message.success('删除成功')
      fetchData(pagination.current)
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '所属试卷', dataIndex: 'paper_name', key: 'paper_name' },
    {
      title: '题目类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => <Tag>{questionTypeMap[type]}</Tag>
    },
    { title: '题目内容', dataIndex: 'content', key: 'content', ellipsis: true },
    { title: '分值', dataIndex: 'score', key: 'score', width: 70 },
    { title: '正确答案', dataIndex: 'answer', key: 'answer', width: 100 },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  return (
    <div>
      <h2 className="page-title">试题管理</h2>
      
      <div className="table-toolbar">
        <Search
          placeholder="搜索题目内容"
          style={{ width: 250 }}
          onSearch={setKeyword}
          enterButton={<SearchOutlined />}
        />
        <Select
          placeholder="选择试卷"
          style={{ width: 200 }}
          allowClear
          onChange={setPaperId}
          options={papers.map(p => ({ value: p.id, label: p.name }))}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加试题
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          onChange: (page, pageSize) => fetchData(page, pageSize)
        }}
      />

      <Modal
        title={editingItem ? '编辑试题' : '添加试题'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="所属试卷"
            name="paper_id"
            rules={[{ required: true, message: '请选择试卷' }]}
          >
            <Select placeholder="请选择试卷">
              {papers.map(p => (
                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="题目类型"
            name="type"
            rules={[{ required: true, message: '请选择题目类型' }]}
            initialValue="single"
          >
            <Select>
              <Select.Option value="single">单选题</Select.Option>
              <Select.Option value="multiple">多选题</Select.Option>
              <Select.Option value="judge">判断题</Select.Option>
              <Select.Option value="fill">填空题</Select.Option>
              <Select.Option value="essay">简答题</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="题目内容"
            name="content"
            rules={[{ required: true, message: '请输入题目内容' }]}
          >
            <TextArea rows={3} placeholder="请输入题目内容" />
          </Form.Item>
          
          <Form.Item shouldUpdate>
            {({ getFieldValue }) => {
              const type = getFieldValue('type')
              if (['single', 'multiple'].includes(type)) {
                return (
                  <>
                    <Divider>选项</Divider>
                    <Form.Item label="选项A" name="optionA" rules={[{ required: true, message: '请输入选项A' }]}>
                      <Input placeholder="请输入选项A" />
                    </Form.Item>
                    <Form.Item label="选项B" name="optionB" rules={[{ required: true, message: '请输入选项B' }]}>
                      <Input placeholder="请输入选项B" />
                    </Form.Item>
                    <Form.Item label="选项C" name="optionC" rules={[{ required: true, message: '请输入选项C' }]}>
                      <Input placeholder="请输入选项C" />
                    </Form.Item>
                    <Form.Item label="选项D" name="optionD" rules={[{ required: true, message: '请输入选项D' }]}>
                      <Input placeholder="请输入选项D" />
                    </Form.Item>
                  </>
                )
              }
              return null
            }}
          </Form.Item>

          <Form.Item
            label="正确答案"
            name="answer"
            rules={[{ required: true, message: '请输入正确答案' }]}
          >
            <Input placeholder="请输入正确答案" />
          </Form.Item>
          <Form.Item label="答案解析" name="analysis">
            <TextArea rows={2} placeholder="请输入答案解析" />
          </Form.Item>
          <Form.Item
            label="分值"
            name="score"
            rules={[{ required: true, message: '请输入分值' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入分值" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default QuestionManagement
