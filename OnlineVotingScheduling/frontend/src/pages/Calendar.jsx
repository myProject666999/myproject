import React, { useEffect, useState } from 'react'
import { Card, Calendar, Badge, Modal, Tag, Typography, Select, Space, Button } from 'antd'
import { teamApi, scheduleSlotApi } from '../api'
import dayjs from 'dayjs'
import { useUserStore } from '../store'

const { Title, Text } = Typography
const { Option } = Select

export default function CalendarView() {
  const { user } = useUserStore()
  const [teams, setTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [slots, setSlots] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [dateSlots, setDateSlots] = useState([])

  useEffect(() => {
    loadTeams()
  }, [])

  const loadTeams = async () => {
    try {
      const res = await teamApi.getMyTeams()
      setTeams(res.data || [])
      if (res.data?.length > 0) {
        setSelectedTeam(res.data[0].id)
        loadSlots(res.data[0].id)
        loadMembers(res.data[0].id)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const loadSlots = async (teamId) => {
    setLoading(true)
    try {
      const start = dayjs().startOf('month').format('YYYY-MM-DD')
      const end = dayjs().endOf('month').format('YYYY-MM-DD')
      const schedulesRes = await fetch(`/api/schedules/team/${teamId}`)
      const schedulesData = await schedulesRes.json()

      const allSlots = []
      for (const schedule of (schedulesData.data || [])) {
        try {
          const res = await scheduleSlotApi.getByScheduleAndRange(
            schedule.id,
            dayjs().startOf('month').format('YYYY-MM-DD'),
            dayjs().endOf('month').format('YYYY-MM-DD')
          )
          allSlots.push(...(res.data || []))
        } catch (e) {
          console.error(e)
        }
      }
      setSlots(allSlots)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async (teamId) => {
    try {
      const res = await teamApi.getMembers(teamId)
      setUsers(res.data || [])
    } catch (error) {
      console.error(error)
    }
  }

  const getUserName = (id) => {
    const u = users.find(x => x.id === id)
    return u?.realName || u?.username || `#${id}`
  }

  const getListData = (value) => {
    const dateStr = value.format('YYYY-MM-DD')
    return slots.filter(s => dayjs(s.date).format('YYYY-MM-DD') === dateStr)
      .map(s => ({
        type: s.userId ? 'success' : 'error',
        content: `${s.startTime?.substring(0, 5)}-${s.endTime?.substring(0, 5)} ${s.userId ? getUserName(s.userId) : '未分配'}`
      }))
  }

  const handleSelect = (value) => {
    const dateStr = value.format('YYYY-MM-DD')
    const daySlots = slots.filter(s => dayjs(s.date).format('YYYY-MM-DD') === dateStr)
    setSelectedDate(dateStr)
    setDateSlots(daySlots)
    setDetailModal(true)
  }

  const handlePanelChange = (value) => {
    if (selectedTeam) {
      loadSlots(selectedTeam)
    }
  }

  return (
    <div>
      <Title level={4} className="page-title">日历视图</Title>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Text>团队:</Text>
          <Select
            style={{ width: 200 }}
            value={selectedTeam}
            onChange={(val) => { setSelectedTeam(val); loadSlots(val); loadMembers(val) }}
          >
            {teams.map(t => (
              <Option key={t.id} value={t.id}>{t.name}</Option>
            ))}
          </Select>
        </Space>

        <Calendar
          cellRender={(current) => {
            const listData = getListData(current)
            return (
              <ul className="calendar-events" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {listData.slice(0, 3).map((item, idx) => (
                  <li key={idx} style={{ fontSize: 12, marginBottom: 2 }}>
                    <Badge
                      status={item.type}
                      text={item.content}
                    />
                  </li>
                ))}
                {listData.length > 3 && (
                  <li style={{ fontSize: 12, color: '#999' }}>等{listData.length}项...</li>
                )}
              </ul>
            )
          }}
          onSelect={handleSelect}
          onPanelChange={handlePanelChange}
        />
      </Card>

      <Modal
        title={`${selectedDate} 排班详情`}
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={null}
        width={600}
      >
        {dateSlots.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>当日无排班</div>
        ) : (
          dateSlots.map((slot, idx) => (
            <Card key={idx} size="small" style={{ marginBottom: 8 }}>
              <Space>
                <Tag color="blue">
                  {slot.startTime?.substring(0, 5)} - {slot.endTime?.substring(0, 5)}
                </Tag>
                {slot.userId ? (
                  <Tag color="green">{getUserName(slot.userId)}</Tag>
                ) : (
                  <Tag color="red">未分配</Tag>
                )}
                <Tag>{['周一','周二','周三','周四','周五','周六','周日'][slot.weekDay - 1]}</Tag>
              </Space>
            </Card>
          ))
        )}
      </Modal>
    </div>
  )
}
