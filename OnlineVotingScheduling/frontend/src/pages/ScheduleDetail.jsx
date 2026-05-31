import React, { useEffect, useState } from 'react'
import { Card, Table, Button, Tag, Space, Modal, Select, message, Typography, Row, Col, Statistic, Progress, Tooltip } from 'antd'
import { ArrowLeftOutlined, ThunderboltOutlined, PlayCircleOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { scheduleApi, scheduleSlotApi, teamApi, voteApi } from '../api'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select

const weekDayMap = {
  1: '周一', 2: '周二', 3: '周三', 4: '周四', 5: '周五', 6: '周六', 7: '周日'
}

export default function ScheduleDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [schedule, setSchedule] = useState(null)
  const [slots, setSlots] = useState([])
  const [teamMembers, setTeamMembers] = useState([])
  const [voteStats, setVoteStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [assignModal, setAssignModal] = useState(false)
  const [assigningSlot, setAssigningSlot] = useState(null)
  const [voteModal, setVoteModal] = useState(false)
  const [voteType, setVoteType] = useState('APPROVE')
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    if (id) loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [scheduleRes, slotsRes] = await Promise.all([
        scheduleApi.getById(id),
        scheduleSlotApi.getBySchedule(id)
      ])
      setSchedule(scheduleRes.data)
      setSlots(slotsRes.data || [])

      if (scheduleRes.data) {
        const [membersRes, voteCountRes] = await Promise.all([
          teamApi.getMembers(scheduleRes.data.teamId),
          voteApi.getCount(id)
        ])
        setTeamMembers(membersRes.data || [])
        setVoteStats(voteCountRes.data)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAutoAssign = async () => {
    try {
      await scheduleApi.autoAssign(id)
      message.success('自动排班完成')
      loadData()
    } catch (error) {
      message.error(error.message || '自动排班失败')
    }
  }

  const handleGenerateSlots = async () => {
    try {
      await scheduleApi.generateSlots(id, '09:00', '18:00')
      message.success('生成排班时段成功')
      loadData()
    } catch (error) {
      message.error(error.message || '生成失败')
    }
  }

  const handlePublish = async () => {
    try {
      await scheduleApi.publish(id)
      message.success('发布成功')
      loadData()
    } catch (error) {
      message.error(error.message || '发布失败')
    }
  }

  const handleAssign = (slot) => {
    setAssigningSlot(slot)
    setAssignModal(true)
  }

  const handleAssignSubmit = async (userId) => {
    try {
      setAssigning(true)
      await scheduleSlotApi.assign(assigningSlot.id, userId)
      message.success('分配成功')
      setAssignModal(false)
      loadData()
    } catch (error) {
      message.error(error.message || '分配失败')
    } finally {
      setAssigning(false)
    }
  }

  const handleVote = async () => {
    try {
      await voteApi.vote(id, voteType)
      message.success('投票成功')
      setVoteModal(false)
      loadData()
    } catch (error) {
      message.error(error.message || '投票失败')
    }
  }

  const assignedCount = slots.filter(s => s.userId).length
  const unassignedCount = slots.filter(s => !s.userId).length

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '星期',
      dataIndex: 'weekDay',
      key: 'weekDay',
      render: (day) => weekDayMap[day]
    },
    {
      title: '时间',
      key: 'time',
      render: (_, record) => (
        <span>{record.startTime?.substring(0, 5)} - {record.endTime?.substring(0, 5)}</span>
      )
    },
    {
      title: '值班人员',
      dataIndex: 'userId',
      key: 'userId',
      render: (userId, record) => {
        if (!userId) return <Tag color="red">未分配</Tag>
        const member = teamMembers.find(m => m.id === userId)
        return (
          <Space>
            <Tag color={record.isAutoAssigned ? 'cyan' : 'blue'}>
              {member?.realName || `用户#${userId}`}
            </Tag>
            {record.isAutoAssigned && <Tag color="purple">自动</Tag>}
          </Space>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ASSIGNED' ? 'blue' : status === 'SWAP_PENDING' ? 'orange' : 'green'}>
          {status === 'ASSIGNED' ? '已分配' : status === 'SWAP_PENDING' ? '调班中' : '已完成'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => handleAssign(record)}>
          分配
        </Button>
      )
    }
  ]

  if (loading && !schedule) return <div style={{ textAlign: 'center', padding: 100 }}>加载中...</div>

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/schedules')}>
          返回
        </Button>
      </div>

      <Title level={4} className="page-title">
        {schedule?.name}
        <Tag color={schedule?.status === 'PUBLISHED' ? 'green' : 'default'} style={{ marginLeft: 12 }}>
          {schedule?.status === 'DRAFT' ? '草稿' : schedule?.status === 'PUBLISHED' ? '已发布' : '已归档'}
        </Tag>
      </Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="总时段" value={slots.length} prefix={<CalendarOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已分配" value={assignedCount} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="未分配" value={unassignedCount} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="分配进度" value={slots.length ? Math.round(assignedCount / slots.length * 100) : 0} suffix="%" />
            <Progress percent={slots.length ? Math.round(assignedCount / slots.length * 100) : 0} size="small" />
          </Card>
        </Col>
      </Row>

      {voteStats && (
        <Card title="投票统计" style={{ marginBottom: 24 }} size="small">
          <Row gutter={16}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: 24, color: '#52c41a' }}>{voteStats.approve}</Text>
                <div><Text type="secondary">赞成</Text></div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: 24, color: '#ff4d4f' }}>{voteStats.reject}</Text>
                <div><Text type="secondary">反对</Text></div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: 24, color: '#faad14' }}>{voteStats.abstain}</Text>
                <div><Text type="secondary">弃权</Text></div>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      <Card
        title="排班时段详情"
        extra={
          <Space>
            {schedule?.status === 'DRAFT' && slots.length === 0 && (
              <Button onClick={handleGenerateSlots}>生成时段</Button>
            )}
            {schedule?.status === 'DRAFT' && (
              <Button type="primary" icon={<ThunderboltOutlined />} onClick={handleAutoAssign}>
                自动排班
              </Button>
            )}
            {schedule?.status === 'DRAFT' && (
              <Button icon={<PlayCircleOutlined />} onClick={handlePublish}>
                发布
              </Button>
            )}
            {schedule?.status === 'PUBLISHED' && (
              <Button onClick={() => setVoteModal(true)}>
                投票
              </Button>
            )}
          </Space>
        }
      >
        <Table
          rowKey="id"
          dataSource={slots}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="分配值班人员"
        open={assignModal}
        onCancel={() => setAssignModal(false)}
        footer={null}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>时段: {assigningSlot && dayjs(assigningSlot.date).format('YYYY-MM-DD')} {weekDayMap[assigningSlot?.weekDay]} {assigningSlot?.startTime?.substring(0, 5)}-{assigningSlot?.endTime?.substring(0, 5)}</Text>
        </div>
        <Select
          style={{ width: '100%' }}
          placeholder="选择值班人员"
          onChange={handleAssignSubmit}
          loading={assigning}
        >
          {teamMembers.map(member => (
            <Option key={member.id} value={member.id}>{member.realName} ({member.username})</Option>
          ))}
        </Select>
      </Modal>

      <Modal
        title="对排班方案投票"
        open={voteModal}
        onCancel={() => setVoteModal(false)}
        onOk={handleVote}
      >
        <Select
          style={{ width: '100%' }}
          value={voteType}
          onChange={setVoteType}
        >
          <Option value="APPROVE">赞成</Option>
          <Option value="REJECT">反对</Option>
          <Option value="ABSTAIN">弃权</Option>
        </Select>
      </Modal>
    </div>
  )
}
