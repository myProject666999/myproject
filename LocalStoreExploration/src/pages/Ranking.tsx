import { useState, useEffect } from 'react';
import { Trophy, Users, Eye, Crown, Medal, Award } from 'lucide-react';
import { DarenRanking } from '../types';
import { api } from '../services/api';

const mockRankings: DarenRanking[] = [
  {
    rank: 1,
    userId: 1,
    hotScore: 15860,
    user: {
      id: 1,
      username: 'daren1',
      nickname: '美食达人小王',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
      bio: '专注美食探店10年，吃遍全城好吃的！',
      followersCount: 12580,
      notesCount: 156,
      isVerified: 1,
      createdAt: '2023-01-01T00:00:00Z',
    },
  },
  {
    rank: 2,
    userId: 2,
    hotScore: 10730,
    user: {
      id: 2,
      username: 'daren2',
      nickname: '探店达人小美',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      bio: '颜值与美食并存，带你发现隐藏的美食',
      followersCount: 8950,
      notesCount: 89,
      isVerified: 1,
      createdAt: '2023-02-01T00:00:00Z',
    },
  },
  {
    rank: 3,
    userId: 3,
    hotScore: 8420,
    user: {
      id: 3,
      username: 'daren3',
      nickname: '吃货老张',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      bio: '不是在吃，就是在去吃的路上',
      followersCount: 5680,
      notesCount: 72,
      isVerified: 1,
      createdAt: '2023-03-01T00:00:00Z',
    },
  },
  {
    rank: 4,
    userId: 4,
    hotScore: 3240,
    user: {
      id: 4,
      username: 'user1',
      nickname: '普通用户小李',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      bio: '爱吃爱玩',
      followersCount: 120,
      notesCount: 5,
      isVerified: 0,
      createdAt: '2023-06-01T00:00:00Z',
    },
  },
];

export default function Ranking() {
  const [rankings, setRankings] = useState<DarenRanking[]>(mockRankings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setRankings(mockRankings);
      } catch (error) {
        console.error('Failed to fetch rankings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
    if (rank === 2) return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
    if (rank === 3) return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
    return 'bg-white border-gray-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 pt-8 pb-16 px-4">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-yellow-400" />
          <h1 className="text-2xl font-bold text-white">达人榜</h1>
        </div>
        <p className="text-purple-100 text-sm">发现最受欢迎的美食达人</p>
      </div>

      <div className="px-4 -mt-10">
        <div className="grid grid-cols-3 gap-3 mb-6">
          {rankings.slice(0, 3).map((item, index) => {
            const isTop = index === 0;
            const order = [1, 0, 2];
            const rank = order[index] + 1;
            const data = rankings[order[index]];
            return (
              <div
                key={data.user.id}
                className={`bg-white rounded-2xl p-4 text-center ${
                  isTop ? 'transform scale-105 -mt-4 shadow-lg' : ''
                }`}
              >
                <div className="relative inline-block">
                  <img
                    src={data.user.avatar}
                    alt={data.user.nickname}
                    className={`w-16 h-16 rounded-full mx-auto border-4 ${
                      rank === 1 ? 'border-yellow-400' : rank === 2 ? 'border-gray-300' : 'border-amber-400'
                    }`}
                  />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    {getRankIcon(rank)}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mt-4 text-sm">
                  {data.user.nickname}
                </h3>
                {data.user.isVerified && (
                  <span className="text-xs text-orange-500">✓ 认证达人</span>
                )}
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500">
                  <Users className="w-3 h-3" />
                  <span>{data.user.followersCount}</span>
                </div>
                <div className="mt-2 text-sm font-bold text-purple-600">
                  {data.hotScore.toLocaleString()} 热度
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl overflow-hidden">
          {rankings.slice(3).map((item) => (
            <div
              key={item.user.id}
              className="flex items-center gap-4 p-4 border-b border-gray-50 last:border-0"
            >
              <div className="w-8 flex justify-center">
                {getRankIcon(item.rank)}
              </div>
              <img
                src={item.user.avatar}
                alt={item.user.nickname}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {item.user.nickname}
                  </h3>
                  {item.user.isVerified && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                      达人
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                  {item.user.bio}
                </p>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {item.user.followersCount} 粉丝
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {item.user.notesCount} 笔记
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-purple-600">
                  {item.hotScore.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">热度</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
