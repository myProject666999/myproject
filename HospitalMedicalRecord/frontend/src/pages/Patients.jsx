import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Form, Input, Select, Modal, Tag, message, Popconfirm, Space, DatePicker } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import request from '../utils/request'

const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
]

const statusOptions = [
  { value: 1, label: '在院' },
  { value: 0, label: '出院' },
]

const Patients = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchForm] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()

  const fetchData = async (page = 1, pageSize = 10, params = {}) => {
    setLoading(true)
    try {
      const res = await request.get('/patients', {
        params: {
          page,
          page_size: pageSize,
          ...params,
        },
      })
      setData(res.data.data)
      setPagination({
        current: page,
        pageSize,
        total: res.data.total,
      })
    } catch (error) {
      console.error('Fetch patients error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSearch = (values) => {
    fetchData(1, pagination.pageSize, values)
  }

  const handleReset = () => {
    searchForm.resetFields()
    fetchData(1, pagination.pageSize)
  }

  const handleTableChange = (pagination) => {
    const values = searchForm.getFieldsValue()
    fetchData(pagination.current, pagination.pageSize, values)
  }

  const handleAdd = () => {
    setEditingId(null)
    setModalTitle('新增病人')
    form.resetFields()
    form.setFieldsValue({ gender: 'male', status: 1 })
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    setModalTitle('编辑病人')
    const formData = { ...record }
    if (record.birth_date) {
      formData.birth_date = dayjs(record.birth_date)
    }
    form.setFieldsValue(formData)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await request.delete(`/patients/${id}`)
      message.success('删除成功')
      fetchData(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Delete patient error:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      const submitData = { ...values }
      if (submitData.birth_date) {
        submitData.birth_date = dayjs(submitData.birth_date).format('YYYY-MM-DD')
      }
      
      if (editingId) {
        await request.put(`/patients/${editingId}`, submitData)
        message.success('更新成功')
      } else {
        await request.post('/patients', submitData)
        message.success('创建成功')
      }
      
      setModalVisible(false)
      fetchData(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Submit patient error:', error)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '病历号',
      dataIndex: 'patient_no',
      key: 'patient_no',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender) => (
        <Tag color={gender === 'male' ? 'blue' : 'pink'}>
          {gender === 'male' ? '男' : '女'}
        </Tag>
      ),
    },
    {
      title: '出生日期',
      dataIndex: 'birth_date',
      key: 'birth_date',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'orange'}>
          {status === 1 ? '在院' : '出院'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个病人吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">病人管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增病人
        </Button>
      </div>

      <Card>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          className="search-form"
        >
          <Form.Item name="keyword" label="关键字">
            <Input placeholder="病历号/姓名/电话/身份证" />
          </Form.Item>
          <Form.Item name="gender" label="性别">
            <Select placeholder="全部" style={{ width: 100 }} allowClear>
              {genderOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="全部" style={{ width: 100 }} allowClear>
              {statusOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">
              搜索
            </Button>
          </Form.Item>
          <Form.Item>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSubmit}
        destroyOnClose
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="patient_no"
            label="病历号"
            rules={[{ required: true, message: '请输入病历号' }]}
          >
            <Input placeholder="请输入病历号" />
          </Form.Item>
          
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          
          <Form.Item
            name="gender"
            label="性别"
            rules={[{ required: true, message: '请选择性别' }]}
          >
            <Select placeholder="请选择性别">
              {genderOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="birth_date" label="出生日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择出生日期" />
          </Form.Item>
          
          <Form.Item name="id_card" label="身份证号">
            <Input placeholder="请输入身份证号" />
          </Form.Item>
          
          <Form.Item name="phone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          
          <Form.Item name="address" label="地址">
            <Input placeholder="请输入地址" />
          </Form.Item>
          
          <Form.Item name="emergency_contact" label="紧急联系人">
            <Input placeholder="请输入紧急联系人" />
          </Form.Item>
          
          <Form.Item name="emergency_phone" label="紧急联系电话">
            <Input placeholder="请输入紧急联系电话" />
          </Form.Item>
          
          <Form.Item name="allergies" label="过敏史">
            <Input.TextArea placeholder="请输入过敏史" rows={3} />
          </Form.Item>
          
          <Form.Item name="medical_history" label="既往病史">
            <Input.TextArea placeholder="请输入既往病史" rows={3} />
          </Form.Item>
          
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择状态">
              {statusOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Patients
