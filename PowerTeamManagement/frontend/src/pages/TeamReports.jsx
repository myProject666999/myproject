import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import Table from '../components/Table'
import Pagination from '../components/Pagination'
import Modal from '../components/Modal'
import dayjs from 'dayjs'

const TeamReports = () => {
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [dateFilter, setDateFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    fetchReports()
    fetchUsers()
  }, [page, pageSize, dateFilter, userFilter])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = { page, page_size: pageSize }
      if (dateFilter) params.date = dateFilter
      if (userFilter) params.user_id = userFilter
      const response = await api.get('/team-reports', { params })
      setReports(response.data.data)
      setTotal(response.data.total)
    } catch (error) {
      console.error('Failed to fetch team reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/all')
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleFilter = () => {
    setPage(1)
    fetchReports()
  }

  const viewReport = (report) => {
    setSelectedReport(report)
    setShowDetail(true)
  }

  const columns = [
    { key: 'user', title: '提交人', render: (_, row) => row.user?.real_name },
    { key: 'role', title: '角色', render: (_, row) => row.user?.role?.name },
    {
      key: 'report_date',
      title: '日期',
      render: (value) => dayjs(value).format('YYYY-MM-DD'),
    },
    {
      key: 'content',
      title: '工作内容',
      render: (value) => (
        <div className="max-w-xs truncate">{value || '暂无内容'}</div>
      ),
    },
    {
      key: 'created_at',
      title: '提交时间',
      render: (value) => dayjs(value).format('YYYY-MM-DD HH:mm'),
    },
    {
      key: 'actions',
      title: '操作',
      width: '100px',
      render: (_, row) => (
        <button onClick={() => viewReport(row)} className="text-blue-600 hover:text-blue-800">
          查看详情
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800">团队日报</h2>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              className="input w-auto"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            <select
              className="input w-auto"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            >
              <option value="">全部人员</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.real_name}
                </option>
              ))}
            </select>
            <button onClick={handleFilter} className="btn btn-secondary">
              筛选
            </button>
          </div>
        </div>
        <Table columns={columns} data={reports} loading={loading} />
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={`日报详情 - ${selectedReport?.user?.real_name}`}
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">提交人：</span>
                <span className="font-medium">{selectedReport.user?.real_name}</span>
              </div>
              <div>
                <span className="text-gray-500">角色：</span>
                <span className="font-medium">{selectedReport.user?.role?.name}</span>
              </div>
              <div>
                <span className="text-gray-500">日期：</span>
                <span className="font-medium">
                  {dayjs(selectedReport.report_date).format('YYYY-MM-DD')}
                </span>
              </div>
              <div>
                <span className="text-gray-500">提交时间：</span>
                <span className="font-medium">
                  {dayjs(selectedReport.created_at).format('YYYY-MM-DD HH:mm')}
                </span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-2">今日工作内容</h4>
              <p className="text-gray-600 whitespace-pre-wrap">
                {selectedReport.content || '暂无内容'}
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-2">工作进展</h4>
              <p className="text-gray-600 whitespace-pre-wrap">
                {selectedReport.work_progress || '暂无内容'}
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-2">明日计划</h4>
              <p className="text-gray-600 whitespace-pre-wrap">
                {selectedReport.plan_tomorrow || '暂无内容'}
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-700 mb-2">遇到的问题</h4>
              <p className="text-gray-600 whitespace-pre-wrap">
                {selectedReport.problems || '暂无内容'}
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button onClick={() => setShowDetail(false)} className="btn btn-secondary">
                关闭
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default TeamReports
