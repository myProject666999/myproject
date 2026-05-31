import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { groupApi, checkinApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Calendar, Clock, Smile, Send, Loader2, Check, Users } from 'lucide-react';

const moods = [
  { value: 'happy', label: '开心', emoji: '😊' },
  { value: 'motivated', label: '有动力', emoji: '💪' },
  { value: 'neutral', label: '一般', emoji: '😐' },
  { value: 'tired', label: '疲惫', emoji: '😴' },
];

export default function CheckinPage() {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [content, setContent] = useState('');
  const [studyMinutes, setStudyMinutes] = useState(30);
  const [mood, setMood] = useState('neutral');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: userGroups } = useQuery('userGroups', () =>
    groupApi.getUserGroups().then((res) => res.data)
  );

  const { data: myCheckins } = useQuery('myCheckins', () =>
    checkinApi.getMyCheckins({ limit: 10 }).then((res) => res.data)
  );

  const checkinMutation = useMutation(
    () => checkinApi.checkin(selectedGroup!, { content, studyMinutes, mood }),
    {
      onSuccess: (res) => {
        queryClient.invalidateQueries('myCheckins');
        queryClient.invalidateQueries('checkinStats');
        queryClient.invalidateQueries('userGroups');
        setContent('');
        alert('打卡成功！连续打卡 ' + res.data.data.currentStreak + ' 天');
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || '打卡失败');
      },
    }
  );

  const handleCheckin = () => {
    if (!selectedGroup) {
      alert('请选择小组');
      return;
    }
    checkinMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">每日打卡</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">选择打卡小组</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {userGroups?.data?.map((group: any) => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                    selectedGroup === group.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {group.avatar ? (
                    <img src={group.avatar} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-500" />
                    </div>
                  )}
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-800 truncate">{group.name}</p>
                    <p className="text-xs text-gray-500">连续打卡 {group.groupStreak} 天</p>
                  </div>
                  {selectedGroup === group.id && (
                    <Check className="w-5 h-5 text-primary-500" />
                  )}
                </button>
              ))}
            </div>
            {(!userGroups?.data || userGroups.data.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>还没有加入任何小组</p>
                <button
                  onClick={() => navigate('/groups')}
                  className="mt-2 text-primary-500 hover:text-primary-600"
                >
                  去加入小组 →
                </button>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">打卡内容</h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="今天学了什么？记录一下吧..."
              className="input-field resize-none mb-4"
              rows={4}
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="w-4 h-4 inline mr-1" />
                  学习时长(分钟)
                </label>
                <input
                  type="number"
                  value={studyMinutes}
                  onChange={(e) => setStudyMinutes(Number(e.target.value))}
                  className="input-field"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Smile className="w-4 h-4 inline mr-1" />
                  今日心情
                </label>
                <div className="flex space-x-2">
                  {moods.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMood(m.value)}
                      className={`flex-1 py-2 rounded-lg border-2 transition-all ${
                        mood === m.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{m.emoji}</span>
                      <p className="text-xs text-gray-600 mt-1">{m.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleCheckin}
              disabled={!selectedGroup || checkinMutation.isLoading}
              className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {checkinMutation.isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>立即打卡</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">打卡日历</h3>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, idx) => {
                const date = new Date();
                date.setDate(date.getDate() - (34 - idx));
                const dateStr = date.toISOString().split('T')[0];
                const hasCheckin = myCheckins?.data?.some(
                  (c: any) => c.checkinDate === dateStr
                );
                return (
                  <div
                    key={idx}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs ${
                      hasCheckin
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-gray-500">
              <span className="flex items-center">
                <span className="w-3 h-3 bg-primary-500 rounded mr-1"></span>
                已打卡
              </span>
              <span className="flex items-center">
                <span className="w-3 h-3 bg-gray-100 rounded mr-1"></span>
                未打卡
              </span>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4">最近打卡</h3>
            <div className="space-y-3">
              {myCheckins?.data?.slice(0, 5).map((checkin: any) => (
                <div key={checkin.id} className="p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">
                      {checkin.groupName}
                    </span>
                    <span className="text-xs text-gray-500">{checkin.checkinDate}</span>
                  </div>
                  {checkin.content && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{checkin.content}</p>
                  )}
                </div>
              ))}
              {(!myCheckins?.data || myCheckins.data.length === 0) && (
                <p className="text-center text-gray-500 py-4 text-sm">暂无打卡记录</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
