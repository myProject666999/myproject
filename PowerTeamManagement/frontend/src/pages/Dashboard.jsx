import React, { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import api from '../utils/api'
import dayjs from 'dayjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const Dashboard = () => {
  const [stats, setStats] = useState({})
  const [statusData, setStatusData] = useState([])
  const [conversionData, setConversionData] = useState([])
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, statusRes, conversionRes, deadlinesRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/opportunities-by-status'),
        api.get('/dashboard/conversion-stats'),
        api.get('/dashboard/upcoming-deadlines'),
      ])
      setStats(statsRes.data)
      setStatusData(statusRes.data)
      setConversionData(conversionRes.data)
      setDeadlines(deadlinesRes.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
    }).format(value || 0)
  }

  const statusChartData = {
    labels: statusData.map((d) => d.label),
    datasets: [
      {
        label: '业务机会数量',
        data: statusData.map((d) => d.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 1,
      },
    ],
  }

  const conversionChartData = {
    labels: conversionData.map((d) => d.month),
    datasets: [
      {
        label: '总机会数',
        data: conversionData.map((d) => d.total),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        yAxisID: 'y',
      },
      {
        label: '完成数',
        data: conversionData.map((d) => d.completed),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        yAxisID: 'y',
      },
    ],
  }

  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          boxWidth: 12,
          font: {
            size: 12
          }
        }
      }
    },
    cutout: '60%',
  }

  const conversionChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { label: '新机会', class: 'bg-blue-100 text-blue-800' },
      initial_contact: { label: '初步接触中', class: 'bg-green-100 text-green-800' },
      requirement_analysis: { label: '需求分析中', class: 'bg-yellow-100 text-yellow-800' },
      negotiation: { label: '协商方案中', class: 'bg-orange-100 text-orange-800' },
      commercial_negotiation: { label: '商业谈判中', class: 'bg-purple-100 text-purple-800' },
      completed: { label: '已完成', class: 'bg-green-100 text-green-800' },
      lost: { label: '已流失', class: 'bg-red-100 text-red-800' },
    }
    const config = statusConfig[status] || { label: status, class: 'bg-gray-100 text-gray-800' }
    return <span className={`status-badge ${config.class}`}>{config.label}</span>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="text-sm text-gray-500 mb-2">本月业务机会</div>
          <div className="text-3xl font-bold text-gray-800">{stats.total_opportunities || 0}</div>
          <div className="text-sm text-gray-400 mt-1">个</div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-gray-500 mb-2">本月已完成</div>
          <div className="text-3xl font-bold text-green-600">{stats.completed_opportunities || 0}</div>
          <div className="text-sm text-gray-400 mt-1">个</div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-gray-500 mb-2">本月总金额</div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.total_amount)}</div>
        </div>
        <div className="card p-6">
          <div className="text-sm text-gray-500 mb-2">转化率</div>
          <div className="text-3xl font-bold text-purple-600">
            {(stats.conversion_rate || 0).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400 mt-1">已完成/总数</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">本月业务机会分布</h3>
          <div className="flex justify-center">
            <div style={{ width: '300px', height: '250px' }}>
              <Doughnut data={statusChartData} options={statusChartOptions} />
            </div>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">近6个月转化情况</h3>
          <div className="h-64">
            <Bar data={conversionChartData} options={conversionChartOptions} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">即将结束的业务机会（14天内）</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>机会名称</th>
                <th>客户</th>
                <th>金额</th>
                <th>状态</th>
                <th>负责人</th>
                <th>预计结束时间</th>
                <th>剩余天数</th>
              </tr>
            </thead>
            <tbody>
              {deadlines.map((item) => {
                const daysLeft = dayjs(item.expected_close).diff(dayjs(), 'day') + 1
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="font-medium">{item.name}</td>
                    <td>{item.customer?.name}</td>
                    <td>{formatCurrency(item.amount)}</td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>{item.assigned_to?.real_name}</td>
                    <td>{dayjs(item.expected_close).format('YYYY-MM-DD')}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          daysLeft <= 3
                            ? 'bg-red-100 text-red-800'
                            : daysLeft <= 7
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {daysLeft}天
                      </span>
                    </td>
                  </tr>
                )
              })}
              {deadlines.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    暂无即将结束的业务机会
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
