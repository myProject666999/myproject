import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavBar, Tabs, Tab, List, Empty, PullRefresh, LocationO } from 'vant'
import { userApi } from '../api'

interface TaskResult {
  id: number
  status: number
  audit_remark: string
  created_at: string
  task_assignment: {
    task: {
      id: number
      title: string
      thumbnail: string
      reward: number
      location: string
    }
  }
}

const statusTabs = [
  { key: '', name: '全部' },
  { key: '0', name: '待审核' },
  { key: '1', name: '已通过' },
  { key: '2', name: '已拒绝' }
]

const statusMap: Record<number, { text: string; class: string }> = {
  0: { text: '待审核', class: 'status-pending' },
  1: { text: '已通过', class: 'status-completed' },
  2: { text: '已拒绝', class: 'status-rejected' }
}

const MyResultsPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('')
  const [list, setList] = useState<TaskResult[]>([])
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
      const res = await userApi.getResults(params)
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
      <NavBar title="完成结果" leftText="返回" onClickLeft={() => navigate(-1)} />

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
            <Empty description="暂无结果" />
          ) : (
            list.map(item => (
              <div
                key={item.id}
                className="task-card"
                onClick={() => navigate(`/tasks/${item.task_assignment?.task?.id}`)}
              >
                <img
                  className="task-card__thumb"
                  src={item.task_assignment?.task?.thumbnail || 'https://picsum.photos/400/160?random=' + item.id}
                  alt={item.task_assignment?.task?.title}
                />
                <div className="task-card__content">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div className="task-card__title" style={{ marginBottom: 0 }}>
                      {item.task_assignment?.task?.title}
                    </div>
                    <span className={`task-status-tag ${statusMap[item.status]?.class}`}>
                      {statusMap[item.status]?.text}
                    </span>
                  </div>
                  <div className="task-card__info">
                    <div className="task-card__reward">¥{item.task_assignment?.task?.reward}</div>
                    <div className="task-card__location">
                      <LocationO /> {item.task_assignment?.task?.location || '待发布'}
                    </div>
                  </div>
                  {item.audit_remark && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#969799' }}>
                      审核备注: {item.audit_remark}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </List>
      </PullRefresh>
    </div>
  )
}

export default MyResultsPage
