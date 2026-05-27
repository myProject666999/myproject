import { useState, useEffect } from 'react'
import { contactAPI } from '../../services/api'

export default function ContactMessages() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchContacts()
  }, [filter])

  const fetchContacts = async () => {
    try {
      const params = filter === 'unread' ? { unread: 'true' } : {}
      const res = await contactAPI.getContacts(params)
      setContacts(res.data)
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await contactAPI.markRead(id)
      fetchContacts()
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('确定删除这条消息吗？')) {
      await contactAPI.deleteContact(id)
      fetchContacts()
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">联系消息</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部 ({contacts.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            未读 ({contacts.filter(c => !c.read).length})
          </button>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500">暂无消息</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div key={contact.id} className={`card p-6 ${!contact.read ? 'border-l-4 border-indigo-500' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold">{contact.name}</h3>
                    {!contact.read && <span className="px-2 py-1 bg-indigo-100 text-indigo-600 text-xs rounded-full">未读</span>}
                    {contact.is_spam && <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">垃圾</span>}
                  </div>
                  <p className="text-sm text-gray-500">{contact.email}</p>
                  {contact.subject && <p className="text-sm text-gray-500 mt-1">主题: {contact.subject}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">
                    {new Date(contact.created_at).toLocaleString('zh-CN')}
                  </span>
                  <div className="flex gap-2">
                    {!contact.read && (
                      <button onClick={() => handleMarkRead(contact.id)} className="text-indigo-600 hover:text-indigo-900 text-sm">
                        标记已读
                      </button>
                    )}
                    <button onClick={() => handleDelete(contact.id)} className="text-red-600 hover:text-red-900 text-sm">
                      删除
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{contact.message}</p>
              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
                <span>IP: {contact.ip_address}</span>
                {contact.user_agent && <span className="ml-4">UA: {contact.user_agent.substring(0, 100)}...</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
