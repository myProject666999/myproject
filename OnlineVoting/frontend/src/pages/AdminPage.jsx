import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { activityApi } from '../api'

export default function AdminPage() {
  const [list, setList] = useState([])
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', type: 1,
    start_time: dayjs().format('YYYY-MM-DDTHH:mm'),
    end_time: dayjs().add(7, 'day').format('YYYY-MM-DDTHH:mm'),
    options: [{ name: '', sort_order: 1 }]
  })

  const loadList = async () => {
    const res = await activityApi.list({ page: 1, size: 50 })
    if (res.code === 0) setList(res.data.items)
  }

  useEffect(() => { loadList() }, [])

  const resetForm = () => {
    setForm({
      title: '', description: '', type: 1,
      start_time: dayjs().format('YYYY-MM-DDTHH:mm'),
      end_time: dayjs().add(7, 'day').format('YYYY-MM-DDTHH:mm'),
      options: [{ name: '', sort_order: 1 }]
    })
    setEditing(null)
  }

  const handleCreate = () => {
    resetForm()
    setShowForm(true)
  }

  const handleEdit = (act) => {
    setForm({
      id: act.id,
      title: act.title,
      description: act.description,
      type: act.type,
      start_time: dayjs(act.start_time).format('YYYY-MM-DDTHH:mm'),
      end_time: dayjs(act.end_time).format('YYYY-MM-DDTHH:mm'),
      options: (act.options || []).map(o => ({ id: o.id, name: o.name, sort_order: o.sort_order }))
    })
    setEditing(act.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除该活动吗？')) return
    const res = await activityApi.remove(id)
    if (res.code === 0) {
      alert('删除成功')
      loadList()
    } else {
      alert(res.message)
    }
  }

  const handleSubmit = async () => {
    if (!form.title) return alert('请输入标题')
    if (form.options.filter(o => !o.name).length > 0) return alert('请填写所有选项名称')

    const payload = {
      ...form,
      start_time: new Date(form.start_time).toISOString(),
      end_time: new Date(form.end_time).toISOString()
    }

    let res
    if (editing) {
      res = await activityApi.update(editing, payload)
    } else {
      res = await activityApi.create(payload)
    }
    if (res.code === 0) {
      alert(editing ? '更新成功' : '创建成功')
      setShowForm(false)
      resetForm()
      loadList()
    } else {
      alert(res.message)
    }
  }

  const addOption = () => {
    setForm({ ...form, options: [...form.options, { name: '', sort_order: form.options.length + 1 }] })
  }

  const removeOption = (idx) => {
    if (form.options.length <= 1) return
    setForm({ ...form, options: form.options.filter((_, i) => i !== idx) })
  }

  const updateOption = (idx, field, val) => {
    const newOpts = form.options.slice()
    newOpts[idx][field] = val
    setForm({ ...form, options: newOpts })
  }

  return (
    <div>
      <h2 className="page-title">后台配置</h2>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: '#374151' }}>活动管理</h3>
          <button className="btn btn-primary" onClick={handleCreate}>+ 新建活动</button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <h3 style={{ marginBottom: 16, color: '#374151' }}>{editing ? '编辑活动' : '新建活动'}</h3>
          <div className="form-group">
            <label className="form-label">活动标题</label>
            <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="请输入标题" />
          </div>
          <div className="form-group">
            <label className="form-label">活动描述</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="请输入描述" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">活动类型</label>
              <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: parseInt(e.target.value) })}>
                <option value={1}>投票活动</option>
                <option value={2}>抽奖活动</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">开始时间</label>
              <input type="datetime-local" className="form-input" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">结束时间</label>
              <input type="datetime-local" className="form-input" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
            </div>
          </div>

          <h4 style={{ margin: '20px 0 10px', color: '#374151' }}>{form.type === 1 ? '选项' : '奖品'}</h4>
          {form.options.map((opt, idx) => (
            <div className="option-editor" key={idx}>
              <div className="form-row">
                <input className="form-input" placeholder={form.type === 1 ? '选项名称' : '奖品名称'} value={opt.name} onChange={e => updateOption(idx, 'name', e.target.value)} />
                <input className="form-input" type="number" placeholder="排序" value={opt.sort_order} onChange={e => updateOption(idx, 'sort_order', parseInt(e.target.value) || 0)} style={{ maxWidth: 120 }} />
                <button className="btn-remove-option" onClick={() => removeOption(idx)} disabled={form.options.length <= 1}>删除</button>
              </div>
            </div>
          ))}
          <button className="btn-add-option" onClick={addOption}>+ 添加{form.type === 1 ? '选项' : '奖品'}</button>

          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={handleSubmit}>{editing ? '保存' : '创建'}</button>
            <button className="btn btn-ghost" onClick={() => { setShowForm(false); resetForm() }}>取消</button>
          </div>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: 16, color: '#374151' }}>活动列表</h3>
        {list.length === 0 ? (
          <div className="empty-state">暂无活动</div>
        ) : (
          <table className="record-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>标题</th>
                <th>类型</th>
                <th>状态</th>
                <th>开始</th>
                <th>结束</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map(act => (
                <tr key={act.id}>
                  <td>{act.id}</td>
                  <td>{act.title}</td>
                  <td>{act.type === 1 ? '投票' : '抽奖'}</td>
                  <td>{act.status === 1 ? '进行中' : '已结束'}</td>
                  <td>{dayjs(act.start_time).format('MM-DD HH:mm')}</td>
                  <td>{dayjs(act.end_time).format('MM-DD HH:mm')}</td>
                  <td>
                    <button className="btn btn-ghost" style={{ marginRight: 6 }} onClick={() => handleEdit(act)}>编辑</button>
                    <button className="btn btn-danger" onClick={() => handleDelete(act.id)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
