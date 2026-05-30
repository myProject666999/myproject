import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { login as loginApi, getCreatorByUserId } from '@/api/user';
import type { User } from '@/types';

const Login = () => {
  const navigate = useNavigate();
  const { login, setCurrentCreator } = useUserStore();

  const [email, setEmail] = useState('user1@example.com');
  const [password, setPassword] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user: User = await loginApi({ email, password });
      login(user);

      try {
        const creator = await getCreatorByUserId(user.id);
        if (creator) {
          setCurrentCreator(creator);
        }
      } catch (err) {
        console.log('User is not a creator');
      }

      setLoading(false);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500/10 via-white to-accent-500/10 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 to-accent-500 p-12 flex-col justify-between">
        <div className="flex items-center gap-3 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Crown className="w-6 h-6" />
          </div>
          <span className="font-display text-2xl font-bold">CreatorHub</span>
        </div>

        <div className="text-white">
          <h2 className="font-display text-5xl font-bold mb-6 leading-tight">
            让创作
            <br />
            更有价值
          </h2>
          <p className="text-white/80 text-lg max-w-md">
            加入创作者平台，直接支持你喜爱的创作者，
            解锁专属内容，成为社区的一部分。
          </p>
        </div>

        <div className="text-white/60 text-sm">
          © 2024 CreatorHub. All rights reserved.
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              CreatorHub
            </span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-neutral-800 mb-2">欢迎回来</h1>
            <p className="text-neutral-500">登录你的账户，继续支持创作者</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">邮箱</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-4 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 border-2 border-neutral-200 rounded-xl focus:border-primary-400 focus:outline-none transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500" />
                <span className="text-sm text-neutral-600">记住我</span>
              </label>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700">忘记密码？</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                '登录'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-neutral-500">
              还没有账户？
              <Link to="/login" className="text-primary-600 font-medium hover:text-primary-700 ml-1">
                立即注册
              </Link>
            </p>
          </div>

          <div className="mt-8 p-4 bg-neutral-50 rounded-xl">
            <p className="text-xs text-neutral-500 text-center">
              测试账号：user1@example.com / password
              <br />
              登录后即可体验完整功能
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
