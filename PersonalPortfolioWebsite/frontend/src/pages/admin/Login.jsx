import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../../services/api'

export default function AdminLogin() {
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await authAPI.login(formData)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.error || '登录失败，请检查用户名和密码')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-pink-50 p-4">
      <div className="card p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">后台管理</h1>
        <p className="text-gray-500 text-center mb-8">请登录以继续</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">用户名</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="form-input"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={submitting}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                登录中...
              </span>
            ) : '登录'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          默认账号: admin / admin123
        </p>
      </div>
    </div>
  )
}
