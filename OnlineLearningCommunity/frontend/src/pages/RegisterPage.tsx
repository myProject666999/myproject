import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { User, Lock, UserPlus, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const registerMutation = useMutation(
    () => authApi.register({ username, password, nickname }),
    {
      onSuccess: (res) => {
        login(res.data.user, res.data.token);
        navigate('/');
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || '注册失败');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password || !nickname) {
      setError('请填写所有必填项');
      return;
    }
    if (password.length < 6) {
      setError('密码至少6个字符');
      return;
    }
    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">学</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">创建账号</h1>
          <p className="text-gray-500 mt-2">加入学习打卡社区</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">用户名</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="设置用户名"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
            <div className="relative">
              <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="设置昵称"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="设置密码（至少6位）"
                className="input-field pl-10"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg">{error}</div>
          )}

          <button
            type="submit"
            disabled={registerMutation.isLoading}
            className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors font-medium flex items-center justify-center disabled:opacity-50"
          >
            {registerMutation.isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              '注册'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          已有账号？
          <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium ml-1">
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
