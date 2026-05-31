import { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { rankingApi, groupApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Trophy, Users, Flame, Medal, Crown, TrendingUp, Award } from 'lucide-react';

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<'global' | 'group'>('global');
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const { user } = useAuthStore();

  const { data: userGroups } = useQuery('userGroups', () =>
    groupApi.getUserGroups().then((res) => res.data)
  );

  const { data: globalRanking, isLoading: globalLoading } = useQuery(
    'globalRanking',
    () => rankingApi.getGlobalRanking({ limit: 50 }).then((res) => res.data),
    { enabled: activeTab === 'global' }
  );

  const { data: groupRanking, isLoading: groupLoading } = useQuery(
    ['groupRanking', selectedGroup],
    () => rankingApi.getGroupRanking(selectedGroup!, { limit: 50 }).then((res) => res.data),
    { enabled: activeTab === 'group' && !!selectedGroup }
  );

  const { data: myRank } = useQuery(
    'myRank',
    () => rankingApi.getMyRank().then((res) => res.data),
    { enabled: activeTab === 'global' }
  );

  const rankingData = activeTab === 'global' ? globalRanking : groupRanking;
  const isLoading = activeTab === 'global' ? globalLoading : groupLoading;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center">
        <Trophy className="w-7 h-7 text-yellow-500 mr-2" />
        排行榜
      </h1>

      <div className="card">
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'global'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Crown className="w-4 h-4 inline mr-1" />
            全局排行
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'group'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4 inline mr-1" />
            小组排行
          </button>
        </div>

        {activeTab === 'group' && (
          <select
            value={selectedGroup || ''}
            onChange={(e) => setSelectedGroup(Number(e.target.value))}
            className="input-field max-w-xs"
          >
            <option value="">选择小组</option>
            {userGroups?.data?.map((group: any) => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {myRank && activeTab === 'global' && (
        <div className="card bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Award className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">我的排名</p>
                <p className="text-2xl font-bold text-gray-800">
                  {myRank.globalRank ? `第 ${myRank.globalRank} 名` : '暂无排名'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">累计打卡</p>
              <p className="text-2xl font-bold text-primary-500">{user?.totalCheckins || 0} 天</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'group' && !selectedGroup && (
        <div className="card text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>请先选择一个小组</p>
        </div>
      )}

      {isLoading ? (
        <div className="card text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : (
        <div className="card">
          {rankingData?.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {rankingData.slice(0, 3).map((item: any, idx: number) => (
                <div
                  key={item.userId}
                  className={`text-center p-4 rounded-xl ${
                    idx === 0
                      ? 'bg-gradient-to-b from-yellow-100 to-yellow-50'
                      : idx === 1
                      ? 'bg-gradient-to-b from-gray-100 to-gray-50'
                      : 'bg-gradient-to-b from-orange-100 to-orange-50'
                  }`}
                >
                  <div className="mb-3">
                    {idx === 0 ? (
                      <Crown className="w-10 h-10 mx-auto text-yellow-500" />
                    ) : idx === 1 ? (
                      <Medal className="w-10 h-10 mx-auto text-gray-400" />
                    ) : (
                      <Award className="w-10 h-10 mx-auto text-orange-400" />
                    )}
                  </div>
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt=""
                      className="w-16 h-16 rounded-full mx-auto object-cover border-4 border-white shadow"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full mx-auto bg-primary-100 flex items-center justify-center border-4 border-white shadow">
                      <span className="text-primary-500 text-xl font-bold">
                        {item.nickname?.[0]}
                      </span>
                    </div>
                  )}
                  <p className="font-bold text-gray-800 mt-2">{item.nickname}</p>
                  <p className="text-2xl font-bold text-primary-500 mt-1">
                    {item.score}
                    <span className="text-sm font-normal text-gray-500 ml-1">天</span>
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {rankingData?.slice(3)?.map((item: any, idx: number) => (
              <div
                key={item.userId}
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="w-8 text-center font-bold text-gray-500">
                  {idx + 4}
                </span>
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-500 font-bold">
                      {item.nickname?.[0]}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.nickname}</p>
                  <p className="text-xs text-gray-500">
                    {item.groupStreak ? `连续打卡 ${item.groupStreak} 天` : `累计打卡 ${item.totalCheckins || item.score} 天`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-500">{item.score}</p>
                  <p className="text-xs text-gray-500">打卡天数</p>
                </div>
              </div>
            ))}
          </div>

          {(!rankingData || rankingData.length === 0) && (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>暂无排行数据</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
