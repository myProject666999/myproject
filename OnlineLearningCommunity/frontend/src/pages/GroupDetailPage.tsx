import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useState } from 'react';
import { groupApi, checkinApi, postApi, rankingApi, goalApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Users, Calendar, Trophy, Target, Heart, MessageCircle, Plus, Loader2, LogOut, Crown } from 'lucide-react';
import dayjs from '../utils/dayjs';

export default function GroupDetailPage() {
  const { id } = useParams();
  const groupId = Number(id);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'members' | 'checkins' | 'posts' | 'goals' | 'ranking'>('members');

  const { data: group, isLoading: groupLoading } = useQuery(
    ['group', groupId],
    () => groupApi.getGroupDetail(groupId).then((res) => res.data)
  );

  const { data: checkins } = useQuery(
    ['groupCheckins', groupId],
    () => checkinApi.getGroupCheckins(groupId, { limit: 20 }).then((res) => res.data),
    { enabled: activeTab === 'checkins' }
  );

  const { data: posts } = useQuery(
    ['groupPosts', groupId],
    () => postApi.getPosts({ groupId, limit: 20 }).then((res) => res.data),
    { enabled: activeTab === 'posts' }
  );

  const { data: ranking } = useQuery(
    ['groupRanking', groupId],
    () => rankingApi.getGroupRanking(groupId, { limit: 20 }).then((res) => res.data),
    { enabled: activeTab === 'ranking' }
  );

  const { data: goals } = useQuery(
    ['groupGoals', groupId],
    () => goalApi.getGroupGoals(groupId).then((res) => res.data),
    { enabled: activeTab === 'goals' }
  );

  const joinMutation = useMutation(() => groupApi.joinGroup(groupId), {
    onSuccess: (res) => {
      queryClient.invalidateQueries(['group', groupId]);
      queryClient.invalidateQueries('userGroups');
      alert('加入小组成功！');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || '加入小组失败');
    },
  });

  const leaveMutation = useMutation(() => groupApi.leaveGroup(groupId), {
    onSuccess: () => {
      queryClient.invalidateQueries(['group', groupId]);
      queryClient.invalidateQueries('userGroups');
      alert('已退出小组');
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || '退出小组失败');
    },
  });

  const isMember = group?.members?.some((m: any) => m.id === user?.id);
  const isOwner = group?.ownerId === user?.id;

  if (groupLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-start space-x-4">
          {group?.avatar ? (
            <img src={group.avatar} alt="" className="w-20 h-20 rounded-xl object-cover" />
          ) : (
            <div className="w-20 h-20 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users className="w-10 h-10 text-primary-500" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold text-gray-800">{group?.name}</h1>
              {isOwner && (
                <span className="badge bg-yellow-100 text-yellow-700">
                  <Crown className="w-3 h-3 mr-1" />
                  组长
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1">{group?.description || '暂无描述'}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {group?.memberCount}/{group?.maxMembers}人
              </span>
              <span>{group?.category}</span>
              <span>创建于 {dayjs(group?.createdAt).format('YYYY-MM-DD')}</span>
            </div>
          </div>
          <div>
            {!isMember ? (
              <button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isLoading}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>加入小组</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <Link to="/checkin" className="btn-primary">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  打卡
                </Link>
                {!isOwner && (
                  <button
                    onClick={() => {
                      if (confirm('确定要退出小组吗？')) {
                        leaveMutation.mutate();
                      }
                    }}
                    className="btn-outline"
                  >
                    <LogOut className="w-4 h-4 inline mr-1" />
                    退出
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex space-x-1 border-b">
          {[
            { key: 'members', label: '成员', icon: Users },
            { key: 'checkins', label: '打卡', icon: Calendar },
            { key: 'posts', label: '动态', icon: MessageCircle },
            { key: 'goals', label: '目标', icon: Target },
            { key: 'ranking', label: '排行', icon: Trophy },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4 inline mr-1" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="pt-4">
          {activeTab === 'members' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group?.members?.map((member: any) => (
                <div key={member.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {member.avatar ? (
                    <img src={member.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-500 font-bold">{member.nickname?.[0]}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">{member.nickname}</span>
                      {member.role === 'owner' && (
                        <Crown className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      打卡{member.groupCheckins}天 · 连续{member.groupStreak}天
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'checkins' && (
            <div className="space-y-4">
              {checkins?.data?.map((checkin: any) => (
                <div key={checkin.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  {checkin.user?.avatar ? (
                    <img src={checkin.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-500 font-bold">{checkin.user?.nickname?.[0]}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{checkin.user?.nickname}</span>
                      <span className="text-xs text-gray-500">{checkin.checkinDate}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{checkin.content}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>学习 {checkin.studyMinutes} 分钟</span>
                      <span>心情: {checkin.mood}</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!checkins?.data || checkins.data.length === 0) && (
                <p className="text-center text-gray-500 py-8">暂无打卡记录</p>
              )}
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="space-y-4">
              {posts?.data?.map((post: any) => (
                <div key={post.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    {post.user?.avatar ? (
                      <img src={post.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-500 text-sm">{post.user?.nickname?.[0]}</span>
                      </div>
                    )}
                    <span className="font-medium text-gray-800">{post.user?.nickname}</span>
                    <span className="text-xs text-gray-500">{dayjs(post.createdAt).fromNow()}</span>
                  </div>
                  <p className="mt-2 text-gray-700">{post.content}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likeCount}
                    </span>
                    <span className="flex items-center">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.commentCount}
                    </span>
                  </div>
                </div>
              ))}
              {(!posts?.data || posts.data.length === 0) && (
                <p className="text-center text-gray-500 py-8">暂无动态</p>
              )}
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="space-y-4">
              {goals?.map((goal: any) => (
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
                  <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>进度</span>
                      <span>{goal.currentValue}/{goal.targetValue} {goal.unit}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 transition-all"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(!goals || goals.length === 0) && (
                <p className="text-center text-gray-500 py-8">暂无目标</p>
              )}
            </div>
          )}

          {activeTab === 'ranking' && (
            <div className="space-y-3">
              {ranking?.map((item: any, idx: number) => (
                <div key={item.userId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-yellow-400 text-white' :
                    idx === 1 ? 'bg-gray-400 text-white' :
                    idx === 2 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {idx + 1}
                  </span>
                  {item.avatar ? (
                    <img src={item.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-500 font-bold">{item.nickname?.[0]}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">{item.nickname}</span>
                    <p className="text-xs text-gray-500">连续打卡{item.groupStreak}天</p>
                  </div>
                  <span className="text-lg font-bold text-primary-500">{item.score}</span>
                </div>
              ))}
              {(!ranking || ranking.length === 0) && (
                <p className="text-center text-gray-500 py-8">暂无排行数据</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
