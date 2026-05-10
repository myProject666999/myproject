import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavBar, List, Empty, PullRefresh, LocationO } from 'vant'
import { userApi } from '../api'

interface Favorite {
  id: number
  task: {
    id: number
    title: string
    thumbnail: string
    reward: number
    location: string
  }
}

const MyFavoritesPage = () => {
  const navigate = useNavigate()
  const [list, setList] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (finished) return
    try {
      setLoading(true)
      const res = await userApi.getFavorites({ page, page_size: 10 })
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
      <NavBar title="我的收藏" leftText="返回" onClickLeft={() => navigate(-1)} />

      <PullRefresh onRefresh={handleRefresh}>
        <List
          loading={loading}
          finished={finished}
          finishedText="没有更多了"
          onLoad={handleLoadMore}
        >
          {list.length === 0 ? (
            <Empty description="暂无收藏" />
          ) : (
            list.map(item => (
              <div
                key={item.id}
                className="task-card"
                onClick={() => navigate(`/tasks/${item.task.id}`)}
              >
                <img
                  className="task-card__thumb"
                  src={item.task.thumbnail || 'https://picsum.photos/400/160?random=' + item.id}
                  alt={item.task.title}
                />
                <div className="task-card__content">
                  <div className="task-card__title">{item.task.title}</div>
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

export default MyFavoritesPage
