import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { authApi } from '../utils/api';

const Register = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setLoading(true);

    try {
      const response: any = await authApi.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      login(response.user, response.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="cyber-card rounded-2xl p-8 neon-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow animate-float">
              <Sparkles className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-glow mb-2">创建账号</h1>
            <p className="text-gray-400">加入我们，开始创作梗图</p>
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
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                邮箱
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="请输入邮箱"
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
                  placeholder="请输入密码（至少6位）"
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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                确认密码
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="请再次输入密码"
                  className="w-full pl-10 pr-4 py-3 cyber-input rounded-xl"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-1 rounded border-primary/30 bg-dark text-primary focus:ring-primary"
                required
              />
              <span className="text-sm text-gray-400">
                我已阅读并同意{' '}
                <Link to="/terms" className="text-primary hover:underline">
                  服务条款
                </Link>{' '}
                和{' '}
                <Link to="/privacy" className="text-primary hover:underline">
                  隐私政策
                </Link>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 cyber-btn rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-400">
            已有账号？{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
