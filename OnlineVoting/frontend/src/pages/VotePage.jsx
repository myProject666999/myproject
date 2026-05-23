import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { activityApi, voteApi, captchaApi } from '../api'
import dayjs from 'dayjs'

export default function VotePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activity, setActivity] = useState(null)
  const [selected, setSelected] = useState([])
  const [captcha, setCaptcha] = useState({ id: '', image: '' })
  const [captchaCode, setCaptchaCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')
  const [multiSelect, setMultiSelect] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const loadActivity = async () => {
    const res = await activityApi.get(id)
    if (res.code === 0) {
      setActivity(res.data)
      setLoaded(true)
    }
  }

  const loadCaptcha = async () => {
    const res = await captchaApi.get()
    if (res.code === 0) setCaptcha(res.data)
  }

  useEffect(() => { loadActivity(); loadCaptcha() }, [id])

  const toggleOption = (optId) => {
    if (activity?.status === 0) return
    if (multiSelect) {
      setSelected(selected.includes(optId) ? selected.filter(x => x !== optId) : [...selected, optId])
    } else {
      setSelected([optId])
    }
  }

  const handleSubmit = async () => {
    if (selected.length === 0) {
      setMsg('请至少选择一项')
      return
    }
    if (!captchaCode) {
      setMsg('请输入验证码')
      return
    }
    setSubmitting(true)
    setMsg('')
    const res = await voteApi.submit({
      activity_id: activity.id,
      option_ids: selected,
      multi_select: multiSelect,
      captcha_id: captcha.id,
      captcha_code: captchaCode
    })
    setSubmitting(false)
    if (res.code === 0) {
      setMsg('✅ 投票成功！')
      setTimeout(() => navigate(`/result/${id}`), 1200)
    } else {
      setMsg('❌ ' + res.message)
      loadCaptcha()
      setCaptchaCode('')
    }
  }

  if (!loaded) return <div className="empty-state">加载中...</div>

  const isEnded = dayjs().isAfter(dayjs(activity.end_time))
  const isNotStarted = dayjs().isBefore(dayjs(activity.start_time))

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span className="tag vote">投票</span>
          <span className={`tag ${isEnded ? 'ended' : 'active'}`}>{isEnded ? '已结束' : isNotStarted ? '未开始' : '进行中'}</span>
        </div>
        <h2 className="card-title" style={{ fontSize: 22 }}>{activity.title}</h2>
        <p className="card-desc">{activity.description}</p>
        <div className="card-meta">
          <span>🕐 开始：{dayjs(activity.start_time).format('YYYY-MM-DD HH:mm')}</span>
          <span>⏰ 结束：{dayjs(activity.end_time).format('YYYY-MM-DD HH:mm')}</span>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>
            <input type="checkbox" checked={multiSelect} onChange={e => { setMultiSelect(e.target.checked); setSelected([]) }} />
            允许多选
          </label>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14, color: '#374151' }}>请选择你支持的选项：</h3>
        {activity.options?.map(opt => (
          <div
            key={opt.id}
            className={`option-item ${multiSelect ? 'multi' : ''} ${selected.includes(opt.id) ? 'selected' : ''}`}
            onClick={() => toggleOption(opt.id)}
          >
            <div className="radio"></div>
            <span className="option-name">{opt.name}</span>
          </div>
        ))}
      </div>

      {!isEnded && !isNotStarted && (
        <div className="card">
          <div className="form-group">
            <label className="form-label">验证码</label>
            <div className="captcha-wrap">
              <input className="form-input" value={captchaCode} onChange={e => setCaptchaCode(e.target.value)} placeholder="请输入验证码" />
              {captcha.image && (
                <img className="captcha-img" src={`data:image/png;base64,${captcha.image}`} alt="captcha" onClick={loadCaptcha} title="点击刷新" />
              )}
            </div>
          </div>
          {msg && <div style={{ marginBottom: 10, fontSize: 14, color: msg.includes('成功') ? '#059669' : '#ef4444' }}>{msg}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" disabled={submitting} onClick={handleSubmit}>
              {submitting ? '提交中...' : '提交投票'}
            </button>
            <Link to={`/result/${id}`} className="btn btn-ghost">查看结果</Link>
            <Link to={`/dashboard/${id}`} className="btn btn-ghost" target="_blank">大屏展示</Link>
          </div>
        </div>
      )}

      {(isEnded || isNotStarted) && (
        <div className="card text-center">
          <p style={{ color: '#6b7280', marginBottom: 10 }}>{isEnded ? '活动已结束' : '活动尚未开始'}</p>
          <Link to={`/result/${id}`} className="btn btn-primary">查看结果</Link>
        </div>
      )}
    </div>
  )
}
