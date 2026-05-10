import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavBar, Tabs, Tab, List, Empty, PullRefresh, LocationO, showToast } from 'vant'
import { userApi } from '../api'

interface Assignment {
  id: number
  status: number
  accepted_at: string
  task: {
    id: number
    title: string
    thumbnail: string
    reward: number
    location: string
  }
}

const statusTabs = [
  { key: '', name: '全部' },
  { key: '2', name: '进行中' },
  { key: '3', name: '已完成' }
]

const statusMap: Record<number, { text: string; class: string }> = {
  1: { text: '待接取', class: 'status-pending' },
  2: { text: '进行中', class: 'status-accepted' },
  3: { text: '已完成', class: 'status-completed' }
}

const MyAssignmentsPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('')
  const [list, setList] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
    setList([])
    setFinished(false)
    loadData()
  }, [activeTab])

  const loadData = async () => {
    if (finished) return
    try {
      setLoading(true)
      const params: any = { page, page_size: 10 }
      if (activeTab) params.status = activeTab
      const res = await userApi.getAssignments(params)
      const items = res.data?.list || []
      setList(prev => page === 1 ? items : [...prev, ...items])
      setFinished(items.length < 10)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setPage(1)
    setFinished(false)
    loadData()
  }

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
    loadData()
  }

  return (
    <div>
      <NavBar title="任务列表" leftText="返回" onClickLeft={() => navigate(-1)} />

      <Tabs v-model={activeTab} sticky color="#1989fa">
        {statusTabs.map(tab => (
          <Tab key={tab.key} title={tab.name} onClick={() => setActiveTab(tab.key)} />
        ))}
      </Tabs>

      <PullRefresh onRefresh={handleRefresh}>
        <List
          loading={loading}
          finished={finished}
          finishedText="没有更多了"
          onLoad={handleLoadMore}
        >
          {list.length === 0 ? (
            <Empty description="暂无任务" />
          ) : (
            list.map(item => (
              <div
                key={item.id}
                className="task-card"
                onClick={() => {
                  if (item.status === 2) {
                    navigate(`/tasks/${item.task.id}/result`)
                  } else {
                    navigate(`/tasks/${item.task.id}`)
                  }
                }}
              >
                <img
                  className="task-card__thumb"
                  src={item.task.thumbnail || 'https://picsum.photos/400/160?random=' + item.id}
                  alt={item.task.title}
                />
                <div className="task-card__content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div className="task-card__title" style={{ marginBottom: 0 }}>
                      {item.task.title}
                    </div>
                    <span className={`task-status-tag ${statusMap[item.status]?.class}`}>
                      {statusMap[item.status]?.text}
                    </span>
                  </div>
                  <div className="task-card__info">
                    <div className="task-card__reward">¥{item.task.reward}</div>
                    <div className="task-card__location">
                      <LocationO /> {item.task.location || '待发布'}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </List>
      </PullRefresh>
    </div>
  )
}

export default MyAssignmentsPage
