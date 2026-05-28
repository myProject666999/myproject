import React, { useState, useEffect } from 'react'
import {
  Tabs, Table, Tag, Button, Space, Modal, Form, Input, Select,
  InputNumber, Upload, message, Descriptions, Drawer,
  Row, Col, Card, Badge, Popconfirm, Divider
} from 'antd'
import {
  FileTextOutlined, PlusOutlined, UploadOutlined,
  CheckCircleOutlined, CloseCircleOutlined, UserOutlined,
  PhoneOutlined, MailOutlined, BankOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { applicationApi, jobApi, companyApi } from '../api'

const { TextArea } = Input
const { Option } = Select

const statusColorMap = {
  PENDING: 'default',
  VIEWED: 'blue',
  PASSED: 'green',
  INTERVIEW: 'orange',
  OFFER: 'purple',
  REJECTED: 'red',
  HIRED: 'gold'
}

const statusTextMap = {
  PENDING: '待查看',
  VIEWED: '已查看',
  PASSED: '初筛通过',
  INTERVIEW: '面试中',
  OFFER: '已发Offer',
  REJECTED: '已拒绝',
  HIRED: '已录用'
}

const HRRecruitPage = () => {
  const [activeTab, setActiveTab] = useState('applications')
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [company, setCompany] = useState(null)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [detailVisible, setDetailVisible] = useState(false)
  const [jobForm] = Form.useForm()
  const [companyForm] = Form.useForm()

  useEffect(() => {
    if (activeTab === 'applications') loadApplications()
    if (activeTab === 'jobs') loadJobs()
    if (activeTab === 'company') loadCompany()
  }, [activeTab])

  const loadApplications = async () => {
    try {
      const data = await applicationApi.getReceivedApplications({ pageNum: 1, pageSize: 100 })
      setApplications(data.records || data || [])
    } catch (e) { console.error(e) }
  }

  const loadJobs = async () => {
    try {
      const data = await jobApi.getMyJobs()
      setJobs(data.records || data || [])
    } catch (e) { console.error(e) }
  }

  const loadCompany = async () => {
    try {
      const data = await companyApi.getMyCompany()
      setCompany(data)
      if (data) {
        companyForm.setFieldsValue({
          name: data.name,
          industry: data.industry,
          scale: data.scale,
          province: data.province,
          city: data.city,
          address: data.address,
          description: data.description,
          website: data.website
        })
      }
    } catch (e) { console.error(e) }
  }

  const handleUpdateStatus = async (applicationId, status, remark = '') => {
    try {
      await applicationApi.updateApplicationStatus({ applicationId, status, remark })
      message.success('操作成功')
      loadApplications()
      if (selectedApplication?.id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status })
      }
    } catch (e) { console.error(e) }
  }

  const handlePublishJob = async () => {
    try {
      const values = await jobForm.validateFields()
      values.minSalary = parseInt(values.minSalary)
      values.maxSalary = parseInt(values.maxSalary)
      await jobApi.publishJob(values)
      message.success('职位发布成功')
      jobForm.resetFields()
      loadJobs()
    } catch (e) { console.error(e) }
  }

  const handleUpdateCompany = async () => {
    try {
      const values = await companyForm.validateFields()
      await companyApi.updateCompany(values)
      message.success('企业信息更新成功')
      loadCompany()
    } catch (e) { console.error(e) }
  }

  const appColumns = [
    { title: '求职者', dataIndex: ['resume', 'realName'], key: 'name', width: 100 },
    { title: '职位', dataIndex: ['job', 'title'], key: 'job', width: 160 },
    { title: '学历', dataIndex: ['resume', 'education'], key: 'edu', width: 80 },
    { title: '工作年限', dataIndex: ['resume', 'workExperience'], key: 'exp', width: 90 },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (s) => <Tag color={statusColorMap[s]}>{statusTextMap[s]}</Tag>
    },
    { title: '投递时间', dataIndex: 'appliedAt', key: 'time', width: 170,
      render: (t) => dayjs(t).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作', key: 'action', width: 200, fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button size="small" type="link"
            onClick={() => { setSelectedApplication(record); setDetailVisible(true) }}
          >查看简历</Button>
          {record.status === 'PENDING' && (
            <Button size="small" type="primary"
              onClick={() => handleUpdateStatus(record.id, 'VIEWED')}
            >标记查看</Button>
          )}
          {record.status === 'VIEWED' && (
            <Button size="small" type="primary"
              onClick={() => handleUpdateStatus(record.id, 'PASSED')}
            >通过初筛</Button>
          )}
          {['PENDING', 'VIEWED', 'PASSED', 'INTERVIEW'].includes(record.status) && (
            <Popconfirm title="确定拒绝此简历？"
              onConfirm={() => handleUpdateStatus(record.id, 'REJECTED')}
            ><Button size="small" danger>拒绝</Button></Popconfirm>
          )}
        </Space>
      )
    }
  ]

  const jobColumns = [
    { title: '职位名称', dataIndex: 'title', key: 'title' },
    { title: '薪资', dataIndex: 'salaryText', key: 'salary',
      render: (_, r) => {
        const min = r.minSalary ?? r.min_salary
        const max = r.maxSalary ?? r.max_salary
        if (min && max) return `${min}-${max}K`
        if (min) return `${min}K起`
        if (max) return `最高${max}K`
        return '面议'
      }
    },
    { title: '城市', dataIndex: 'city', key: 'city' },
    {
      title: '状态', dataIndex: 'status', key: 'status',
      render: (s) => <Tag color={s === 'OPEN' ? 'green' : s === 'PAUSED' ? 'orange' : 'default'}>
        {s === 'OPEN' ? '招聘中' : s === 'PAUSED' ? '已暂停' : '已关闭'}
      </Tag>
    },
    { title: '投递数', dataIndex: 'applyCount', key: 'count' },
    { title: '发布时间', dataIndex: 'createdAt', key: 'time',
      render: (t) => dayjs(t).format('YYYY-MM-DD')
    },
    {
      title: '操作', key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'OPEN' && (
            <Button size="small" onClick={() => jobApi.updateJobStatus(record.id, 'PAUSED').then(loadJobs)}>暂停</Button>
          )}
          {record.status === 'PAUSED' && (
            <Button size="small" type="primary" onClick={() => jobApi.updateJobStatus(record.id, 'OPEN').then(loadJobs)}>开启</Button>
          )}
        </Space>
      )
    }
  ]

  return (
    <div style={{ padding: '24px', background: '#fff', minHeight: 'calc(100vh - 180px)' }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab} size="large"
        items={[
          {
            key: 'applications',
            label: <Badge count={applications.filter(a => a.status === 'PENDING').length} size="small">收到的投递</Badge>,
            children: (
              <Table columns={appColumns} dataSource={applications}
                rowKey="id" pagination={{ pageSize: 10 }}
                scroll={{ x: 1100 }} size="middle"
              />
            )
          },
          {
            key: 'jobs',
            label: '发布职位',
            children: (
              <Row gutter={[24, 24]}>
                <Col span={10}>
                  <Card title="发布新职位" extra={<PlusOutlined />}>
                    <Form form={jobForm} layout="vertical" onFinish={handlePublishJob}>
                      <Form.Item name="title" label="职位名称" rules={[{ required: true }]}>
                        <Input placeholder="如：高级Java开发工程师" />
                      </Form.Item>
                      <Form.Item name="department" label="所属部门">
                        <Input placeholder="如：后端研发部" />
                      </Form.Item>
                      <Form.Item name="jobType" label="工作类型" rules={[{ required: true }]}
                        initialValue="FULL_TIME">
                        <Select>
                          <Option value="FULL_TIME">全职</Option>
                          <Option value="PART_TIME">兼职</Option>
                          <Option value="INTERN">实习</Option>
                        </Select>
                      </Form.Item>
                      <Form.Item label="薪资范围(K)" required>
                        <Input.Group compact>
                          <Form.Item
                            name="minSalary"
                            noStyle
                            rules={[{ required: true, message: '请输入最低薪资' }]}
                          >
                            <InputNumber style={{ width: '45%' }} min={1} placeholder="最低" />
                          </Form.Item>
                          <span style={{ width: '10%', textAlign: 'center', lineHeight: '32px' }}> - </span>
                          <Form.Item
                            name="maxSalary"
                            noStyle
                            rules={[{ required: true, message: '请输入最高薪资' }]}
                          >
                            <InputNumber style={{ width: '45%' }} min={1} placeholder="最高" />
                          </Form.Item>
                        </Input.Group>
                      </Form.Item>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="province" label="省份" rules={[{ required: true }]}>
                            <Input placeholder="如：广东省" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="city" label="城市" rules={[{ required: true }]}>
                            <Input placeholder="如：深圳市" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Form.Item name="experience" label="经验要求">
                            <Select placeholder="请选择">
                              <Option value="不限">不限</Option>
                              <Option value="1年以内">1年以内</Option>
                              <Option value="1-3年">1-3年</Option>
                              <Option value="3-5年">3-5年</Option>
                              <Option value="5-10年">5-10年</Option>
                              <Option value="10年以上">10年以上</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item name="education" label="学历要求">
                            <Select placeholder="请选择">
                              <Option value="不限">不限</Option>
                              <Option value="大专">大专</Option>
                              <Option value="本科">本科</Option>
                              <Option value="硕士">硕士</Option>
                              <Option value="博士">博士</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item name="keywords" label="关键词">
                        <Input placeholder="多个关键词用逗号分隔，如：Java,SpringBoot,MySQL" />
                      </Form.Item>
                      <Form.Item name="description" label="职位描述" rules={[{ required: true }]}>
                        <TextArea rows={3} placeholder="请输入职位描述" />
                      </Form.Item>
                      <Form.Item name="requirements" label="任职要求">
                        <TextArea rows={3} placeholder="请输入任职要求" />
                      </Form.Item>
                      <Form.Item name="benefits" label="福利待遇">
                        <Input placeholder="如：五险一金,年终奖,带薪年假" />
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" htmlType="submit" block>发布职位</Button>
                      </Form.Item>
                    </Form>
                  </Card>
                </Col>
                <Col span={14}>
                  <Card title="已发布职位">
                    <Table columns={jobColumns} dataSource={jobs}
                      rowKey="id" pagination={{ pageSize: 5 }} size="small"
                    />
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'company',
            label: '企业信息',
            children: (
              <Card title="企业信息" style={{ maxWidth: 700 }}>
                <Form form={companyForm} layout="vertical" onFinish={handleUpdateCompany}>
                  <Form.Item name="name" label="企业名称" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="industry" label="所属行业" rules={[{ required: true }]}>
                        <Select placeholder="请选择行业">
                          <Option value="互联网/信息技术">互联网/信息技术</Option>
                          <Option value="互联网/电子商务">互联网/电子商务</Option>
                          <Option value="互联网/游戏">互联网/游戏</Option>
                          <Option value="金融">金融</Option>
                          <Option value="教育">教育</Option>
                          <Option value="医疗健康">医疗健康</Option>
                          <Option value="其他">其他</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="scale" label="企业规模">
                        <Select>
                          <Option value="0-20人">0-20人</Option>
                          <Option value="20-99人">20-99人</Option>
                          <Option value="100-499人">100-499人</Option>
                          <Option value="500-999人">500-999人</Option>
                          <Option value="1000人以上">1000人以上</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="province" label="省份"><Input /></Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="city" label="城市"><Input /></Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="address" label="详细地址"><Input /></Form.Item>
                  <Form.Item name="website" label="官方网站"><Input /></Form.Item>
                  <Form.Item name="description" label="企业简介">
                    <TextArea rows={4} />
                  </Form.Item>
                  <Form.Item name="logo" label="企业Logo">
                    <Upload>
                      <Button icon={<UploadOutlined />}>点击上传</Button>
                    </Upload>
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit">保存企业信息</Button>
                  </Form.Item>
                </Form>
              </Card>
            )
          }
        ]}
      />

      <Drawer title="简历详情" open={detailVisible} width={600}
        onClose={() => setDetailVisible(false)}
      >
        {selectedApplication && (
          <div>
            <Descriptions title="基本信息" bordered column={1} size="small">
              <Descriptions.Item label="姓名">
                {selectedApplication.resume?.realName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="手机">
                {selectedApplication.resume?.phone || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                {selectedApplication.resume?.email || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="学历">
                {selectedApplication.resume?.education || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="工作年限">
                {selectedApplication.resume?.workExperience ? `${selectedApplication.resume.workExperience}年` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="期望职位">
                {selectedApplication.resume?.intentionPosition || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="期望薪资">
                {selectedApplication.resume?.intentionSalaryMin && selectedApplication.resume?.intentionSalaryMax
                  ? `${selectedApplication.resume.intentionSalaryMin}-${selectedApplication.resume.intentionSalaryMax}K`
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Descriptions title="自我介绍" bordered column={1} size="small">
              <Descriptions.Item>
                {selectedApplication.resume?.selfIntroduction || '-'}
              </Descriptions.Item>
            </Descriptions>
            <Divider />
            <Descriptions title="投递信息" bordered column={1} size="small">
              <Descriptions.Item label="投递时间">
                {dayjs(selectedApplication.appliedAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="当前状态">
                <Tag color={statusColorMap[selectedApplication.status]}>
                  {statusTextMap[selectedApplication.status]}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 24 }}>
              <Space>
                {selectedApplication.status === 'PENDING' && (
                  <Button type="primary" icon={<CheckCircleOutlined />}
                    onClick={() => handleUpdateStatus(selectedApplication.id, 'VIEWED')}
                  >标记已查看</Button>
                )}
                {selectedApplication.status === 'VIEWED' && (
                  <Button type="primary"
                    onClick={() => handleUpdateStatus(selectedApplication.id, 'PASSED')}
                  >初筛通过</Button>
                )}
                {['PENDING', 'VIEWED', 'PASSED', 'INTERVIEW'].includes(selectedApplication.status) && (
                  <Button danger icon={<CloseCircleOutlined />}
                    onClick={() => handleUpdateStatus(selectedApplication.id, 'REJECTED')}
                  >拒绝</Button>
                )}
              </Space>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default HRRecruitPage
