import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { authApi } from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response: any = await authApi.login(formData);
      login(response.user, response.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    login(
      {
        id: 1,
        username: 'demo',
        email: 'demo@example.com',
        role: 'user',
      },
      'demo-token'
    );
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="cyber-card rounded-2xl p-8 neon-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow animate-float">
              <Sparkles className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-glow mb-2">欢迎回来</h1>
            <p className="text-gray-400">登录您的账号，开始创作</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                用户名
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="请输入用户名"
                  className="w-full pl-10 pr-4 py-3 cyber-input rounded-xl"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-12 py-3 cyber-input rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-primary/30 bg-dark text-primary focus:ring-primary" />
                <span className="text-sm text-gray-400">记住我</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                忘记密码？
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 cyber-btn rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={handleDemoLogin}
              className="w-full py-3 cyber-btn-outline rounded-xl font-semibold"
            >
              体验登录
            </button>
          </div>

          <p className="text-center mt-6 text-gray-400">
            还没有账号？{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
