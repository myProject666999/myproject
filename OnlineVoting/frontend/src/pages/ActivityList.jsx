import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import { activityApi } from '../api'

export default function ActivityList() {
  const [list, setList] = useState([])
  const [total, setTotal] = useState(0)
  const [type, setType] = useState('')
  const [page, setPage] = useState(1)
  const [size] = useState(12)

  const load = async () => {
    const res = await activityApi.list({ page, size, type })
    if (res.code === 0) {
      setList(res.data.items)
      setTotal(res.data.total)
    }
  }

  useEffect(() => { load() }, [type, page])

  return (
    <div>
      <h2 className="page-title">活动中心</h2>
      <div className="filter-bar">
        <select value={type} onChange={e => { setType(e.target.value); setPage(1) }}>
          <option value="">全部类型</option>
          <option value="1">投票活动</option>
          <option value="2">抽奖活动</option>
        </select>
        <span style={{ color: '#6b7280', fontSize: 14, marginLeft: 'auto' }}>共 {total} 个活动</span>
      </div>

      {list.length === 0 ? (
        <div className="empty-state">暂无活动</div>
      ) : (
        <div className="grid-3">
          {list.map(act => (
            <Link to={act.type === 1 ? `/vote/${act.id}` : `/lottery/${act.id}`} key={act.id}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`tag ${act.type === 1 ? 'vote' : 'lottery'}`}>
                    {act.type === 1 ? '投票' : '抽奖'}
                  </span>
                  <span className={`tag ${act.status === 1 ? 'active' : 'ended'}`}>
                    {act.status === 1 ? '进行中' : '已结束'}
                  </span>
                </div>
                <div className="card-title" style={{ marginTop: 10 }}>{act.title}</div>
                <div className="card-desc">{act.description}</div>
                <div className="card-meta">
                  <span>🕐 {dayjs(act.start_time).format('MM-DD HH:mm')}</span>
                  <span>➡️ {dayjs(act.end_time).format('MM-DD HH:mm')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {total > size && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button className="btn btn-ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>上一页</button>
          <span style={{ margin: '0 16px' }}>第 {page} 页</span>
          <button className="btn btn-ghost" disabled={page * size >= total} onClick={() => setPage(page + 1)}>下一页</button>
        </div>
      )}
    </div>
  )
}
