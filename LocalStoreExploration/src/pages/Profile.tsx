import { useState } from 'react';
import { ChevronRight, Settings, Heart, Bookmark, MessageSquare, Camera, LogOut, Edit } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleLogin = () => {
    const mockUser = {
      id: 1,
      username: loginUsername,
      nickname: '美食达人小王',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      bio: '专注美食探店10年，吃遍全城好吃的！',
      followersCount: 12580,
      notesCount: 156,
      isVerified: 1,
      createdAt: '2023-01-01T00:00:00Z',
    };
    useAuthStore.getState().login(mockUser, 'mock-token');
    setShowLogin(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: Heart, label: '我的收藏', count: 12 },
    { icon: Bookmark, label: '我的笔记', count: 8 },
    { icon: MessageSquare, label: '我的评论', count: 24 },
    { icon: Camera, label: '草稿箱', count: 2 },
  ];

  const settingsItems = [
    { icon: Settings, label: '账号设置' },
    { icon: Settings, label: '隐私设置' },
    { icon: Settings, label: '关于我们' },
  ];

  if (!isAuthenticated && !showLogin) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Camera className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">登录后查看更多内容</h2>
          <p className="text-gray-500 mb-8">发布探店笔记、收藏好店、关注达人</p>
          <button
            onClick={() => setShowLogin(true)}
            className="w-full max-w-xs py-3 bg-orange-500 text-white font-medium rounded-full"
          >
            登录 / 注册
          </button>
        </div>
      </div>
    );
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 mt-8">欢迎回来</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              用户名
            </label>
            <input
              type="text"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              placeholder="请输入用户名"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              密码
            </label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-orange-500 text-white font-medium rounded-xl mt-6"
          >
            登录
          </button>
          <button
            onClick={() => setShowLogin(false)}
            className="w-full py-3 text-gray-500"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 pt-8 pb-12 px-4">
        <div className="flex justify-end mb-4">
          <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
              alt=""
              className="w-20 h-20 rounded-full border-4 border-white"
            />
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center border-2 border-white">
              <Edit className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{user?.nickname || '美食达人'}</h2>
              {user?.isVerified && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  ✓ 达人
                </span>
              )}
            </div>
            <p className="text-orange-100 text-sm mt-1">{user?.bio || '这家伙很懒，什么都没写'}</p>
          </div>
        </div>
      </div>

      <div className="bg-white mx-4 -mt-6 rounded-2xl p-4 shadow-sm">
        <div className="grid grid-cols-3 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{user?.followersCount || 0}</p>
            <p className="text-sm text-gray-500">粉丝</p>
          </div>
          <div className="border-x border-gray-100">
            <p className="text-2xl font-bold text-gray-900">328</p>
            <p className="text-sm text-gray-500">关注</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{user?.notesCount || 0}</p>
            <p className="text-sm text-gray-500">笔记</p>
          </div>
        </div>
      </div>

      <div className="mt-4 mx-4 bg-white rounded-2xl overflow-hidden">
        {menuItems.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center justify-between p-4 border-b border-gray-50 last:border-0"
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">{item.count}</span>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 mx-4 bg-white rounded-2xl overflow-hidden">
        {settingsItems.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center justify-between p-4 border-b border-gray-50 last:border-0"
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-700">{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        ))}
      </div>

      <div className="mt-6 mx-4">
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-white text-red-500 font-medium rounded-xl flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          退出登录
        </button>
      </div>
    </div>
  );
}
