import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { projectAPI, contactAPI } from '../../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState({ projects: 0, contacts: 0, unreadContacts: 0 })
  const [recentProjects, setRecentProjects] = useState([])
  const [recentContacts, setRecentContacts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, contactsRes] = await Promise.all([
          projectAPI.getAllProjects(),
          contactAPI.getContacts(),
        ])
        setStats({
          projects: projectsRes.data.length,
          contacts: contactsRes.data.length,
          unreadContacts: contactsRes.data.filter(c => !c.read).length,
        })
        setRecentProjects(projectsRes.data.slice(0, 5))
        setRecentContacts(contactsRes.data.slice(0, 5))
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    )
  }

  const statCards = [
    { label: '作品总数', value: stats.projects, color: 'from-blue-500 to-blue-600', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { label: '联系消息', value: stats.contacts, color: 'from-green-500 to-green-600', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { label: '未读消息', value: stats.unreadContacts, color: 'from-orange-500 to-orange-600', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className={`card p-6 text-white bg-gradient-to-r ${stat.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">{stat.label}</p>
                <p className="text-4xl font-bold mt-1">{stat.value}</p>
              </div>
              <svg className="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">最近作品</h2>
            <Link to="/admin/projects" className="text-indigo-600 text-sm hover:underline">查看全部</Link>
          </div>
          <div className="space-y-3">
            {recentProjects.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无作品</p>
            ) : (
              recentProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium">{project.title}</p>
                    <p className="text-sm text-gray-500">{new Date(project.created_at).toLocaleDateString('zh-CN')}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    project.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {project.published ? '已发布' : '草稿'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">最近消息</h2>
            <Link to="/admin/contacts" className="text-indigo-600 text-sm hover:underline">查看全部</Link>
          </div>
          <div className="space-y-3">
            {recentContacts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">暂无消息</p>
            ) : (
              recentContacts.map((contact) => (
                <div key={contact.id} className="py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium flex items-center gap-2">
                      {contact.name}
                      {!contact.read && <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>}
                    </p>
                    <span className="text-xs text-gray-500">{new Date(contact.created_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{contact.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
