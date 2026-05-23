import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { activityApi, lotteryApi } from '../api'
import dayjs from 'dayjs'

export default function LotteryPage() {
  const { id } = useParams()
  const [activity, setActivity] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState(null)
  const [records, setRecords] = useState([])
  const [msg, setMsg] = useState('')

  const loadActivity = async () => {
    const res = await activityApi.get(id)
    if (res.code === 0) {
      setActivity(res.data)
      setLoaded(true)
    }
  }

  const loadRecords = async () => {
    const res = await lotteryApi.records(id)
    if (res.code === 0) setRecords(res.data)
  }

  useEffect(() => { loadActivity(); loadRecords() }, [id])

  const handleDraw = async () => {
    if (spinning) return
    setSpinning(true)
    setResult(null)
    setMsg('')
    setTimeout(async () => {
      const res = await lotteryApi.draw(id)
      setSpinning(false)
      if (res.code === 0) {
        setResult(res.data.prize)
        loadRecords()
      } else {
        setMsg(res.message)
      }
    }, 1500)
  }

  if (!loaded) return <div className="empty-state">加载中...</div>

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span className="tag lottery">抽奖</span>
          <span className={`tag ${activity.status === 1 ? 'active' : 'ended'}`}>
            {activity.status === 1 ? '进行中' : '已结束'}
          </span>
        </div>
        <h2 className="card-title" style={{ fontSize: 22 }}>{activity.title}</h2>
        <p className="card-desc">{activity.description}</p>
        <div className="card-meta">
          <span>🕐 {dayjs(activity.start_time).format('YYYY-MM-DD HH:mm')}</span>
          <span>⏰ {dayjs(activity.end_time).format('YYYY-MM-DD HH:mm')}</span>
        </div>
      </div>

      <div className="lottery-container">
        <div className={`lottery-box ${spinning ? 'spinning' : ''}`}>
          {spinning ? '🎰' : result ? '🎁' : '🎲'}
        </div>

        {result && (
          <div className="lottery-result">
            🎉 恭喜您获得：{result.name}
          </div>
        )}

        {msg && <div style={{ color: '#ef4444', marginBottom: 10 }}>{msg}</div>}

        <button
          className="btn btn-primary"
          style={{ padding: '12px 40px', fontSize: 16 }}
          disabled={spinning || activity.status === 0}
          onClick={handleDraw}
        >
          {spinning ? '抽奖中...' : activity.status === 0 ? '活动已结束' : '🎯 立即抽奖'}
        </button>
        <p style={{ marginTop: 12, fontSize: 13, color: '#9ca3af' }}>每人每天限抽 3 次</p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14, color: '#374151' }}>🎁 奖品列表</h3>
        <div className="grid-3">
          {activity.options?.map(opt => (
            <div key={opt.id} style={{
              padding: 14, background: '#f9fafb', borderRadius: 8, textAlign: 'center',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{opt.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 14, color: '#374151' }}>📜 中奖记录</h3>
        {records.length === 0 ? (
          <div style={{ color: '#9ca3af', textAlign: 'center', padding: 20 }}>暂无记录</div>
        ) : (
          <table className="record-table">
            <thead>
              <tr>
                <th>时间</th>
                <th>奖品</th>
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 10).map(r => {
                const prize = activity.options?.find(o => o.id === r.option_id)
                return (
                  <tr key={r.id}>
                    <td>{dayjs(r.created_at).format('YYYY-MM-DD HH:mm:ss')}</td>
                    <td>{prize?.name || '未知'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <Link to="/" className="btn btn-ghost">返回活动列表</Link>
      </div>
    </div>
  )
}
