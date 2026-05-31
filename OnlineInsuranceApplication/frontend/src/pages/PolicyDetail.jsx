import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Card, Descriptions, Tag, Table, Space, Tabs, List, Upload, Modal, message, Progress } from 'antd'
import { ArrowLeftOutlined, UploadOutlined, DownloadOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { policyApi, paymentApi, claimApi, fileApi, reminderApi } from '../api'
import { formatDate, formatMoney, formatFileSize, getInsuranceTypeLabel, getInsuranceTypeTag, getPaymentCycleLabel, getStatusLabel, getStatusTag, getReminderTypeLabel } from '../utils'

function PolicyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [policy, setPolicy] = useState(null)
  const [payments, setPayments] = useState([])
  const [claims, setClaims] = useState([])
  const [attachments, setAttachments] = useState([])
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchPolicyDetail()
    fetchPayments()
    fetchClaims()
    fetchAttachments()
    fetchReminders()
  }, [id])

  const fetchPolicyDetail = async () => {
    try {
      const data = await policyApi.getById(id)
      setPolicy(data)
    } catch (error) {
      message.error('获取保单详情失败')
    }
  }

  const fetchPayments = async () => {
    try {
      const data = await paymentApi.getByPolicyId(id)
      setPayments(data)
    } catch (error) {
      message.error('获取缴费记录失败')
    }
  }

  const fetchClaims = async () => {
    try {
      const data = await claimApi.getByPolicyId(id)
      setClaims(data)
    } catch (error) {
      message.error('获取理赔记录失败')
    }
  }

  const fetchAttachments = async () => {
    try {
      const data = await fileApi.getByPolicyId(id)
      setAttachments(data)
    } catch (error) {
      message.error('获取附件失败')
    }
  }

  const fetchReminders = async () => {
    try {
      const data = await reminderApi.getByPolicyId(id)
      setReminders(data)
    } catch (error) {
      message.error('获取提醒记录失败')
    }
  }

  const handleMarkPaid = async (paymentId) => {
    Modal.confirm({
      title: '确认缴费',
      content: '确定要标记此缴费为已完成吗？',
      onOk: async () => {
        try {
          await paymentApi.markAsPaid(paymentId, {
            paymentMethod: 'BANK_TRANSFER',
            transactionId: 'TXN' + Date.now(),
          })
          message.success('标记成功')
          fetchPayments()
        } catch (error) {
          message.error('标记失败')
        }
      },
    })
  }

  const handleUpload = (file) => {
    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('policyId', id)

    fileApi.upload(formData, (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      setUploadProgress(percentCompleted)
    })
      .then(() => {
        message.success('上传成功')
        fetchAttachments()
      })
      .catch(() => {
        message.error('上传失败')
      })
      .finally(() => {
        setUploading(false)
        setUploadProgress(0)
      })

    return false
  }

  const handleDownload = async (fileId, fileName) => {
    try {
      const blob = await fileApi.download(fileId)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      message.error('下载失败')
    }
  }

  const handleDeleteAttachment = async (fileId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个附件吗？',
      onOk: async () => {
        try {
          await fileApi.delete(fileId)
          message.success('删除成功')
          fetchAttachments()
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  const paymentColumns = [
    {
      title: '应缴日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => formatDate(date),
    },
    {
      title: '应缴金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => formatMoney(amount),
    },
    {
      title: '缴费方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag className={getStatusTag(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: '实际缴费日期',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date) => formatDate(date),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        record.status === 'PENDING' ? (
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleMarkPaid(record.id)}
          >
            标记已缴
          </Button>
        ) : null
      ),
    },
  ]

  const claimColumns = [
    {
      title: '理赔号',
      dataIndex: 'claimNumber',
      key: 'claimNumber',
    },
    {
      title: '事故日期',
      dataIndex: 'incidentDate',
      key: 'incidentDate',
      render: (date) => formatDate(date),
    },
    {
      title: '理赔金额',
      dataIndex: 'claimAmount',
      key: 'claimAmount',
      render: (amount) => formatMoney(amount),
    },
    {
      title: '赔付金额',
      dataIndex: 'approvedAmount',
      key: 'approvedAmount',
      render: (amount) => formatMoney(amount),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag className={getStatusTag(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
  ]

  const reminderColumns = [
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type) => getReminderTypeLabel(type),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '内容',
      dataIndex: 'message',
      key: 'message',
    },
    {
      title: '提醒日期',
      dataIndex: 'reminderDate',
      key: 'reminderDate',
      render: (date) => formatDate(date),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag className={getStatusTag(status)}>
          {getStatusLabel(status)}
        </Tag>
      ),
    },
  ]

  const tabItems = [
    {
      key: '1',
      label: '缴费记录',
      children: (
        <Table
          columns={paymentColumns}
          dataSource={payments}
          rowKey="id"
          pagination={false}
        />
      ),
    },
    {
      key: '2',
      label: '理赔记录',
      children: (
        <Table
          columns={claimColumns}
          dataSource={claims}
          rowKey="id"
          pagination={false}
        />
      ),
    },
    {
      key: '3',
      label: '提醒记录',
      children: (
        <Table
          columns={reminderColumns}
          dataSource={reminders}
          rowKey="id"
          pagination={false}
        />
      ),
    },
    {
      key: '4',
      label: '附件管理',
      children: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Upload
              customRequest={({ file }) => handleUpload(file)}
              showUploadList={false}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                {uploading ? `上传中 ${uploadProgress}%` : '上传附件'}
              </Button>
            </Upload>
            {uploading && <Progress percent={uploadProgress} size="small" style={{ width: 200, marginTop: 8 }} />}
          </div>
          <List
            dataSource={attachments}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(item.id, item.originalFileName)}
                  >
                    下载
                  </Button>,
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteAttachment(item.id)}
                  >
                    删除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  title={item.originalFileName}
                  description={`${item.fileType} • ${formatFileSize(item.fileSize)} • 上传于 ${formatDate(item.uploadedAt)}`}
                />
              </List.Item>
            )}
          />
        </div>
      ),
    },
  ]

  if (!policy) {
    return <div style={{ textAlign: 'center', padding: 50 }}>加载中...</div>
  }

  return (
    <div>
      <div className="page-header">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            返回
          </Button>
          <h2 className="page-title">保单详情</h2>
        </Space>
      </div>

      <Card>
        <Descriptions
          title={<Space>
            <span style={{ fontSize: 18, fontWeight: 600 }}>{policy.policyNumber}</span>
            <Tag className={getInsuranceTypeTag(policy.insuranceType)}>
              {getInsuranceTypeLabel(policy.insuranceType)}
            </Tag>
            <Tag className={getStatusTag(policy.status)}>
              {getStatusLabel(policy.status)}
            </Tag>
          </Space>}
          column={2}
          bordered
          size="middle"
        >
          <Descriptions.Item label="保险公司">{policy.insuranceCompany}</Descriptions.Item>
          <Descriptions.Item label="缴费周期">{getPaymentCycleLabel(policy.paymentCycle)}</Descriptions.Item>
          <Descriptions.Item label="保额">{formatMoney(policy.sumInsured)}</Descriptions.Item>
          <Descriptions.Item label="年缴保费">{formatMoney(policy.premium)}</Descriptions.Item>
          <Descriptions.Item label="生效日期">{formatDate(policy.effectiveDate)}</Descriptions.Item>
          <Descriptions.Item label="到期日期">{formatDate(policy.expiryDate)}</Descriptions.Item>
          {policy.remarks && (
            <Descriptions.Item label="备注" span={2}>{policy.remarks}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Descriptions
          title="被保人信息"
          column={3}
          bordered
          size="middle"
        >
          <Descriptions.Item label="姓名">{policy.insuredPerson?.name}</Descriptions.Item>
          <Descriptions.Item label="性别">{policy.insuredPerson?.gender === 'MALE' ? '男' : '女'}</Descriptions.Item>
          <Descriptions.Item label="出生日期">{formatDate(policy.insuredPerson?.birthDate)}</Descriptions.Item>
          <Descriptions.Item label="身份证号">{policy.insuredPerson?.idCard}</Descriptions.Item>
          <Descriptions.Item label="手机号">{policy.insuredPerson?.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{policy.insuredPerson?.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="联系地址" span={3}>
            {policy.insuredPerson?.address || '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Descriptions
          title="受益人信息"
          column={4}
          bordered
          size="middle"
        >
          {policy.beneficiaries?.map((b, index) => (
            <React.Fragment key={b.id}>
              <Descriptions.Item label="受益人">{b.name}</Descriptions.Item>
              <Descriptions.Item label="关系">{b.relationship}</Descriptions.Item>
              <Descriptions.Item label="收益比例">{b.benefitPercentage}%</Descriptions.Item>
              <Descriptions.Item label="联系电话">{b.phone || '-'}</Descriptions.Item>
            </React.Fragment>
          ))}
        </Descriptions>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Card>
    </div>
  )
}

export default PolicyDetail
