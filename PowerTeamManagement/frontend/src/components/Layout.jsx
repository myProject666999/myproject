import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { getUser, logout } from '../utils/auth'

const menuIcons = {
  dashboard: '📊',
  briefcase: '💼',
  users: '👥',
  contact: '👤',
  'file-text': '📝',
  team: '👨‍👩‍👧‍👦',
  apartment: '🏢',
  settings: '⚙️',
  user: '👤',
  shield: '🛡️',
  menu: '📋',
  lock: '🔒',
}

const Layout = ({ children }) => {
  const [menus, setMenus] = useState([])
  const [expandedMenus, setExpandedMenus] = useState({})
  const [user, setUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const currentUser = getUser()
    setUser(currentUser)
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      const response = await api.get('/user-menus')
      setMenus(response.data)
    } catch (error) {
      console.error('Failed to fetch menus:', error)
    }
  }

  const toggleMenu = (menuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }))
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const renderMenu = (menu, level = 0) => {
    const hasChildren = menu.children && menu.children.length > 0
    const isExpanded = expandedMenus[menu.id] || hasChildren && menu.children.some((child) => isActive(child.path))
    const icon = menuIcons[menu.icon] || '📄'

    return (
      <div key={menu.id}>
        {hasChildren ? (
          <button
            onClick={() => toggleMenu(menu.id)}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
              isActive(menu.path)
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            style={{ paddingLeft: `${16 + level * 16}px` }}
          >
            <span className="flex items-center gap-3">
              <span>{icon}</span>
              <span>{menu.name}</span>
            </span>
            <span className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
              ▶
            </span>
          </button>
        ) : (
          <Link
            to={menu.path}
            className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
              isActive(menu.path)
                ? 'bg-blue-50 text-blue-600 font-medium border-r-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            style={{ paddingLeft: `${16 + level * 16}px` }}
          >
            <span>{icon}</span>
            <span>{menu.name}</span>
          </Link>
        )}
        {hasChildren && isExpanded && (
          <div className="bg-gray-50">
            {menu.children.map((child) => renderMenu(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="h-16 flex items-center justify-center border-b">
          <h1 className="text-xl font-bold text-blue-600">团队管理系统</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {menus.map((menu) => renderMenu(menu))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <div className="text-gray-600">
            {location.pathname === '/' ? '看板' : location.pathname.split('/').pop()}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {user?.real_name?.charAt(0) || 'U'}
              </div>
              <span className="text-gray-700">{user?.real_name}</span>
              <span className="text-gray-400 text-sm">({user?.role?.name})</span>
              <span>▼</span>
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  退出登录
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

export default Layout
