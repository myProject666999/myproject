import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swiper, SwiperItem, NavBar, Grid, GridItem, Search, PullRefresh, List, showToast } from 'vant'
import { LocationO, ClockO, EyeO } from '@vant/icons'
import { homeApi } from '../api'

interface Banner {
  id: number
  title: string
  image_url: string
  link: string
}

interface TaskType {
  id: number
  name: string
  description: string
  icon: string
}

interface Task {
  id: number
  title: string
  thumbnail: string
  reward: number
  location: string
  task_type: { name: string }
}

interface Announcement {
  id: number
  title: string
  content: string
  is_top: number
}

const HomePage = () => {
  const navigate = useNavigate()
  const [banners, setBanners] = useState<Banner[]>([])
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    try {
      setLoading(true)
      const [bannerRes, typeRes, taskRes, announceRes] = await Promise.all([
        homeApi.getBanners(),
        homeApi.getTaskTypes(),
        homeApi.getRecommendedTasks(),
        homeApi.getAnnouncements()
      ])
      setBanners(bannerRes.data || [])
      setTaskTypes(typeRes.data || [])
      setTasks(taskRes.data || [])
      setAnnouncements(announceRes.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const typeIcons = ['🚇', '👥', '🔧', '⭐', '📋', '🎯']

  return (
    <div>
      <NavBar title="城市轨道交通激励" />
      <PullRefresh onRefresh={loadData}>
        <div>
          {banners.length > 0 && (
            <Swiper autoplay={3000} indicator-color="white">
              {banners.map(banner => (
                <SwiperItem key={banner.id}>
                  <div className="banner-item">
                    <img src={banner.image_url} alt={banner.title} />
                    <div className="banner-item__title">{banner.title}</div>
                  </div>
                </SwiperItem>
              ))}
            </Swiper>
          )}

          <Search
            placeholder="搜索任务"
            readonly
            onClick={() => navigate('/tasks')}
            style={{ padding: '8px 12px', background: '#fff' }}
          />

          {taskTypes.length > 0 && (
            <div className="task-type-grid">
              <Grid column={4} border={false}>
                {taskTypes.map((type, index) => (
                  <GridItem
                    key={type.id}
                    onClick={() => navigate('/tasks')}
                  >
                    <div className="task-type-item">
                      <div className="task-type-item__icon">
                        {typeIcons[index % typeIcons.length]}
                      </div>
                      <div className="task-type-item__name">{type.name}</div>
                    </div>
                  </GridItem>
                ))}
              </Grid>
            </div>
          )}

          {announcements.length > 0 && (
            <div className="section-title">最新公告</div>
          )}
          {announcements.map(item => (
            <div
              key={item.id}
              className="announcement-item"
              onClick={() => navigate('/announcements')}
            >
              <div className="announcement-item__title">
                {item.is_top === 1 && <span style={{ color: '#ee0a24', marginRight: 4 }}>[置顶]</span>}
                {item.title}
              </div>
              <div className="announcement-item__content">{item.content}</div>
            </div>
          ))}

          <div className="section-title">推荐任务</div>
          {tasks.length === 0 ? (
            <div className="empty-tip">暂无任务</div>
          ) : (
            <List>
              {tasks.map(task => (
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
              ))}
            </List>
          )}
        </div>
      </PullRefresh>
    </div>
  )
}

export default HomePage
