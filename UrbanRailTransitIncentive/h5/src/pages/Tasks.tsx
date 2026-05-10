import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavBar, Search, Tabs, Tab, List, PullRefresh, Empty, LocationO } from 'vant'
import { taskApi, homeApi } from '../api'

interface Task {
  id: number
  title: string
  thumbnail: string
  reward: number
  points: number
  location: string
  task_type: { id: number; name: string }
}

interface TaskType {
  id: number
  name: string
}

const TasksPage = () => {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([{ id: 0, name: '全部' }])
  const [activeType, setActiveType] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadTaskTypes()
  }, [])

  useEffect(() => {
    setPage(1)
    setTasks([])
    setFinished(false)
    loadTasks()
  }, [activeType, keyword])

  const loadTaskTypes = async () => {
    try {
      const res = await homeApi.getTaskTypes()
      setTaskTypes([{ id: 0, name: '全部' }, ...(res.data || [])])
    } catch (error) {
      console.error(error)
    }
  }

  const loadTasks = async () => {
    if (finished) return
    try {
      setLoading(true)
      const params: any = { page, page_size: 10 }
      if (activeType > 0) params.task_type_id = activeType
      if (keyword) params.keyword = keyword
      const res = await taskApi.getList(params)
      const list = res.data?.list || []
      setTasks(prev => page === 1 ? list : [...prev, ...list])
      setFinished(list.length < 10)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setPage(1)
    setFinished(false)
    loadTasks()
  }

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
    loadTasks()
  }

  return (
    <div>
      <NavBar title="任务列表" />
      <Search
        placeholder="搜索任务"
        value={keyword}
        onChange={setKeyword}
        onSearch={() => {
          setPage(1)
          setFinished(false)
          loadTasks()
        }}
        style={{ background: '#fff' }}
      />
      <Tabs v-model={activeType} sticky color="#1989fa">
        {taskTypes.map(type => (
          <Tab key={type.id} title={type.name} onClick={() => setActiveType(type.id)} />
        ))}
      </Tabs>
      <PullRefresh onRefresh={handleRefresh}>
        <List
          loading={loading}
          finished={finished}
          finishedText="没有更多了"
          onLoad={handleLoadMore}
        >
          {tasks.length === 0 ? (
            <Empty description="暂无任务" />
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className="task-card"
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <img
                  className="task-card__thumb"
                  src={task.thumbnail || 'https://picsum.photos/400/160?random=' + task.id}
                  alt={task.title}
                />
                <div className="task-card__content">
                  <div className="task-card__title">{task.title}</div>
                  <div className="task-card__info">
                    <div className="task-card__reward">¥{task.reward}</div>
                    <div className="task-card__location">
                      <LocationO /> {task.location || '待发布'}
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

export default TasksPage
