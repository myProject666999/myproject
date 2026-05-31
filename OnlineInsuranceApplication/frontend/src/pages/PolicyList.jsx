import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Button, Tag, Space, Input, Select, Modal, Form, DatePicker, InputNumber, message } from 'antd'
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { policyApi } from '../api'
import { formatDate, formatMoney, getInsuranceTypeLabel, getInsuranceTypeTag, getPaymentCycleLabel, getStatusLabel, getStatusTag } from '../utils'

const { Option } = Select

function PolicyList() {
  const navigate = useNavigate()
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(false)
  const [filteredPolicies, setFilteredPolicies] = useState([])
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchPolicies()
  }, [])

  useEffect(() => {
    filterPolicies()
  }, [policies, searchText, filterType, filterStatus])

  const fetchPolicies = async () => {
    setLoading(true)
    try {
      const data = await policyApi.getAll()
      setPolicies(data)
    } catch (error) {
      message.error('获取保单列表失败')
    } finally {
      setLoading(false)
    }
  }

  const filterPolicies = () => {
    let filtered = [...policies]
    if (searchText) {
      const text = searchText.toLowerCase()
      filtered = filtered.filter(p =>
        p.policyNumber.toLowerCase().includes(text) ||
        p.insuredPerson?.name.toLowerCase().includes(text) ||
        p.insuranceCompany?.toLowerCase().includes(text)
      )
    }
    if (filterType) {
      filtered = filtered.filter(p => p.insuranceType === filterType)
    }
    if (filterStatus) {
      filtered = filtered.filter(p => p.status === filterStatus)
    }
    setFilteredPolicies(filtered)
  }

  const handleAdd = () => {
    setEditingPolicy(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingPolicy(record)
    form.setFieldsValue({
      ...record,
      effectiveDate: dayjs(record.effectiveDate),
      expiryDate: dayjs(record.expiryDate),
      insuredPerson: {
        ...record.insuredPerson,
        birthDate: record.insuredPerson?.birthDate ? dayjs(record.insuredPerson.birthDate) : null,
      },
      beneficiaries: record.beneficiaries,
    })
    setIsModalVisible(true)
  }

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这张保单吗？此操作不可恢复。',
      onOk: async () => {
        try {
          await policyApi.delete(id)
          message.success('删除成功')
          fetchPolicies()
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        effectiveDate: values.effectiveDate?.format('YYYY-MM-DD'),
        expiryDate: values.expiryDate?.format('YYYY-MM-DD'),
        insuredPerson: values.insuredPerson ? {
          ...values.insuredPerson,
          birthDate: values.insuredPerson.birthDate?.format('YYYY-MM-DD'),
        } : null,
      }

      if (editingPolicy) {
        await policyApi.update(editingPolicy.id, formattedValues)
        message.success('更新成功')
      } else {
        await policyApi.create(formattedValues)
        message.success('创建成功')
      }
      setIsModalVisible(false)
      fetchPolicies()
    } catch (error) {
      console.error('Submit error:', error)
      message.error(editingPolicy ? '更新失败' : '创建失败')
    }
  }

  const columns = [
    {
      title: '保单号',
      dataIndex: 'policyNumber',
      key: 'policyNumber',
      width: 180,
    },
    {
      title: '险种',
      dataIndex: 'insuranceType',
      key: 'insuranceType',
      width: 120,
      render: (type) => (
        <Tag className={getInsuranceTypeTag(type)}>
          {getInsuranceTypeLabel(type)}
        </Tag>
      ),
    },
    {
      title: '被保人',
      key: 'insuredPerson',
      width: 100,
      render: (_, record) => record.insuredPerson?.name || '-',
    },
    {
      title: '保额',
      dataIndex: 'sumInsured',
      key: 'sumInsured',
      width: 140,
      render: (amount) => formatMoney(amount),
    },
    {
      title: '保费',
      dataIndex: 'premium',
      key: 'premium',
      width: 140,
      render: (amount) => formatMoney(amount),
    },
    {
      title: '缴费周期',
      dataIndex: 'paymentCycle',
      key: 'paymentCycle',
      width: 100,
      render: (cycle) => getPaymentCycleLabel(cycle),
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      width: 120,
      render: (date) => formatDate(date),
    },
    {
      title: '到期日期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (date) => formatDate(date),
    },
    {
      title: '保险公司',
      dataIndex: 'insuranceCompany',
      key: 'insuranceCompany',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag className={getStatusTag(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/policy/${record.id}`)}
          >
            详情
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">保单列表</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增保单
        </Button>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Input
          placeholder="搜索保单号/被保人/保险公司"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Select
          placeholder="选择险种"
          value={filterType || undefined}
          onChange={setFilterType}
          style={{ width: 150 }}
          allowClear
        >
          <Option value="LIFE">人寿保险</Option>
          <Option value="HEALTH">健康保险</Option>
          <Option value="AUTO">汽车保险</Option>
          <Option value="PROPERTY">财产保险</Option>
        </Select>
        <Select
          placeholder="选择状态"
          value={filterStatus || undefined}
          onChange={setFilterStatus}
          style={{ width: 150 }}
          allowClear
        >
          <Option value="ACTIVE">有效</Option>
          <Option value="EXPIRED">已过期</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filteredPolicies}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      <Modal
        title={editingPolicy ? '编辑保单' : '新增保单'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            insuranceType: 'LIFE',
            paymentCycle: 'ANNUALLY',
            status: 'ACTIVE',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="insuranceType"
              label="险种"
              rules={[{ required: true, message: '请选择险种' }]}
            >
              <Select>
                <Option value="LIFE">人寿保险</Option>
                <Option value="HEALTH">健康保险</Option>
                <Option value="AUTO">汽车保险</Option>
                <Option value="PROPERTY">财产保险</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="insuranceCompany"
              label="保险公司"
              rules={[{ required: true, message: '请输入保险公司' }]}
            >
              <Input placeholder="请输入保险公司" />
            </Form.Item>

            <Form.Item
              name="sumInsured"
              label="保额 (元)"
              rules={[{ required: true, message: '请输入保额' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="请输入保额"
              />
            </Form.Item>

            <Form.Item
              name="premium"
              label="保费 (元)"
              rules={[{ required: true, message: '请输入保费' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="请输入保费"
              />
            </Form.Item>

            <Form.Item
              name="paymentCycle"
              label="缴费周期"
              rules={[{ required: true, message: '请选择缴费周期' }]}
            >
              <Select>
                <Option value="MONTHLY">月缴</Option>
                <Option value="QUARTERLY">季缴</Option>
                <Option value="SEMI_ANNUALLY">半年缴</Option>
                <Option value="ANNUALLY">年缴</Option>
                <Option value="SINGLE">趸缴</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select>
                <Option value="ACTIVE">有效</Option>
                <Option value="EXPIRED">已过期</Option>
                <Option value="LAPSED">已失效</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="effectiveDate"
              label="生效日期"
              rules={[{ required: true, message: '请选择生效日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="expiryDate"
              label="到期日期"
              rules={[{ required: true, message: '请选择到期日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <h4 style={{ marginBottom: 12, marginTop: 8 }}>被保人信息</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Form.Item
              name={['insuredPerson', 'name']}
              label="姓名"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input placeholder="请输入姓名" />
            </Form.Item>

            <Form.Item
              name={['insuredPerson', 'idCard']}
              label="身份证号"
              rules={[{ required: true, message: '请输入身份证号' }]}
            >
              <Input placeholder="请输入身份证号" />
            </Form.Item>

            <Form.Item
              name={['insuredPerson', 'gender']}
              label="性别"
              rules={[{ required: true, message: '请选择性别' }]}
            >
              <Select>
                <Option value="MALE">男</Option>
                <Option value="FEMALE">女</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name={['insuredPerson', 'birthDate']}
              label="出生日期"
              rules={[{ required: true, message: '请选择出生日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name={['insuredPerson', 'phone']}
              label="手机号"
            >
              <Input placeholder="请输入手机号" />
            </Form.Item>

            <Form.Item
              name={['insuredPerson', 'email']}
              label="邮箱"
            >
              <Input placeholder="请输入邮箱" />
            </Form.Item>
          </div>

          <Form.Item name="remarks" label="备注">
            <Input.TextArea rows={3} placeholder="请输入备注" />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingPolicy ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default PolicyList
