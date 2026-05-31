import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Users, Calendar, Trophy, Target, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { groupApi, checkinApi } from '../services/api';

export default function Sidebar() {
  const { user } = useAuthStore();

  const { data: userGroups } = useQuery('userGroups', () =>
    groupApi.getUserGroups().then((res) => res.data)
  );

  const { data: stats } = useQuery('checkinStats', () =>
    checkinApi.getCheckinStats().then((res) => res.data)
  );

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center space-x-3">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">{user?.nickname?.[0] || 'U'}</span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-800">{user?.nickname}</h3>
            <p className="text-sm text-gray-500">@{user?.username}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-primary-500">{stats?.totalCheckins || 0}</p>
              <p className="text-xs text-gray-500">总打卡</p>
            </div>
            <div>
              <p className="text-lg font-bold text-orange-500">{user?.currentStreak || 0}</p>
              <p className="text-xs text-gray-500">连续天数</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-500">{user?.maxStreak || 0}</p>
              <p className="text-xs text-gray-500">最长连续</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-3">
          <TrendingUp className="w-4 h-4 inline mr-1 text-primary-500" />
          我的小组
        </h3>
        <div className="space-y-2">
          {userGroups?.data?.slice(0, 5).map((group: any) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {group.avatar ? (
                <img src={group.avatar} alt="" className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{group.name}</p>
                <p className="text-xs text-gray-500">
                  {group.memberCount}/{group.maxMembers}人
                </p>
              </div>
              <span className="text-xs text-orange-500 font-medium">🔥{group.groupStreak}</span>
            </Link>
          ))}
          {(!userGroups?.data || userGroups.data.length === 0) && (
            <p className="text-sm text-gray-500 text-center py-4">还没有加入小组</p>
          )}
        </div>
        <Link to="/groups" className="block mt-3 text-center text-sm text-primary-500 hover:text-primary-600">
          查看全部小组 →
        </Link>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-800 mb-3">
          <Target className="w-4 h-4 inline mr-1 text-primary-500" />
          快捷操作
        </h3>
        <div className="space-y-2">
          <Link to="/checkin" className="block w-full text-center bg-primary-500 text-white py-2 rounded-lg hover:bg-primary-600 transition-colors font-medium">
            <Calendar className="w-4 h-4 inline mr-1" />
            立即打卡
          </Link>
          <Link to="/ranking" className="block w-full text-center border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium">
            <Trophy className="w-4 h-4 inline mr-1" />
            查看排行榜
          </Link>
        </div>
      </div>
    </div>
  );
}
