import { Link, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, Trophy, User, LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">学</span>
              </div>
              <span className="font-bold text-lg text-gray-800">学习打卡社区</span>
            </Link>
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/" className="px-3 py-2 text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                <Home className="w-5 h-5 inline mr-1" />
                首页
              </Link>
              <Link to="/groups" className="px-3 py-2 text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                <Users className="w-5 h-5 inline mr-1" />
                小组
              </Link>
              <Link to="/checkin" className="px-3 py-2 text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                <Calendar className="w-5 h-5 inline mr-1" />
                打卡
              </Link>
              <Link to="/ranking" className="px-3 py-2 text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                <Trophy className="w-5 h-5 inline mr-1" />
                排行
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-600 hover:text-primary-500 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 border">
                  <div className="px-4 py-2 border-b">
                    <span className="font-bold text-gray-800">消息通知</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50 border-b">
                      <p className="text-sm text-gray-800">📢 欢迎加入学习打卡社区！</p>
                      <p className="text-xs text-gray-500 mt-1">系统消息 · 刚刚</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 border-b">
                      <p className="text-sm text-gray-800">👍 你的打卡动态获得了1个赞</p>
                      <p className="text-xs text-gray-500 mt-1">互动消息 · 1小时前</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50">
                      <p className="text-sm text-gray-800">🔥 连续打卡3天，继续保持！</p>
                      <p className="text-xs text-gray-500 mt-1">学习提醒 · 昨天</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.nickname}</span>
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMenu(false)}
                  >
                    个人中心
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="w-4 h-4 inline mr-2" />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
