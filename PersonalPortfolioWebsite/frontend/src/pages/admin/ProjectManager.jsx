import { useState, useEffect } from 'react'
import { projectAPI, categoryAPI, uploadAPI } from '../../services/api'

export default function ProjectManager() {
  const [projects, setProjects] = useState([])
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    title: '', slug: '', description: '', content: '', image_url: '', project_url: '', github_url: '', category_id: '', tags: '', featured: false, published: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    Promise.all([projectAPI.getAllProjects(), categoryAPI.getCategories()])
      .then(([projectsRes, categoriesRes]) => {
        setProjects(projectsRes.data)
        setCategories(categoriesRes.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingProject) {
        await projectAPI.updateProject(editingProject.id, formData)
      } else {
        await projectAPI.createProject(formData)
      }
      fetchData()
      closeModal()
    } catch (error) {
      alert(error.response?.data?.error || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('确定删除这个作品吗？')) {
      await projectAPI.deleteProject(id)
      fetchData()
    }
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData({
      title: project.title,
      slug: project.slug,
      description: project.description,
      content: project.content || '',
      image_url: project.image_url || '',
      project_url: project.project_url || '',
      github_url: project.github_url || '',
      category_id: project.category_id || '',
      tags: project.tags || '',
      featured: project.featured,
      published: project.published,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProject(null)
    setFormData({ title: '', slug: '', description: '', content: '', image_url: '', project_url: '', github_url: '', category_id: '', tags: '', featured: false, published: true })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const res = await uploadAPI.uploadImage(file)
        setFormData({ ...formData, image_url: res.data.url })
      } catch (error) {
        alert('上传失败')
      }
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">作品管理</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + 新建作品
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">标题</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">精选</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">浏览</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {project.image_url && <img src={project.image_url} alt="" className="w-10 h-10 rounded object-cover" />}
                    <div>
                      <p className="font-medium">{project.title}</p>
                      <p className="text-sm text-gray-500">{project.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{project.category?.name || '-'}</td>
                <td className="px-6 py-4">{project.featured ? '是' : '否'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${project.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {project.published ? '已发布' : '草稿'}
                  </span>
                </td>
                <td className="px-6 py-4">{project.views}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(project)} className="text-indigo-600 hover:text-indigo-900">编辑</button>
                    <button onClick={() => handleDelete(project.id)} className="text-red-600 hover:text-red-900">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">{editingProject ? '编辑作品' : '新建作品'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="form-group md:col-span-2">
                  <label className="form-label">标题 *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug</label>
                  <input type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">分类</label>
                  <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} className="form-select">
                    <option value="">选择分类</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group md:col-span-2">
                  <label className="form-label">描述 *</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="form-textarea" required rows={3} />
                </div>
                <div className="form-group md:col-span-2">
                  <label className="form-label">内容 (Markdown)</label>
                  <textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="form-textarea" rows={8} />
                </div>
                <div className="form-group">
                  <label className="form-label">封面图</label>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="form-input" />
                  {formData.image_url && <img src={formData.image_url} alt="" className="mt-2 w-32 h-32 object-cover rounded" />}
                </div>
                <div className="form-group">
                  <label className="form-label">图片URL</label>
                  <input type="url" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">项目链接</label>
                  <input type="url" value={formData.project_url} onChange={(e) => setFormData({...formData, project_url: e.target.value})} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">GitHub链接</label>
                  <input type="url" value={formData.github_url} onChange={(e) => setFormData({...formData, github_url: e.target.value})} className="form-input" />
                </div>
                <div className="form-group md:col-span-2">
                  <label className="form-label">标签 (逗号分隔)</label>
                  <input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="form-input" placeholder="React, Node.js, MongoDB" />
                </div>
                <div className="form-group flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.featured} onChange={(e) => setFormData({...formData, featured: e.target.checked})} className="w-4 h-4" />
                    精选作品
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.published} onChange={(e) => setFormData({...formData, published: e.target.checked})} className="w-4 h-4" />
                    发布
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? '保存中...' : '保存'}
                </button>
                <button type="button" onClick={closeModal} className="btn btn-secondary">取消</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
