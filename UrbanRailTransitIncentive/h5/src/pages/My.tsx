import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NavBar, Cell, CellGroup, Button, showConfirmDialog, showToast } from 'vant'
import { UserO, SettingO, ClockO, History, StarO, LogOut } from '@vant/icons'
import { authApi } from '../api'

interface UserInfo {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  phone: string
}

const MyPage = () => {
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  useEffect(() => {
    loadUserInfo()
  }, [])

  const loadUserInfo = async () => {
    try {
      const res = await authApi.getCurrentUser()
      setUserInfo(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleLogout = async () => {
    try {
      await showConfirmDialog({
        title: '确认退出',
        message: '确定要退出登录吗？'
      })
      localStorage.removeItem('user_token')
      localStorage.removeItem('user_info')
      showToast('已退出登录')
      navigate('/login')
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error(error)
      }
    }
  }

  const storedUser = JSON.parse(localStorage.getItem('user_info') || '{}')
  const displayUser = userInfo || storedUser

  return (
    <div>
      <NavBar title="我的" />

      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 24,
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28
        }}>
          <UserO style={{ color: '#764ba2' }} />
        </div>
        <div style={{ color: '#fff' }}>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>
            {displayUser?.nickname || displayUser?.username || '未登录'}
          </div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            {displayUser?.phone || displayUser?.email || '欢迎使用城市轨道交通激励APP'}
          </div>
        </div>
      </div>

      <CellGroup inset style={{ marginTop: 12 }}>
        <Cell
          title="任务列表"
          icon={<ClockO />}
          isLink
          onClick={() => navigate('/my/assignments')}
        />
        <Cell
          title="完成结果"
          icon={<History />}
          isLink
          onClick={() => navigate('/my/results')}
        />
        <Cell
          title="我的收藏"
          icon={<StarO />}
          isLink
          onClick={() => navigate('/my/favorites')}
        />
      </CellGroup>

      <CellGroup inset style={{ marginTop: 12 }}>
        <Cell
          title="设置"
          icon={<SettingO />}
          isLink
        />
      </CellGroup>

      <div style={{ padding: 24 }}>
        <Button block plain type="danger" icon={<LogOut />} onClick={handleLogout}>
          退出登录
        </Button>
      </div>
    </div>
  )
}

export default MyPage
