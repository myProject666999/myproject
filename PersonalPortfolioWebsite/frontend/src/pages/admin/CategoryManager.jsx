import { useState, useEffect } from 'react'
import { categoryAPI } from '../../services/api'

export default function CategoryManager() {
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({ name: '', slug: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await categoryAPI.getCategories()
      setCategories(res.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingCategory) {
        await categoryAPI.updateCategory(editingCategory.id, formData)
      } else {
        await categoryAPI.createCategory(formData)
      }
      fetchCategories()
      closeModal()
    } catch (error) {
      alert(error.response?.data?.error || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('确定删除这个分类吗？')) {
      await categoryAPI.deleteCategory(id)
      fetchCategories()
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, slug: category.slug })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setFormData({ name: '', slug: '' })
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">分类管理</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + 新建分类
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">创建时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4">{category.id}</td>
                <td className="px-6 py-4 font-medium">{category.name}</td>
                <td className="px-6 py-4 text-gray-500">{category.slug}</td>
                <td className="px-6 py-4 text-gray-500">{new Date(category.created_at).toLocaleDateString('zh-CN')}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(category)} className="text-indigo-600 hover:text-indigo-900">编辑</button>
                    <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-900">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6">{editingCategory ? '编辑分类' : '新建分类'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">名称 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="form-input"
                  placeholder="留空将自动生成"
                />
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
