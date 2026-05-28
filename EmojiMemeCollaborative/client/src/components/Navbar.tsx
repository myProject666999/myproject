import { Link, useNavigate } from 'react-router-dom';
import { Home, Image, Flame, Shield, User, LogOut, PenTool } from 'lucide-react';
import { useAuthStore } from '../store/auth';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 cyber-card border-b border-primary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow">
              <span className="text-xl">😂</span>
            </div>
            <span className="text-xl font-bold text-glow bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              梗图工坊
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" icon={<Home size={18} />} label="素材广场" />
            <NavLink to="/hotlist" icon={<Flame size={18} />} label="热榜" />
            <NavLink to="/editor" icon={<PenTool size={18} />} label="编辑器" />
            {user?.role === 'admin' && (
              <NavLink to="/review" icon={<Shield size={18} />} label="审核后台" />
            )}
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark/50 border border-primary/20">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="text-sm font-medium">{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-primary/10 transition-colors text-gray-400 hover:text-primary"
                  title="退出登录"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-primary transition-colors"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white cyber-btn rounded-lg"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavLink = ({ to, icon, label }: NavLinkProps) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-primary hover:bg-primary/10 transition-all"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default Navbar;
