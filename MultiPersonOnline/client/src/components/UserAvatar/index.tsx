import { Avatar, Tooltip } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import type { User } from '@/types'

interface UserAvatarProps {
  user?: User
  size?: number
  showTooltip?: boolean
}

export default function UserAvatar({ user, size = 32, showTooltip = true }: UserAvatarProps) {
  const avatarElement = (
    <Avatar
      size={size}
      src={user?.avatarUrl || undefined}
      icon={!user?.avatarUrl && <UserOutlined />}
      style={{
        backgroundColor: user?.avatarUrl ? 'transparent' : '#1677ff',
        cursor: 'pointer',
      }}
    />
  )

  if (showTooltip && user) {
    return (
      <Tooltip title={user.nickname || user.username}>
        {avatarElement}
      </Tooltip>
    )
  }

  return avatarElement
}
