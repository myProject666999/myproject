import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuthStore } from '../store/authStore';
import { userApi, checkinApi, goalApi, groupApi } from '../services/api';
import { User, Calendar, Target, Users, Edit2, Camera, Save, Loader2, TrendingUp, Award, Flame, Crown } from 'lucide-react';
import dayjs from '../utils/dayjs';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过2MB');
      return;
    }

    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const res = await userApi.uploadAvatar(formData);
      updateUser({ avatar: res.data.avatar });
      alert('头像更新成功！');
    } catch (error: any) {
      alert(error.response?.data?.message || '头像上传失败');
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const { data: stats } = useQuery('profileStats', () =>
    checkinApi.getCheckinStats().then((res) => res.data)
  );

  const { data: myGoals } = useQuery('myGoals', () =>
    goalApi.getMyGoals().then((res) => res.data)
  );

  const { data: myGroups } = useQuery('myGroups', () =>
    groupApi.getUserGroups().then((res) => res.data)
  );

  const { data: myCheckins } = useQuery('profileCheckins', () =>
    checkinApi.getMyCheckins({ limit: 10 }).then((res) => res.data)
  );

  const updateMutation = useMutation(
    () => userApi.updateProfile({ nickname, bio }),
    {
      onSuccess: (res) => {
        updateUser({ nickname, bio });
        setIsEditing(false);
      },
    }
  );

  const handleSave = () => {
    updateMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start space-x-6">
          <div className="relative">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="w-24 h-24 rounded-2xl object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-primary-100 flex items-center justify-center">
                <span className="text-primary-500 text-3xl font-bold">
                  {user?.nickname?.[0] || 'U'}
                </span>
              </div>
            )}
            {avatarLoading ? (
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              <button
                onClick={handleAvatarClick}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-600 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="input-field max-w-xs"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-800">{user?.nickname}</h1>
              )}
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-500 hover:text-primary-500"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isLoading}
                  className="text-primary-500 hover:text-primary-600"
                >
                  {updateMutation.isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>
            <p className="text-gray-500 mt-1">@{user?.username}</p>
            {isEditing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-field mt-2 resize-none"
                rows={2}
                placeholder="介绍一下自己..."
              />
            ) : (
              <p className="text-gray-600 mt-2">{user?.bio || '暂无简介'}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-500">{stats?.totalCheckins || 0}</p>
            <p className="text-sm text-gray-500">总打卡</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">{user?.currentStreak || 0}</p>
            <p className="text-sm text-gray-500">连续天数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">{user?.maxStreak || 0}</p>
            <p className="text-sm text-gray-500">最长连续</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-500">{myGroups?.data?.length || 0}</p>
            <p className="text-sm text-gray-500">加入小组</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 text-primary-500 mr-2" />
            打卡日历
          </h3>
          <div className="grid grid-cols-7 gap-1">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <div key={day} className="text-center text-xs text-gray-400 py-1">
                {day}
              </div>
            ))}
            {Array.from({ length: 42 }).map((_, idx) => {
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
              const date = new Date(firstDay);
              date.setDate(firstDay.getDate() + idx - firstDay.getDay());
              const dateStr = date.toISOString().split('T')[0];
              const hasCheckin = myCheckins?.data?.some(
                (c: any) => c.checkinDate === dateStr
              );
              const isCurrentMonth = date.getMonth() === today.getMonth();
              return (
                <div
                  key={idx}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs ${
                    hasCheckin
                      ? 'bg-primary-500 text-white'
                      : isCurrentMonth
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-gray-50 text-gray-300'
                  }`}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Target className="w-5 h-5 text-primary-500 mr-2" />
            我的目标
          </h3>
          <div className="space-y-3">
            {myGoals?.data?.slice(0, 5).map((goal: any) => (
              <div key={goal.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{goal.title}</span>
                  <span className={`badge ${
                    goal.status === 'completed' ? 'bg-green-100 text-green-700' :
                    goal.status === 'abandoned' ? 'bg-gray-100 text-gray-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {goal.status === 'completed' ? '已完成' :
                     goal.status === 'abandoned' ? '已放弃' : '进行中'}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {goal.currentValue}/{goal.targetValue} {goal.unit}
                  </p>
                </div>
              </div>
            ))}
            {(!myGoals?.data || myGoals.data.length === 0) && (
              <p className="text-center text-gray-500 py-4">暂无目标</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Users className="w-5 h-5 text-primary-500 mr-2" />
            我的小组
          </h3>
          <div className="space-y-3">
            {myGroups?.data?.map((group: any) => (
              <div key={group.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                {group.avatar ? (
                  <img
                    src={group.avatar}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-500" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{group.name}</p>
                  <p className="text-xs text-gray-500">
                    {group.role === 'owner' ? '组长' : '成员'} · 打卡 {group.groupCheckins} 天
                  </p>
                </div>
                {group.role === 'owner' && (
                  <Crown className="w-5 h-5 text-yellow-500" />
                )}
              </div>
            ))}
            {(!myGroups?.data || myGroups.data.length === 0) && (
              <p className="text-center text-gray-500 py-4">还没有加入小组</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 text-primary-500 mr-2" />
            学习成就
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <Flame className="w-8 h-8 mx-auto text-orange-500 mb-2" />
              <p className="text-lg font-bold text-orange-600">{user?.currentStreak || 0}</p>
              <p className="text-xs text-gray-600">连续打卡</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <Award className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="text-lg font-bold text-green-600">{user?.maxStreak || 0}</p>
              <p className="text-xs text-gray-600">最长记录</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <Calendar className="w-8 h-8 mx-auto text-blue-500 mb-2" />
              <p className="text-lg font-bold text-blue-600">{stats?.totalCheckins || 0}</p>
              <p className="text-xs text-gray-600">累计天数</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
