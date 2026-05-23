import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { activityApi } from '../api'

export default function DashboardPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [total, setTotal] = useState(0)

  const load = async () => {
    const res = await activityApi.result(id)
    if (res.code === 0) {
      setData(res.data.activity)
      setTotal(res.data.total_votes)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 2000)
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${proto}//${location.host}/ws?channel=vote:${id}`
    const socket = new WebSocket(wsUrl)
    socket.onmessage = () => load()
    return () => { clearInterval(interval); socket.close() }
  }, [id])

  if (!data) {
    return <div className="dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 20 }}>加载中...</div>
    </div>
  }

  const sorted = [...data.options].sort((a, b) => b.vote_count - a.vote_count)
  const maxVote = Math.max(...sorted.map(o => o.vote_count), 1)

  return (
    <div className="dashboard">
      <h1>{data.title}</h1>
      <div className="total">
        实时总票数：<span style={{ color: '#a78bfa', fontSize: 28, fontWeight: 700, marginLeft: 10 }}>{total}</span>
      </div>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {sorted.map((opt, idx) => {
          const pct = total > 0 ? ((opt.vote_count / total) * 100).toFixed(1) : 0
          return (
            <div key={opt.id} className="result-item">
              <div className="result-header">
                <span className="result-name">
                  {idx < 3 && <span style={{ marginRight: 10, fontSize: 24 }}>{['🥇','🥈','🥉'][idx]}</span>}
                  {opt.name}
                </span>
                <span className="result-number">{opt.vote_count} 票 ({pct}%)</span>
              </div>
              <div className="result-bar">
                <div className="result-bar-fill" style={{ width: `${(opt.vote_count / maxVote) * 100}%`, height: '100%', borderRadius: 7 }}></div>
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ textAlign: 'center', marginTop: 40, fontSize: 13, color: '#64748b' }}>
        数据每秒自动刷新 · WebSocket 实时推送
      </div>
    </div>
  )
}
