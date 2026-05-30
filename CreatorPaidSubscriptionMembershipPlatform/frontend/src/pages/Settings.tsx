import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, Palette, LogOut, ChevronRight, Crown } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';

const Settings = () => {
  const navigate = useNavigate();
  const { user, currentCreator, logout } = useUserStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [subscriptionReminders, setSubscriptionReminders] = useState(true);
  const [contentUpdates, setContentUpdates] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'profile', label: '个人资料', icon: <User className="w-5 h-5" /> },
    { id: 'notifications', label: '通知设置', icon: <Bell className="w-5 h-5" /> },
    { id: 'security', label: '账户安全', icon: <Shield className="w-5 h-5" /> },
    { id: 'appearance', label: '外观偏好', icon: <Palette className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-2">设置</h1>
        <p className="text-neutral-500">管理你的账户设置和偏好</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-56 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-neutral-200 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {currentCreator && (
            <div className="mt-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl border border-primary-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-medium text-primary-700">创作者中心</span>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full text-left text-sm text-primary-600 hover:text-primary-700 flex items-center justify-between"
              >
                <span>前往收益台</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-800 mb-6">个人资料</h2>

              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-2xl font-bold">
                  {nickname?.[0] || user?.username?.[0] || 'U'}
                </div>
                <div>
                  <button className="px-4 py-2 text-sm bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors font-medium">
                    更换头像
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">昵称</label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="input"
                    placeholder="输入你的昵称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">邮箱</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="input bg-neutral-50"
                    disabled
                  />
                  <p className="text-xs text-neutral-400 mt-1">邮箱地址不可更改</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">个人简介</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="input min-h-[100px] resize-y"
                    placeholder="写一段关于你自己的介绍..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-4">
                <button
                  onClick={handleSave}
                  className="btn-primary px-6"
                >
                  保存修改
                </button>
                {saved && (
                  <span className="text-sm text-green-600 font-medium">✓ 保存成功</span>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-800 mb-6">通知设置</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-800">邮件通知</h3>
                    <p className="text-sm text-neutral-500">接收重要的邮件通知</p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      emailNotifications ? 'bg-primary-500' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        emailNotifications ? 'left-6' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="border-t border-neutral-100" />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-800">订阅到期提醒</h3>
                    <p className="text-sm text-neutral-500">订阅即将到期时发送提醒</p>
                  </div>
                  <button
                    onClick={() => setSubscriptionReminders(!subscriptionReminders)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      subscriptionReminders ? 'bg-primary-500' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        subscriptionReminders ? 'left-6' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <div className="border-t border-neutral-100" />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-800">内容更新通知</h3>
                    <p className="text-sm text-neutral-500">关注的创作者发布新内容时通知</p>
                  </div>
                  <button
                    onClick={() => setContentUpdates(!contentUpdates)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      contentUpdates ? 'bg-primary-500' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        contentUpdates ? 'left-6' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-800 mb-6">账户安全</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-neutral-800">修改密码</h3>
                    <p className="text-sm text-neutral-500">上次修改时间：未知</p>
                  </div>
                  <button className="btn-secondary text-sm">
                    修改
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                  <div>
                    <h3 className="font-medium text-neutral-800">两步验证</h3>
                    <p className="text-sm text-neutral-500">为你的账户增加额外的安全保护</p>
                  </div>
                  <button className="btn-secondary text-sm">
                    启用
                  </button>
                </div>

                <div className="border-t border-neutral-200 pt-6">
                  <h3 className="font-medium text-red-600 mb-3">危险操作</h3>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                    <div>
                      <h3 className="font-medium text-red-700">删除账户</h3>
                      <p className="text-sm text-red-500">永久删除你的账户和所有数据</p>
                    </div>
                    <button className="btn-danger text-sm">
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h2 className="text-xl font-bold text-neutral-800 mb-6">外观偏好</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-neutral-800 mb-3">主题</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button className="p-4 rounded-xl border-2 border-primary-500 bg-primary-50 text-center">
                      <div className="w-8 h-8 rounded-full bg-white border border-neutral-200 mx-auto mb-2" />
                      <span className="text-sm font-medium text-primary-700">浅色</span>
                    </button>
                    <button className="p-4 rounded-xl border-2 border-neutral-200 hover:border-neutral-300 text-center transition-colors">
                      <div className="w-8 h-8 rounded-full bg-neutral-800 mx-auto mb-2" />
                      <span className="text-sm font-medium text-neutral-600">深色</span>
                    </button>
                    <button className="p-4 rounded-xl border-2 border-neutral-200 hover:border-neutral-300 text-center transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-neutral-800 mx-auto mb-2" />
                      <span className="text-sm font-medium text-neutral-600">跟随系统</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-neutral-100" />

                <div>
                  <h3 className="font-medium text-neutral-800 mb-3">语言</h3>
                  <select className="input">
                    <option value="zh-CN">简体中文</option>
                    <option value="zh-TW">繁體中文</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
