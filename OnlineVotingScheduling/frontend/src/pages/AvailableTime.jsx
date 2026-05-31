import React, { useEffect, useState } from 'react'
import { Card, Form, TimePicker, Button, Select, message, Row, Col, Tag, Spin, Typography, Space } from 'antd'
import { PlusOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { availableTimeApi, teamApi } from '../api'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { Option } = Select

const weekDays = [
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' },
  { value: 7, label: '周日' }
]

export default function AvailableTime() {
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [times, setTimes] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    try {
      const res = await teamApi.getMyTeams()
      setTeams(res.data || [])
      if (res.data?.length > 0) {
        setSelectedTeam(res.data[0].id)
        loadTimes(res.data[0].id)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const loadTimes = async (teamId) => {
    setLoading(true)
    try {
      const res = await availableTimeApi.getMyByTeam(teamId)
      setTimes(res.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleTeamChange = (teamId) => {
    setSelectedTeam(teamId)
    loadTimes(teamId)
  }

  const handleAddTime = () => {
    setTimes([...times, { weekDay: 1, startTime: '09:00', endTime: '18:00', priority: 0 }])
  }

  const handleRemoveTime = (index) => {
    const newTimes = [...times]
    newTimes.splice(index, 1)
    setTimes(newTimes)
  }

  const handleTimeChange = (index, field, value) => {
    const newTimes = [...times]
    newTimes[index][field] = value
    setTimes(newTimes)
  }

  const handleSave = async () => {
    if (!selectedTeam) {
      message.warning('请先选择团队')
      return
    }
    setSaving(true)
    try {
      const data = times.map(t => ({
        teamId: selectedTeam,
        weekDay: t.weekDay,
        startTime: t.startTime,
        endTime: t.endTime,
        priority: t.priority
      }))
      await availableTimeApi.saveMy(selectedTeam, data)
      message.success('保存成功')
      loadTimes(selectedTeam)
    } catch (error) {
      message.error(error.message || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Title level={4} className="page-title">可用时间设置</Title>

      <Card style={{ marginBottom: 24 }}>
        <Space style={{ marginBottom: 16 }}>
          <Text strong>选择团队:</Text>
          <Select
            style={{ width: 200 }}
            value={selectedTeam}
            onChange={handleTeamChange}
            placeholder="请选择团队"
          >
            {teams.map(team => (
              <Option key={team.id} value={team.id}>{team.name}</Option>
            ))}
          </Select>
        </Space>

        {selectedTeam && (
          <>
            <Text type="secondary">设置您每周可值班的时间段，系统将根据此信息自动排班</Text>
          </>
        )}
      </Card>

      {selectedTeam && (
        <Spin spinning={loading}>
          <Card
            title="我的可用时间"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTime}>
                添加时间段
              </Button>
            }
          >
            {times.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                暂无可用时间，请点击上方按钮添加
              </div>
            ) : (
              <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                {times.map((time, index) => (
                  <Card
                    key={index}
                    size="small"
                    style={{ marginBottom: 12 }}
                    extra={
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleRemoveTime(index)}
                      />
                    }
                  >
                    <Row gutter={16} align="middle">
                      <Col span={6}>
                        <Text strong>星期:</Text>
                        <Select
                          value={time.weekDay}
                          onChange={(val) => handleTimeChange(index, 'weekDay', val)}
                          style={{ width: '100%', marginLeft: 8 }}
                        >
                          {weekDays.map(day => (
                            <Option key={day.value} value={day.value}>{day.label}</Option>
                          ))}
                        </Select>
                      </Col>
                      <Col span={8}>
                        <Text strong>时间:</Text>
                        <TimePicker.RangePicker
                          value={[dayjs(time.startTime, 'HH:mm'), dayjs(time.endTime, 'HH:mm')]}
                          onChange={(vals) => {
                            if (vals && vals[0] && vals[1]) {
                              handleTimeChange(index, 'startTime', vals[0].format('HH:mm'))
                              handleTimeChange(index, 'endTime', vals[1].format('HH:mm'))
                            }
                          }}
                          style={{ marginLeft: 8 }}
                        />
                      </Col>
                      <Col span={6}>
                        <Text strong>优先级:</Text>
                        <Select
                          value={time.priority}
                          onChange={(val) => handleTimeChange(index, 'priority', val)}
                          style={{ width: '100%', marginLeft: 8 }}
                        >
                          <Option value={0}>普通</Option>
                          <Option value={1}>较高</Option>
                          <Option value={2}>最高</Option>
                        </Select>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </div>
            )}

            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
                保存设置
              </Button>
            </div>
          </Card>
        </Spin>
      )}
    </div>
  )
}
