import { useState, useEffect } from 'react'
import { skillAPI } from '../../services/api'

export default function SkillManager() {
  const [skills, setSkills] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingSkill, setEditingSkill] = useState(null)
  const [formData, setFormData] = useState({ name: '', icon: '', level: 0, category: '', sort_order: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const res = await skillAPI.getSkills()
      setSkills(res.data)
    } catch (error) {
      console.error('Failed to fetch skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingSkill) {
        await skillAPI.updateSkill(editingSkill.id, formData)
      } else {
        await skillAPI.createSkill(formData)
      }
      fetchSkills()
      closeModal()
    } catch (error) {
      alert(error.response?.data?.error || '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('确定删除这个技能吗？')) {
      await skillAPI.deleteSkill(id)
      fetchSkills()
    }
  }

  const handleEdit = (skill) => {
    setEditingSkill(skill)
    setFormData({
      name: skill.name,
      icon: skill.icon || '',
      level: skill.level,
      category: skill.category || '',
      sort_order: skill.sort_order,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingSkill(null)
    setFormData({ name: '', icon: '', level: 0, category: '', sort_order: 0 })
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div></div>

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">技能管理</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + 新建技能
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">图标</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">分类</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">熟练度</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">排序</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {skills.map((skill) => (
              <tr key={skill.id}>
                <td className="px-6 py-4 text-2xl">{skill.icon || '-'}</td>
                <td className="px-6 py-4 font-medium">{skill.name}</td>
                <td className="px-6 py-4 text-gray-500">{skill.category || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${skill.level}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-500">{skill.level}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500">{skill.sort_order}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(skill)} className="text-indigo-600 hover:text-indigo-900">编辑</button>
                    <button onClick={() => handleDelete(skill.id)} className="text-red-600 hover:text-red-900">删除</button>
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
            <h2 className="text-xl font-bold mb-6">{editingSkill ? '编辑技能' : '新建技能'}</h2>
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
                <label className="form-label">图标 (Emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="form-input"
                  placeholder="例如: 💻"
                />
              </div>
              <div className="form-group">
                <label className="form-label">分类</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-input"
                  placeholder="例如: Frontend, Backend"
                />
              </div>
              <div className="form-group">
                <label className="form-label">熟练度: {formData.level}%</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="form-group">
                <label className="form-label">排序</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                  className="form-input"
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
