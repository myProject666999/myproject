import React, { useState, useEffect } from 'react'
import { Table, Tag, Button, Space, Modal, Form, Input, DatePicker, InputNumber, Select, message } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, FileSearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { claimApi, policyApi } from '../api'
import { formatDate, formatMoney, getStatusLabel, getStatusTag, getInsuranceTypeLabel } from '../utils'

const { Option } = Select
const { TextArea } = Input

function ClaimPage() {
  const [claims, setClaims] = useState([])
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingClaim, setEditingClaim] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [claimsData, policiesData] = await Promise.all([
        claimApi.getAll(),
        policyApi.getAll(),
      ])
      setClaims(claimsData)
      setPolicies(policiesData)
    } catch (error) {
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingClaim(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (record) => {
    setEditingClaim(record)
    form.setFieldsValue({
      ...record,
      incidentDate: dayjs(record.incidentDate),
      claimDate: record.claimDate ? dayjs(record.claimDate) : null,
    })
    setIsModalVisible(true)
  }

  const handleDelete = async (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条理赔记录吗？',
      onOk: async () => {
        try {
          await claimApi.delete(id)
          message.success('删除成功')
          fetchData()
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  const handleUpdateStatus = async (id, status) => {
    Modal.confirm({
      title: '确认状态更新',
      content: `确定要将理赔状态更新为"${getStatusLabel(status)}"吗？`,
      onOk: async () => {
        try {
          await claimApi.updateStatus(id, { status })
          message.success('状态更新成功')
          fetchData()
        } catch (error) {
          message.error('状态更新失败')
        }
      },
    })
  }

  const handleSubmit = async (values) => {
    try {
      const formattedValues = {
        ...values,
        incidentDate: values.incidentDate.format('YYYY-MM-DD'),
        claimDate: values.claimDate?.format('YYYY-MM-DD'),
      }

      if (editingClaim) {
        await claimApi.updateStatus(editingClaim.id, formattedValues)
        message.success('更新成功')
      } else {
        await claimApi.create(values.policyId, formattedValues)
        message.success('创建成功')
      }
      setIsModalVisible(false)
      fetchData()
    } catch (error) {
      message.error(editingClaim ? '更新失败' : '创建失败')
    }
  }

  const columns = [
    {
      title: '理赔号',
      dataIndex: 'claimNumber',
      key: 'claimNumber',
      width: 180,
    },
    {
      title: '保单号',
      key: 'policyNumber',
      width: 180,
      render: (_, record) => record.policy?.policyNumber || '-',
    },
    {
      title: '险种',
      key: 'insuranceType',
      width: 100,
      render: (_, record) => record.policy ? getInsuranceTypeLabel(record.policy.insuranceType) : '-',
    },
    {
      title: '被保人',
      key: 'insuredPerson',
      width: 100,
      render: (_, record) => record.policy?.insuredPerson?.name || '-',
    },
    {
      title: '事故日期',
      dataIndex: 'incidentDate',
      key: 'incidentDate',
      width: 120,
      render: (date) => formatDate(date),
    },
    {
      title: '事故描述',
      dataIndex: 'incidentDescription',
      key: 'incidentDescription',
      ellipsis: true,
    },
    {
      title: '申请金额',
      dataIndex: 'claimAmount',
      key: 'claimAmount',
      width: 130,
      render: (amount) => formatMoney(amount),
    },
    {
      title: '赔付金额',
      dataIndex: 'approvedAmount',
      key: 'approvedAmount',
      width: 130,
      render: (amount) => formatMoney(amount),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag className={getStatusTag(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'PENDING' && (
            <>
              <Button
                type="link"
                onClick={() => handleUpdateStatus(record.id, 'APPROVED')}
              >
                批准
              </Button>
              <Button
                type="link"
                danger
                onClick={() => handleUpdateStatus(record.id, 'REJECTED')}
              >
                拒绝
              </Button>
              <Button
                type="link"
                onClick={() => handleUpdateStatus(record.id, 'SETTLED')}
              >
                已理赔
              </Button>
            </>
          )}
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
        <h2 className="page-title">理赔管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增理赔
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-title">理赔总数</div>
          <div className="stat-card-value">{claims.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">待处理</div>
          <div className="stat-card-value" style={{ color: '#fa8c16' }}>
            {claims.filter(c => c.status === 'PENDING').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">已理赔</div>
          <div className="stat-card-value" style={{ color: '#52c41a' }}>
            {claims.filter(c => c.status === 'SETTLED').length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-title">已拒绝</div>
          <div className="stat-card-value" style={{ color: '#f5222d' }}>
            {claims.filter(c => c.status === 'REJECTED').length}
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={claims}
        rowKey="id"
        loading={loading}
        scroll={{ x: 1300 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
      />

      <Modal
        title={editingClaim ? '编辑理赔' : '新增理赔'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'PENDING',
          }}
        >
          {!editingClaim && (
            <Form.Item
              name="policyId"
              label="选择保单"
              rules={[{ required: true, message: '请选择保单' }]}
            >
              <Select placeholder="请选择保单">
                {policies.map(p => (
                  <Option key={p.id} value={p.id}>
                    {p.policyNumber} - {p.insuranceCompany} - {p.insuredPerson?.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="incidentDate"
              label="事故日期"
              rules={[{ required: true, message: '请选择事故日期' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="claimDate"
              label="申请日期"
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              name="claimAmount"
              label="申请金额 (元)"
              rules={[{ required: true, message: '请输入申请金额' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                precision={2}
                placeholder="请输入申请金额"
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select>
                <Option value="PENDING">待处理</Option>
                <Option value="APPROVED">已批准</Option>
                <Option value="REJECTED">已拒绝</Option>
                <Option value="SETTLED">已理赔</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="incidentDescription"
            label="事故描述"
            rules={[{ required: true, message: '请输入事故描述' }]}
          >
            <TextArea rows={4} placeholder="请详细描述事故情况" />
          </Form.Item>

          <Form.Item name="remarks" label="备注">
            <TextArea rows={2} placeholder="请输入备注" />
          </Form.Item>

          <Form.Item>
            <Space style={{ float: 'right' }}>
              <Button onClick={() => setIsModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingClaim ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ClaimPage
