import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Form, Input, Select, Modal, message, Popconfirm, Space, DatePicker } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import request from '../utils/request'

const MedicalRecords = () => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchForm] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [modalTitle, setModalTitle] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [form] = Form.useForm()
  const [patients, setPatients] = useState([])
  const [doctors, setDoctors] = useState([])

  const fetchData = async (page = 1, pageSize = 10, params = {}) => {
    setLoading(true)
    try {
      const res = await request.get('/medical-records', {
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
      console.error('Fetch medical records error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatients = async () => {
    try {
      const res = await request.get('/patients', {
        params: { page_size: 100 },
      })
      setPatients(res.data.data || [])
    } catch (error) {
      console.error('Fetch patients error:', error)
    }
  }

  const fetchDoctors = async () => {
    try {
      const res = await request.get('/doctors', {
        params: { page_size: 100 },
      })
      setDoctors(res.data.data || [])
    } catch (error) {
      console.error('Fetch doctors error:', error)
    }
  }

  useEffect(() => {
    fetchData()
    fetchPatients()
    fetchDoctors()
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
    setModalTitle('新增病历')
    form.resetFields()
    form.setFieldsValue({ record_date: dayjs() })
    setModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    setModalTitle('编辑病历')
    const formData = { ...record }
    if (record.record_date) {
      formData.record_date = dayjs(record.record_date)
    }
    form.setFieldsValue(formData)
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await request.delete(`/medical-records/${id}`)
      message.success('删除成功')
      fetchData(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Delete medical record error:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      const submitData = { ...values }
      if (submitData.record_date) {
        submitData.record_date = dayjs(submitData.record_date).format('YYYY-MM-DD')
      }
      
      if (editingId) {
        await request.put(`/medical-records/${editingId}`, submitData)
        message.success('更新成功')
      } else {
        await request.post('/medical-records', submitData)
        message.success('创建成功')
      }
      
      setModalVisible(false)
      fetchData(pagination.current, pagination.pageSize)
    } catch (error) {
      console.error('Submit medical record error:', error)
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
      title: '病历编号',
      dataIndex: 'record_no',
      key: 'record_no',
    },
    {
      title: '病人',
      dataIndex: 'patient',
      key: 'patient',
      render: (patient) => patient?.name || '-',
    },
    {
      title: '主治医生',
      dataIndex: 'doctor',
      key: 'doctor',
      render: (doctor) => doctor?.user?.real_name || doctor?.employee_no || '-',
    },
    {
      title: '诊断结果',
      dataIndex: 'diagnosis',
      key: 'diagnosis',
      ellipsis: true,
    },
    {
      title: '就诊日期',
      dataIndex: 'record_date',
      key: 'record_date',
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
            title="确定要删除这个病历吗？"
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
        <h2 className="page-title">病历管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增病历
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
            <Input placeholder="病历编号/诊断" />
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
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="record_no"
            label="病历编号"
            rules={[{ required: true, message: '请输入病历编号' }]}
          >
            <Input placeholder="请输入病历编号" />
          </Form.Item>
          
          <Form.Item
            name="patient_id"
            label="病人"
            rules={[{ required: true, message: '请选择病人' }]}
          >
            <Select placeholder="请选择病人">
              {patients.map((patient) => (
                <Select.Option key={patient.id} value={patient.id}>
                  {patient.name} ({patient.patient_no})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="doctor_id" label="主治医生">
            <Select placeholder="请选择主治医生" allowClear>
              {doctors.map((doctor) => (
                <Select.Option key={doctor.id} value={doctor.id}>
                  {doctor.user?.real_name || doctor.employee_no} ({doctor.department})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="record_date" label="就诊日期">
            <DatePicker style={{ width: '100%' }} placeholder="请选择就诊日期" />
          </Form.Item>
          
          <Form.Item name="symptoms" label="主诉症状">
            <Input.TextArea placeholder="请输入主诉症状" rows={3} />
          </Form.Item>
          
          <Form.Item name="examination" label="检查结果">
            <Input.TextArea placeholder="请输入检查结果" rows={3} />
          </Form.Item>
          
          <Form.Item name="diagnosis" label="诊断结果">
            <Input.TextArea placeholder="请输入诊断结果" rows={3} />
          </Form.Item>
          
          <Form.Item name="treatment_plan" label="治疗方案">
            <Input.TextArea placeholder="请输入治疗方案" rows={3} />
          </Form.Item>
          
          <Form.Item name="prescription" label="处方">
            <Input.TextArea placeholder="请输入处方" rows={3} />
          </Form.Item>
          
          <Form.Item name="notes" label="备注">
            <Input.TextArea placeholder="请输入备注" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default MedicalRecords
