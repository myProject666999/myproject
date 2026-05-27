import React, { useEffect, useState } from 'react'
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Upload,
  Button,
  Card,
  Row,
  Col,
  Space,
  Tag,
  Typography,
  Divider,
  message,
  Tooltip,
  Radio
} from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  UploadOutlined,
  UserOutlined,
  CloseOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import request from '../utils/request'

const { Title, Text } = Typography
const { TextArea } = Input
const { RangePicker } = DatePicker

const GENDER_OPTIONS = [
  { label: '男', value: '男' },
  { label: '女', value: '女' }
]

const EDUCATION_OPTIONS = [
  { label: '大专', value: '大专' },
  { label: '本科', value: '本科' },
  { label: '硕士', value: '硕士' },
  { label: '博士', value: '博士' },
  { label: '其他', value: '其他' }
]

const WORK_STATUS_OPTIONS = [
  { label: '在职，考虑机会', value: '在职，考虑机会' },
  { label: '在职，不考虑机会', value: '在职，不考虑机会' },
  { label: '离职，正在找工作', value: '离职，正在找工作' },
  { label: '应届毕业生', value: '应届毕业生' }
]

const SALARY_OPTIONS = [
  { label: '5K以下', value: '5K以下' },
  { label: '5K-10K', value: '5K-10K' },
  { label: '10K-20K', value: '10K-20K' },
  { label: '20K-40K', value: '20K-40K' },
  { label: '40K以上', value: '40K以上' }
]

const SectionCard = ({ title, children, extra }) => (
  <Card
    style={{ marginBottom: 16, borderRadius: 12 }}
    title={<Title level={5} style={{ margin: 0 }}>{title}</Title>}
    extra={extra}
  >
    {children}
  </Card>
)

const ResumePage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [skillInput, setSkillInput] = useState('')

  useEffect(() => {
    fetchResume()
  }, [])

  const fetchResume = async () => {
    setLoading(true)
    try {
      const data = await request.get('/resume/my')
      if (data) {
        const values = { ...data }
        if (values.birthday) values.birthday = dayjs(values.birthday)
        if (values.graduateDate) values.graduateDate = dayjs(values.graduateDate)
        if (values.educations) {
          values.educations = values.educations.map((e) => ({
            ...e,
            startDate: e.startDate ? dayjs(e.startDate) : undefined,
            endDate: e.endDate ? dayjs(e.endDate) : undefined
          }))
        }
        if (values.workExperiences) {
          values.workExperiences = values.workExperiences.map((w) => ({
            ...w,
            startDate: w.startDate ? dayjs(w.startDate) : undefined,
            endDate: w.endDate ? dayjs(w.endDate) : undefined
          }))
        }
        if (values.projectExperiences) {
          values.projectExperiences = values.projectExperiences.map((p) => ({
            ...p,
            startDate: p.startDate ? dayjs(p.startDate) : undefined,
            endDate: p.endDate ? dayjs(p.endDate) : undefined
          }))
        }
        if (typeof values.skills === 'string') {
          values.skills = values.skills.split(/[,，、;；\s]+/).filter(Boolean)
        }
        form.setFieldsValue(values)
      }
    } catch (err) {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)

      const payload = { ...values }
      if (payload.birthday) payload.birthday = payload.birthday.format('YYYY-MM-DD')
      if (payload.graduateDate) payload.graduateDate = payload.graduateDate.format('YYYY-MM-DD')

      const formatRange = (list, key) => {
        if (!list) return
        list.forEach((item) => {
          if (item.startDate) item.startDate = item.startDate.format('YYYY-MM-DD')
          if (item.endDate) item.endDate = item.endDate.format('YYYY-MM-DD')
        })
      }
      formatRange(payload.educations)
      formatRange(payload.workExperiences)
      formatRange(payload.projectExperiences)

      if (Array.isArray(payload.skills)) {
        payload.skills = payload.skills.join(',')
      }

      await request.put('/resume', payload)
      message.success('保存成功')
    } catch (err) {
      if (err?.errorFields) return
    } finally {
      setSaving(false)
    }
  }

  const handleAddSkill = () => {
    const trimmed = skillInput.trim()
    if (!trimmed) return
    const current = form.getFieldValue('skills') || []
    if (current.includes(trimmed)) {
      message.warning('该技能已存在')
      return
    }
    form.setFieldValue('skills', [...current, trimmed])
    setSkillInput('')
  }

  const handleRemoveSkill = (skill) => {
    const current = form.getFieldValue('skills') || []
    form.setFieldValue('skills', current.filter((s) => s !== skill))
  }

  const skillTagRender = (props) => {
    const { label, value, closable, onClose } = props
    const onPreventMouseDown = (e) => {
      e.preventDefault()
      e.stopPropagation()
    }
    return (
      <Tag
        color="blue"
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{ marginInlineEnd: 4 }}
      >
        {label}
      </Tag>
    )
  }

  return (
    <div className="page-container">
      <Card style={{ borderRadius: 12, marginBottom: 16, background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ color: '#fff', margin: 0 }}>
              我的简历
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>完善简历，获得更多机会</Text>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSubmit}
            >
              保存简历
            </Button>
          </Col>
        </Row>
      </Card>

      <Form form={form} layout="vertical" requiredMark={false} initialValues={{ skills: [] }}>
        <SectionCard title="基本信息">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="realName"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="请输入姓名" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="gender"
                label="性别"
                rules={[{ required: true, message: '请选择性别' }]}
              >
                <Radio.Group options={GENDER_OPTIONS} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="birthday"
                label="出生日期"
                rules={[{ required: true, message: '请选择出生日期' }]}
              >
                <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="phone"
                label="手机号"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
                ]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '邮箱格式不正确' }
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="city" label="所在城市" rules={[{ required: true, message: '请输入所在城市' }]}>
                <Input placeholder="请输入所在城市" />
              </Form.Item>
            </Col>
          </Row>
        </SectionCard>

        <SectionCard title="求职意向">
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="intentionPosition" label="期望职位" rules={[{ required: true, message: '请输入期望职位' }]}>
                <Input placeholder="请输入期望职位" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="intentionCity" label="期望城市" rules={[{ required: true, message: '请输入期望城市' }]}>
                <Input placeholder="请输入期望城市" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="intentionSalary" label="期望薪资">
                <Select
                  placeholder="选择期望薪资"
                  options={SALARY_OPTIONS}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Form.Item name="workStatus" label="求职状态" rules={[{ required: true, message: '请选择求职状态' }]}>
                <Select placeholder="选择求职状态" options={WORK_STATUS_OPTIONS} />
              </Form.Item>
            </Col>
          </Row>
        </SectionCard>

        <SectionCard title="教育背景">
          <Form.List name="educations">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 12, borderRadius: 8, background: '#fafafa' }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      >
                        删除
                      </Button>
                    }
                    title={`教育经历 ${key + 1}`}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'education']}
                          label="学历"
                          rules={[{ required: true, message: '请选择学历' }]}
                        >
                          <Select placeholder="选择学历" options={EDUCATION_OPTIONS} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'graduateSchool']}
                          label="毕业院校"
                          rules={[{ required: true, message: '请输入毕业院校' }]}
                        >
                          <Input placeholder="请输入毕业院校" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'major']}
                          label="专业"
                          rules={[{ required: true, message: '请输入专业' }]}
                        >
                          <Input placeholder="请输入专业" />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          {...restField}
                          name={[name, 'dateRange']}
                          label="起止时间"
                        >
                          <RangePicker style={{ width: '100%' }} picker="month" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}>
                  添加教育经历
                </Button>
              </>
            )}
          </Form.List>
        </SectionCard>

        <SectionCard title="工作经历">
          <Form.List name="workExperiences">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 12, borderRadius: 8, background: '#fafafa' }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      >
                        删除
                      </Button>
                    }
                    title={`工作经历 ${key + 1}`}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'companyName']}
                          label="公司名称"
                          rules={[{ required: true, message: '请输入公司名称' }]}
                        >
                          <Input placeholder="请输入公司名称" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'position']}
                          label="职位"
                          rules={[{ required: true, message: '请输入职位' }]}
                        >
                          <Input placeholder="请输入职位" />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          {...restField}
                          name={[name, 'dateRange']}
                          label="起止时间"
                        >
                          <RangePicker style={{ width: '100%' }} picker="month" />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          {...restField}
                          name={[name, 'description']}
                          label="工作描述"
                        >
                          <TextArea rows={4} placeholder="请输入工作描述" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}>
                  添加工作经历
                </Button>
              </>
            )}
          </Form.List>
        </SectionCard>

        <SectionCard title="项目经历">
          <Form.List name="projectExperiences">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card
                    key={key}
                    size="small"
                    style={{ marginBottom: 12, borderRadius: 8, background: '#fafafa' }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      >
                        删除
                      </Button>
                    }
                    title={`项目经历 ${key + 1}`}
                  >
                    <Row gutter={16}>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'projectName']}
                          label="项目名称"
                          rules={[{ required: true, message: '请输入项目名称' }]}
                        >
                          <Input placeholder="请输入项目名称" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'role']}
                          label="担任角色"
                          rules={[{ required: true, message: '请输入担任角色' }]}
                        >
                          <Input placeholder="请输入担任角色" />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          {...restField}
                          name={[name, 'dateRange']}
                          label="起止时间"
                        >
                          <RangePicker style={{ width: '100%' }} picker="month" />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          {...restField}
                          name={[name, 'description']}
                          label="项目描述"
                        >
                          <TextArea rows={3} placeholder="请输入项目描述" />
                        </Form.Item>
                      </Col>
                      <Col xs={24}>
                        <Form.Item
                          {...restField}
                          name={[name, 'techStack']}
                          label="技术栈"
                        >
                          <Input placeholder="请输入技术栈，多个用逗号分隔" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" block icon={<PlusOutlined />} onClick={() => add()}>
                  添加项目经历
                </Button>
              </>
            )}
          </Form.List>
        </SectionCard>

        <SectionCard title="技能标签">
          <Form.Item name="skills" label="技能" tooltip="按回车或点击添加按钮添加技能">
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="输入技能名称并回车添加"
              tagRender={skillTagRender}
              open={false}
            />
          </Form.Item>
        </SectionCard>

        <SectionCard title="自我介绍">
          <Form.Item name="selfIntroduction" label="自我介绍">
            <TextArea rows={5} placeholder="请介绍自己的优势和职业规划" showCount maxLength={1000} />
          </Form.Item>
        </SectionCard>

        <SectionCard title="附件简历">
          <Form.Item name="attachment" label="上传简历附件">
            <Upload
              maxCount={1}
              beforeUpload={(file) => {
                const isLt10M = file.size / 1024 / 1024 < 10
                if (!isLt10M) {
                  message.error('文件大小不能超过 10MB')
                }
                return isLt10M ? false : false
              }}
            >
              <Button icon={<UploadOutlined />}>点击上传简历附件（PDF/DOC）</Button>
            </Upload>
          </Form.Item>
        </SectionCard>

        <div style={{ textAlign: 'center', padding: 24 }}>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSubmit}
          >
            保存简历
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default ResumePage
