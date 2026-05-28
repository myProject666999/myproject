import React, { useEffect, useState } from 'react'
import {
  Input,
  Select,
  Button,
  Collapse,
  List,
  Card,
  Tag,
  Row,
  Col,
  Pagination,
  Typography,
  Spin,
  Empty,
  Space,
  message
} from 'antd'
import {
  SearchOutlined,
  EnvironmentOutlined,
  FireOutlined,
  BankOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import request from '../utils/request'

const { Title, Text } = Typography

const CITY_OPTIONS = [
  { label: '全部', value: '' },
  { label: '北京', value: '北京' },
  { label: '上海', value: '上海' },
  { label: '广州', value: '广州' },
  { label: '深圳', value: '深圳' },
  { label: '杭州', value: '杭州' },
  { label: '成都', value: '成都' },
  { label: '南京', value: '南京' },
  { label: '武汉', value: '武汉' }
]

const SALARY_OPTIONS = [
  { label: '不限', value: '' },
  { label: '5K以下', value: '0-5' },
  { label: '5K-10K', value: '5-10' },
  { label: '10K-20K', value: '10-20' },
  { label: '20K-40K', value: '20-40' },
  { label: '40K以上', value: '40-999' }
]

const INDUSTRY_OPTIONS = [
  { label: '不限', value: '' },
  { label: '互联网', value: '互联网' },
  { label: '金融', value: '金融' },
  { label: '教育', value: '教育' },
  { label: '医疗健康', value: '医疗健康' },
  { label: '房地产', value: '房地产' },
  { label: '制造业', value: '制造业' }
]

const JOB_TYPE_OPTIONS = [
  { label: '不限', value: '' },
  { label: '全职', value: '全职' },
  { label: '兼职', value: '兼职' },
  { label: '实习', value: '实习' },
  { label: '远程', value: '远程' }
]

const EXPERIENCE_OPTIONS = [
  { label: '不限', value: '' },
  { label: '应届毕业生', value: '应届毕业生' },
  { label: '1-3年', value: '1-3年' },
  { label: '3-5年', value: '3-5年' },
  { label: '5-10年', value: '5-10年' },
  { label: '10年以上', value: '10年以上' }
]

const EDUCATION_OPTIONS = [
  { label: '不限', value: '' },
  { label: '大专', value: '大专' },
  { label: '本科', value: '本科' },
  { label: '硕士', value: '硕士' },
  { label: '博士', value: '博士' }
]

const HomePage = () => {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [city, setCity] = useState('')
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState([])
  const [hotJobs, setHotJobs] = useState([])
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [filters, setFilters] = useState({
    salary: '',
    industry: '',
    jobType: '',
    experience: '',
    education: ''
  })

  const fetchJobs = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = {
        keyword,
        city,
        pageNum: page,
        pageSize,
        ...filters
      }
      const data = await request.get('/jobs', { params })
      if (data) {
        setJobs(data.records || data.list || [])
        setPagination({
          current: page,
          pageSize,
          total: data.total || 0
        })
      }
    } catch (err) {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const fetchHotJobs = async () => {
    try {
      const data = await request.get('/jobs/hot', { params: { limit: 8 } })
      setHotJobs(Array.isArray(data) ? data : [])
    } catch (err) {
      // silent
    }
  }

  useEffect(() => {
    fetchJobs(1, pagination.pageSize)
    fetchHotJobs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = () => {
    setPagination((p) => ({ ...p, current: 1 }))
    fetchJobs(1, pagination.pageSize)
  }

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }))
  }

  const applyFilters = () => {
    setPagination((p) => ({ ...p, current: 1 }))
    fetchJobs(1, pagination.pageSize)
  }

  const handlePageChange = (page, pageSize) => {
    setPagination({ current: page, pageSize, total: pagination.total })
    fetchJobs(page, pageSize)
  }

  const renderSalary = (job) => {
    const min = job.minSalary ?? job.min_salary
    const max = job.maxSalary ?? job.max_salary
    if (min && max) return `${min}-${max}K`
    if (min) return `${min}K以上`
    if (max) return `最高${max}K`
    return '面议'
  }

  const renderJobCard = (job) => {
    const benefits = (job.benefits || '')
      .split(/[,，、;；\s]+/)
      .filter(Boolean)
      .slice(0, 4)

    return (
      <Card
        key={job.id}
        hoverable
        style={{ marginBottom: 12, borderRadius: 8 }}
        onClick={() => navigate(`/jobs/${job.id}`)}
      >
        <Row justify="space-between" align="middle">
          <Col flex="auto">
            <Space size={12} align="center">
              <Title level={4} style={{ margin: 0 }}>
                {job.title}
              </Title>
              <Text className="salary-text" style={{ fontSize: 18 }}>
                {renderSalary(job)}
              </Text>
            </Space>
            <Space wrap size={[8, 8]} style={{ marginTop: 8 }}>
              {job.city && (
                <Tag color="blue">
                  <EnvironmentOutlined /> {job.city}
                </Tag>
              )}
              {job.experience && <Tag>{job.experience}</Tag>}
              {job.education && <Tag>{job.education}</Tag>}
              {job.jobType && <Tag color="purple">{job.jobType}</Tag>}
            </Space>
          </Col>
          <Col flex="300px" style={{ textAlign: 'right' }}>
            <Space direction="vertical" align="end" size={4}>
              <Text strong style={{ fontSize: 16 }}>
                {job.companyName || '—'}
              </Text>
              <Space wrap size={[4, 4]}>
                {benefits.map((b, idx) => (
                  <Tag key={idx} color="green">
                    {b}
                  </Tag>
                ))}
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>
    )
  }

  const filterItems = [
    {
      key: '1',
      label: '筛选条件',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Text>薪资范围</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              value={filters.salary}
              options={SALARY_OPTIONS}
              onChange={(v) => handleFilterChange('salary', v)}
              placeholder="选择薪资范围"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text>行业</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              value={filters.industry}
              options={INDUSTRY_OPTIONS}
              onChange={(v) => handleFilterChange('industry', v)}
              placeholder="选择行业"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text>工作类型</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              value={filters.jobType}
              options={JOB_TYPE_OPTIONS}
              onChange={(v) => handleFilterChange('jobType', v)}
              placeholder="选择工作类型"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text>经验要求</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              value={filters.experience}
              options={EXPERIENCE_OPTIONS}
              onChange={(v) => handleFilterChange('experience', v)}
              placeholder="选择经验要求"
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Text>学历要求</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              value={filters.education}
              options={EDUCATION_OPTIONS}
              onChange={(v) => handleFilterChange('education', v)}
              placeholder="选择学历要求"
            />
          </Col>
          <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={applyFilters} style={{ marginTop: 22 }}>
              应用筛选
            </Button>
          </Col>
        </Row>
      )
    }
  ]

  return (
    <div className="page-container">
      <Card
        style={{ borderRadius: 12, marginBottom: 16 }}
        bodyStyle={{ padding: '20px 24px' }}
      >
        <Row gutter={12} align="middle">
          <Col flex="auto">
            <Input
              size="large"
              prefix={<SearchOutlined />}
              placeholder="搜索职位、公司或关键词"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              allowClear
            />
          </Col>
          <Col flex="160px">
            <Select
              size="large"
              style={{ width: '100%' }}
              placeholder="选择城市"
              value={city}
              options={CITY_OPTIONS}
              onChange={(v) => setCity(v)}
              allowClear
            />
          </Col>
          <Col>
            <Button type="primary" size="large" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
          </Col>
        </Row>
      </Card>

      <Collapse
        items={filterItems}
        defaultActiveKey={[]}
        style={{ marginBottom: 16, background: '#fff', borderRadius: 8 }}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={17}>
          <Card
            title={`职位列表（共 ${pagination.total} 个）`}
            style={{ borderRadius: 12 }}
            bodyStyle={{ padding: 12 }}
          >
            <Spin spinning={loading}>
              {jobs.length === 0 && !loading ? (
                <Empty description="暂无职位" style={{ padding: 40 }} />
              ) : (
                <List dataSource={jobs} renderItem={renderJobCard} />
              )}
              {pagination.total > 0 && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    showSizeChanger
                    showQuickJumper
                    showTotal={(t) => `共 ${t} 条`}
                    onChange={handlePageChange}
                  />
                </div>
              )}
            </Spin>
          </Card>
        </Col>

        <Col xs={24} md={7}>
          <Card
            title={<span><FireOutlined style={{ color: '#ff4d4f' }} /> 热门职位</span>}
            style={{ borderRadius: 12, position: 'sticky', top: 16 }}
          >
            {hotJobs.length === 0 ? (
              <Empty description="暂无热门职位" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <List
                dataSource={hotJobs}
                renderItem={(job, idx) => (
                  <List.Item
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    style={{ cursor: 'pointer', padding: '8px 0' }}
                  >
                    <Row justify="space-between" style={{ width: '100%' }}>
                      <Space size={8}>
                        <Tag
                          color={idx < 3 ? 'red' : 'default'}
                          style={{ minWidth: 28, textAlign: 'center' }}
                        >
                          {idx + 1}
                        </Tag>
                        <Text strong>{job.title}</Text>
                      </Space>
                      <Text className="salary-text">{renderSalary(job)}</Text>
                    </Row>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default HomePage
