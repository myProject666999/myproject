import React, { useState, useEffect } from 'react'
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Select,
  InputNumber,
  DatePicker,
  message,
  Space,
  Popconfirm,
  Card,
  Typography,
} from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons'
import { adminAPI } from '../../services/api'
import type { DoctorSchedule, User, Department, RegistrationLevel, PageResponse } from '../../types'

const { Title } = Typography
const { Option } = Select

const SHIFTS = [
  { value: 1, label: '上午' },
  { value: 2, label: '下午' },
  { value: 3, label: '全天' },
]

export const DoctorScheduleManagement: React.FC = () => {
  const [items, setItems] = useState<DoctorSchedule[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [registrationLevels, setRegistrationLevels] = useState<RegistrationLevel[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [keyword, setKeyword] = useState('')

  const [modalVisible, setModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState<DoctorSchedule | null>(null)
  const [form] = Form.useForm()

  const fetchList = async () => {
    try {
      setLoading(true)
      const result: PageResponse<DoctorSchedule> = await adminAPI.getDoctorSchedules({
        page,
        page_size: pageSize,
        keyword,
      })
      if (result.list) {
        setItems(result.list)
        setTotal(result.total)
      } else {
        setItems(result as any)
        setTotal((result as any).length || 0)
      }
    } catch (error) {
      message.error('获取排班列表失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const result: any = await adminAPI.getUsers({ page: 1, page_size: 100 })
      if (result.list) {
        setUsers(result.list.filter((u: User) => u.role_id === 2))
      }
    } catch (error) {
      console.error('获取用户列表失败', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const data = await adminAPI.getDepartments()
      setDepartments(data as any)
    } catch (error) {
      console.error('获取科室列表失败', error)
    }
  }

  const fetchRegistrationLevels = async () => {
    try {
      const data = await adminAPI.getRegistrationLevels()
      setRegistrationLevels(data as any)
    } catch (error) {
      console.error('获取挂号级别列表失败', error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchDepartments()
    fetchRegistrationLevels()
  }, [])

  useEffect(() => {
    fetchList()
  }, [page, pageSize, keyword])

  const handleAdd = () => {
    setEditingItem(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (item: DoctorSchedule) => {
    setEditingItem(item)
    form.setFieldsValue({
      ...item,
      date: item.date,
    })
    setModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await adminAPI.deleteDoctorSchedule(id)
      message.success('删除成功')
      fetchList()
    } catch (error) {
      message.error('删除失败')
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const submitData = {
        ...values,
        date: values.date?.format('YYYY-MM-DD') || values.date,
      }

      if (editingItem) {
        await adminAPI.updateDoctorSchedule(editingItem.id, submitData)
        message.success('更新成功')
      } else {
        await adminAPI.createDoctorSchedule(submitData)
        message.success('创建成功')
      }

      setModalVisible(false)
      fetchList()
    } catch (error: any) {
      if (error.errorFields) {
        return
      }
      message.error('操作失败')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    {
      title: '医生',
      dataIndex: 'doctor',
      key: 'doctor',
      render: (doctor: User) => doctor?.name || '-',
    },
    {
      title: '科室',
      dataIndex: 'department',
      key: 'department',
      render: (dept: Department) => dept?.name || '-',
    },
    { title: '排班日期', dataIndex: 'date', key: 'date' },
    {
      title: '班次',
      dataIndex: 'shift',
      key: 'shift',
      render: (shift: number) => {
        const s = SHIFTS.find((d) => d.value === shift)
        return s?.label || '-'
      },
    },
    {
      title: '挂号级别',
      dataIndex: 'registration_level',
      key: 'registration_level',
      render: (level: RegistrationLevel) => level?.name || '-',
    },
    { title: '最大号源', dataIndex: 'max_patients', key: 'max_patients' },
    { title: '已挂号数', dataIndex: 'current_patients', key: 'current_patients' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (status === 1 ? '可挂号' : '已停诊'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DoctorSchedule) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个排班吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
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
      <Title level={4}>医生排班管理</Title>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input
            placeholder="搜索"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={() => {
              setPage(1)
              fetchList()
            }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增排班
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={items}
          loading={loading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            },
          }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑排班' : '新增排班'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="doctor_id"
            label="医生"
            rules={[{ required: true, message: '请选择医生' }]}
          >
            <Select placeholder="请选择医生" showSearch optionFilterProp="children">
              {users.map((u) => (
                <Option key={u.id} value={u.id}>
                  {u.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="department_id"
            label="科室"
            rules={[{ required: true, message: '请选择科室' }]}
          >
            <Select placeholder="请选择科室">
              {departments.map((d) => (
                <Option key={d.id} value={d.id}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="排班日期"
            rules={[{ required: true, message: '请选择排班日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="shift"
            label="班次"
            rules={[{ required: true, message: '请选择班次' }]}
            initialValue={1}
          >
            <Select placeholder="请选择班次">
              {SHIFTS.map((s) => (
                <Option key={s.value} value={s.value}>
                  {s.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="registration_level_id" label="挂号级别">
            <Select placeholder="请选择挂号级别" allowClear>
              {registrationLevels.map((l) => (
                <Option key={l.id} value={l.id}>
                  {l.name} - ¥{l.price}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="max_patients"
            label="最大号源"
            rules={[{ required: true, message: '请输入最大号源' }]}
            initialValue={20}
          >
            <InputNumber style={{ width: '100%' }} min={1} max={100} />
          </Form.Item>

          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Option value={1}>可挂号</Option>
              <Option value={0}>已停诊</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
