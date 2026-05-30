import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Settings, LogOut, Crown } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

const Navbar = () => {
  const { user, isLoggedIn, logout, currentCreator } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
            CreatorHub
          </span>
        </Link>

        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索创作者..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-100 rounded-xl border-2 border-transparent focus:border-primary-300 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              {currentCreator && (
                <Link
                  to="/creator/dashboard"
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all"
                >
                  收益台
                </Link>
              )}
              <Link
                to="/my/subscriptions"
                className="px-4 py-2 text-neutral-600 hover:text-primary-600 font-medium transition-colors"
              >
                我的订阅
              </Link>
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-neutral-100 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-medium">
                    {user?.nickname?.[0] || user?.username?.[0] || 'U'}
                  </div>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-2">
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-700"
                    >
                      <Settings className="w-4 h-4" />
                      <span>设置</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-500 w-full"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>退出登录</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-neutral-600 hover:text-primary-600 font-medium transition-colors"
              >
                登录
              </Link>
              <Link
                to="/login"
                className="px-5 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-primary-500/25 transition-all"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
