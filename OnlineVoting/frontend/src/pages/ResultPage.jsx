import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { activityApi } from '../api'
import dayjs from 'dayjs'

export default function ResultPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [total, setTotal] = useState(0)
  const [ws, setWs] = useState(null)

  const loadResult = async () => {
    const res = await activityApi.result(id)
    if (res.code === 0) {
      setData(res.data.activity)
      setTotal(res.data.total_votes)
    }
  }

  useEffect(() => {
    loadResult()
    const interval = setInterval(loadResult, 3000)
    const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${proto}//${location.host}/ws?channel=vote:${id}`
    const socket = new WebSocket(wsUrl)
    socket.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        if (msg.type === 'vote_update') {
          loadResult()
        }
      } catch (err) { console.error(err) }
    }
    setWs(socket)
    return () => {
      clearInterval(interval)
      socket.close()
    }
  }, [id])

  if (!data) return <div className="empty-state">加载中...</div>

  const maxVote = Math.max(...data.options.map(o => o.vote_count), 1)

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: 22 }}>{data.title}</h2>
            <p className="card-desc">{data.description}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: '#6b7280' }}>总票数</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#6366f1' }}>{total}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16, color: '#374151' }}>实时投票结果</h3>
        {data.options
          .slice()
          .sort((a, b) => b.vote_count - a.vote_count)
          .map((opt, idx) => {
            const pct = total > 0 ? ((opt.vote_count / total) * 100).toFixed(1) : 0
            return (
              <div key={opt.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>
                    {idx < 3 && <span style={{ color: '#f59e0b', marginRight: 6 }}>{['🥇','🥈','🥉'][idx]}</span>}
                    {opt.name}
                  </span>
                  <span style={{ color: '#6366f1', fontWeight: 600 }}>{opt.vote_count} 票 ({pct}%)</span>
                </div>
                <div className="result-bar">
                  <div className="result-bar-fill" style={{ width: `${(opt.vote_count / maxVote) * 100}%` }}></div>
                  <div className="result-bar-text">{pct}%</div>
                </div>
              </div>
            )
          })}
      </div>

      <div className="card text-center">
        <Link to={`/dashboard/${id}`} target="_blank" className="btn btn-primary">🖥️ 进入大屏展示</Link>
        <Link to={`/vote/${id}`} style={{ marginLeft: 10 }} className="btn btn-ghost">返回投票</Link>
      </div>
    </div>
  )
}
