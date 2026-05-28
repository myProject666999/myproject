import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, List, Trophy, User, Plus } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Navbar() {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();

  const navItems = [
    { path: '/', icon: Home, label: '发现' },
    { path: '/ranking', icon: Trophy, label: '达人榜' },
    { path: '/publish', icon: Plus, label: '发布' },
    { path: '/my-list', icon: List, label: '我的清单' },
    { path: '/profile', icon: User, label: '我的' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 px-2 py-2">
      <div className="max-w-lg mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                isActive
                  ? 'text-orange-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
