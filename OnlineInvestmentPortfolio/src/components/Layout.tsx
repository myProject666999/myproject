import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  LineChart,
  Wallet,
  TrendingUp,
  Bell,
  LogOut,
  User
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';

const Layout: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return <Outlet />;
  }

  const navItems = [
    { path: '/watchlist', icon: LayoutDashboard, label: '自选股' },
    { path: '/portfolio', icon: Wallet, label: '持仓' },
    { path: '/performance', icon: TrendingUp, label: '收益' },
    { path: '/alerts', icon: Bell, label: '提醒' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/watchlist" className="flex items-center space-x-2">
                <LineChart className="w-8 h-8 text-emerald-600" />
                <span className="text-xl font-bold text-gray-900">投资组合</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user?.username}</span>
                <span className="text-emerald-600 font-medium">
                  ¥{user?.balance?.toLocaleString()}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>退出</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)]">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  location.pathname === item.path
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
