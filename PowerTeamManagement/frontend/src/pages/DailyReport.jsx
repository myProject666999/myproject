import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import dayjs from 'dayjs'

const DailyReport = () => {
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [reports, setReports] = useState([])
  const [formData, setFormData] = useState({
    content: '',
    work_progress: '',
    plan_tomorrow: '',
    problems: '',
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchReport()
    fetchReportsHistory()
  }, [currentDate])

  const fetchReport = async () => {
    try {
      const response = await api.get(`/my-reports/date/${currentDate.format('YYYY-MM-DD')}`)
      const report = response.data
      if (report && report.id) {
        setFormData({
          content: report.content || '',
          work_progress: report.work_progress || '',
          plan_tomorrow: report.plan_tomorrow || '',
          problems: report.problems || '',
        })
      } else {
        setFormData({
          content: '',
          work_progress: '',
          plan_tomorrow: '',
          problems: '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch report:', error)
    }
  }

  const fetchReportsHistory = async () => {
    setLoading(true)
    try {
      const response = await api.get('/my-reports', { params: { page_size: 30 } })
      setReports(response.data.data)
    } catch (error) {
      console.error('Failed to fetch reports history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/my-reports', {
        report_date: currentDate.toISOString(),
        ...formData,
      })
      alert('保存成功')
      fetchReportsHistory()
    } catch (error) {
      console.error('Failed to save report:', error)
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const goToPrevDay = () => setCurrentDate(currentDate.subtract(1, 'day'))
  const goToNextDay = () => setCurrentDate(currentDate.add(1, 'day'))
  const goToToday = () => setCurrentDate(dayjs())

  const selectDate = (date) => {
    setCurrentDate(dayjs(date))
  }

  const isWorkDay = (date) => {
    const day = date.day()
    return day !== 0 && day !== 6
  }

  const hasReport = (date) => {
    return reports.some(
      (r) => dayjs(r.report_date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="card">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={goToPrevDay} className="btn btn-secondary px-3 py-1">
                ◀ 上一天
              </button>
              <span className="text-xl font-semibold text-gray-800">
                {currentDate.format('YYYY年MM月DD日')}
                {isWorkDay(currentDate) ? (
                  <span className="ml-2 text-sm text-green-600">(工作日)</span>
                ) : (
                  <span className="ml-2 text-sm text-orange-600">(休息日)</span>
                )}
              </span>
              <button onClick={goToNextDay} className="btn btn-secondary px-3 py-1">
                下一天 ▶
              </button>
            </div>
            <button onClick={goToToday} className="btn btn-primary px-3 py-1">
              今天
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div>
              <label className="label">今日工作内容</label>
              <textarea
                className="input h-32"
                placeholder="请填写今日工作内容..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>
            <div>
              <label className="label">工作进展</label>
              <textarea
                className="input h-24"
                placeholder="请填写工作进展情况..."
                value={formData.work_progress}
                onChange={(e) => setFormData({ ...formData, work_progress: e.target.value })}
              />
            </div>
            <div>
              <label className="label">明日计划</label>
              <textarea
                className="input h-24"
                placeholder="请填写明日工作计划..."
                value={formData.plan_tomorrow}
                onChange={(e) => setFormData({ ...formData, plan_tomorrow: e.target.value })}
              />
            </div>
            <div>
              <label className="label">遇到的问题</label>
              <textarea
                className="input h-20"
                placeholder="请填写遇到的问题和困难..."
                value={formData.problems}
                onChange={(e) => setFormData({ ...formData, problems: e.target.value })}
              />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn btn-primary px-8">
                {saving ? '保存中...' : '保存日报'}
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-800">时间线</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : reports.length === 0 ? (
              <p className="text-center text-gray-500 py-8">暂无日报记录</p>
            ) : (
              <div className="space-y-4">
                {reports.slice(0, 10).map((report) => (
                  <div
                    key={report.id}
                    onClick={() => selectDate(report.report_date)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      dayjs(report.report_date).format('YYYY-MM-DD') ===
                      currentDate.format('YYYY-MM-DD')
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 mt-1.5 rounded-full bg-blue-500"></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {dayjs(report.report_date).format('YYYY年MM月DD日')}
                        </div>
                        {report.content && (
                          <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {report.content}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-800">{currentDate.format('YYYY年MM月')}</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
                <div key={day} className="py-2 text-gray-500 font-medium">
                  {day}
                </div>
              ))}
              {Array.from({ length: currentDate.startOf('month').day() }).map((_, i) => (
                <div key={`empty-${i}`}></div>
              ))}
              {Array.from({ length: currentDate.daysInMonth() }).map((_, i) => {
                const date = currentDate.date(i + 1)
                const isToday = date.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
                const isSelected =
                  date.format('YYYY-MM-DD') === currentDate.format('YYYY-MM-DD')
                const isWeekend = date.day() === 0 || date.day() === 6
                const hasReportForDate = hasReport(date)

                return (
                  <button
                    key={i}
                    onClick={() => selectDate(date)}
                    className={`py-2 rounded text-sm transition-colors ${
                      isSelected
                        ? 'bg-blue-500 text-white'
                        : isToday
                        ? 'bg-blue-100 text-blue-600'
                        : hasReportForDate
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : isWeekend
                        ? 'text-gray-400 hover:bg-gray-100'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span>选中日期</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-100"></div>
                <span>今天</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-100"></div>
                <span>有日报</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DailyReport
