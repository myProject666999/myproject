import { useEffect, useState } from 'react'
import { Table, Button, Input, Space, Modal, Form, Select, message, Popconfirm, Switch } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { announcementApi } from '../../api'

interface Announcement {
  id: number
  title: string
  content: string
  author: string
  status: number
  is_top: number
  created_at: string
}

const AnnouncementList = () => {
  const [list, setList] = useState<Announcement[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<Announcement | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [page, pageSize])

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await announcementApi.getList({ page, page_size: pageSize, keyword })
      setList(res.data?.list || [])
      setTotal(res.data?.total || 0)
    } catch (error) {
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPage(1)
    loadData()
  }

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    form.setFieldsValue({ status: 1, is_top: 0 })
    setModalVisible(true)
  }

  const handleEdit = (item: Announcement) => {
    setEditingItem(item)
    form.setFieldsValue(item)
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await announcementApi.delete(id)
      message.success('删除成功')
      loadData()
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingItem) {
        await announcementApi.update(editingItem.id, values)
        message.success('更新成功')
      } else {
        await announcementApi.create(values)
        message.success('创建成功')
      }
      setModalVisible(false)
      loadData()
    } catch (error) {
      console.error(error)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author'
    },
    {
      title: '置顶',
      dataIndex: 'is_top',
      key: 'is_top',
      width: 80,
      render: (v: number) => <Switch checked={v === 1} disabled />
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <span className={`status-tag ${status === 1 ? 'status-active' : 'status-inactive'}`}>
          {status === 1 ? '发布' : '草稿'}
        </span>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Announcement) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定删除该公告吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Input
            placeholder="搜索标题"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 240 }}
            onPressEnter={handleSearch}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            搜索
          </Button>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增公告
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={list}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          }
        }}
      />

      <Modal
        title={editingItem ? '编辑公告' : '新增公告'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <Input.TextArea rows={6} placeholder="请输入内容" />
          </Form.Item>
          <Form.Item name="author" label="作者">
            <Input placeholder="请输入作者" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 24 }}>
            <Form.Item name="is_top" label="是否置顶" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select>
                <Select.Option value={1}>发布</Select.Option>
                <Select.Option value={0}>草稿</Select.Option>
              </Select>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default AnnouncementList
