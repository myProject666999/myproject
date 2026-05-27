import { useState, useEffect } from 'react'
import { aboutAPI, uploadAPI } from '../../services/api'

export default function AboutEditor() {
  const [formData, setFormData] = useState({
    name: '', title: '', bio: '', avatar_url: '', email: '', phone: '', location: '', resume_url: '', social_links: '[]'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAbout()
  }, [])

  const fetchAbout = async () => {
    try {
      const res = await aboutAPI.getAbout()
      const data = res.data || {}
      setFormData({
        name: data.name || '',
        title: data.title || '',
        bio: data.bio || '',
        avatar_url: data.avatar_url || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        resume_url: data.resume_url || '',
        social_links: data.social_links || '[]',
      })
    } catch (error) {
      console.error('Failed to fetch about:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await aboutAPI.updateAbout(formData)
      alert('保存成功')
    } catch (error) {
      alert(error.response?.data?.error || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const res = await uploadAPI.uploadImage(file)
        setFormData({ ...formData, avatar_url: res.data.url })
      } catch (error) {
        alert('上传失败')
      }
    }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const res = await uploadAPI.uploadImage(file)
        setFormData({ ...formData, resume_url: res.data.url })
      } catch (error) {
        alert('上传失败')
      }
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">关于信息</h1>

      <div className="card p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">姓名</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">职位/头衔</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group md:col-span-2">
              <label className="form-label">个人简介</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="form-textarea"
                rows={4}
              />
            </div>
            <div className="form-group">
              <label className="form-label">头像</label>
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="form-input mb-2" />
              {formData.avatar_url && (
                <img src={formData.avatar_url} alt="avatar" className="w-24 h-24 rounded-full object-cover" />
              )}
            </div>
            <div className="form-group">
              <label className="form-label">邮箱</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">电话</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">所在地</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">简历</label>
              <input type="file" onChange={handleResumeUpload} className="form-input mb-2" />
              {formData.resume_url && (
                <a href={formData.resume_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  查看已上传的文件
                </a>
              )}
            </div>
            <div className="form-group md:col-span-2">
              <label className="form-label">社交媒体链接 (JSON 格式)</label>
              <textarea
                value={formData.social_links}
                onChange={(e) => setFormData({ ...formData, social_links: e.target.value })}
                className="form-textarea"
                rows={4}
                placeholder='[{"name": "GitHub", "url": "https://github.com/..."}]'
              />
            </div>
          </div>
          <div className="mt-6">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
