import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavBar, List, Empty, PullRefresh } from 'vant'
import { homeApi } from '../api'

interface Announcement {
  id: number
  title: string
  content: string
  author: string
  is_top: number
  created_at: string
}

const AnnouncementsPage = () => {
  const navigate = useNavigate()
  const [list, setList] = useState<Announcement[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await homeApi.getAnnouncements()
      setList(res.data || [])
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div>
      <NavBar title="公告列表" leftText="返回" onClickLeft={() => navigate(-1)} />

      {list.length === 0 ? (
        <Empty description="暂无公告" />
      ) : (
        <div>
          {list.map(item => (
            <div
              key={item.id}
              style={{
                background: '#fff',
                margin: 12,
                padding: 16,
                borderRadius: 8
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 8
              }}>
                <div style={{ fontWeight: 500, fontSize: 15 }}>
                  {item.is_top === 1 && (
                    <span style={{
                      background: '#ee0a24',
                      color: '#fff',
                      fontSize: 11,
                      padding: '2px 6px',
                      borderRadius: 3,
                      marginRight: 6
                    }}>
                      置顶
                    </span>
                  )}
                  {item.title}
                </div>
              </div>
              <div style={{
                color: '#646566',
                fontSize: 13,
                lineHeight: 1.6,
                marginBottom: 8
              }}>
                {item.content}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#969799',
                fontSize: 12
              }}>
                <span>{item.author || '管理员'}</span>
                <span>{item.created_at}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AnnouncementsPage
