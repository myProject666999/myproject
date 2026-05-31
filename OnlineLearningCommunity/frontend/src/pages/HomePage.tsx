import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { postApi, groupApi, checkinApi, rankingApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Calendar, Trophy, Users, Heart, MessageCircle, TrendingUp, Flame, Target } from 'lucide-react';
import dayjs from '../utils/dayjs';

export default function HomePage() {
  const { user } = useAuthStore();

  const { data: feedData } = useQuery('feed', () =>
    postApi.getFeed({ page: 1, limit: 10 }).then((res) => res.data)
  );

  const { data: groupsData } = useQuery('hotGroups', () =>
    groupApi.getGroups({ page: 1, limit: 5 }).then((res) => res.data)
  );

  const { data: stats } = useQuery('homeStats', () =>
    checkinApi.getCheckinStats().then((res) => res.data)
  );

  const { data: ranking } = useQuery('globalRanking', () =>
    rankingApi.getGlobalRanking({ limit: 5 }).then((res) => res.data)
  );

  return (
    <div className="space-y-6">
      <div className="card bg-gradient-to-r from-primary-500 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">你好，{user?.nickname}！</h2>
            <p className="text-primary-100 mt-1">
              {dayjs().format('YYYY年MM月DD日 dddd')}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">{stats?.totalCheckins || 0}</p>
            <p className="text-primary-100 text-sm">累计打卡天数</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <Flame className="w-6 h-6 mx-auto mb-1" />
            <p className="text-lg font-bold">{user?.currentStreak || 0}</p>
            <p className="text-xs text-primary-100">连续天数</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-1" />
            <p className="text-lg font-bold">{stats?.weekCheckins || 0}</p>
            <p className="text-xs text-primary-100">本周打卡</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <Target className="w-6 h-6 mx-auto mb-1" />
            <p className="text-lg font-bold">{stats?.monthCheckins || 0}</p>
            <p className="text-xs text-primary-100">本月打卡</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">动态流</h3>
            <Link to="/checkin" className="text-primary-500 text-sm hover:text-primary-600">
              发布动态 →
            </Link>
          </div>

          {feedData?.data?.map((post: any) => (
            <div key={post.id} className="card">
              <div className="flex items-start space-x-3">
                {post.user?.avatar ? (
                  <img src={post.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-500 font-bold">{post.user?.nickname?.[0]}</span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{post.user?.nickname}</span>
                    {post.group && (
                      <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded">
                        {post.group.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{dayjs(post.createdAt).fromNow()}</p>
                </div>
              </div>
              <p className="mt-3 text-gray-700">{post.content}</p>
              {post.images && post.images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {post.images.slice(0, 3).map((img: string, idx: number) => (
                    <img key={idx} src={img} alt="" className="w-full h-24 object-cover rounded-lg" />
                  ))}
                </div>
              )}
              <div className="mt-4 flex items-center space-x-6 text-gray-500">
                <span className="flex items-center space-x-1 hover:text-red-500 cursor-pointer">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">{post.likeCount}</span>
                </span>
                <Link to={`/posts/${post.id}`} className="flex items-center space-x-1 hover:text-primary-500">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{post.commentCount}</span>
                </Link>
              </div>
            </div>
          ))}

          {(!feedData?.data || feedData.data.length === 0) && (
            <div className="card text-center py-12 text-gray-500">
              <p>暂无动态，快去发布第一条吧！</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
              排行榜
            </h3>
            <div className="space-y-3">
              {ranking?.map((item: any, idx: number) => (
                <div key={item.userId} className="flex items-center space-x-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-yellow-400 text-white' :
                    idx === 1 ? 'bg-gray-400 text-white' :
                    idx === 2 ? 'bg-orange-400 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {idx + 1}
                  </span>
                  {item.avatar ? (
                    <img src={item.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-500 text-sm">{item.nickname?.[0]}</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.nickname}</p>
                    <p className="text-xs text-gray-500">{item.score}天</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/ranking" className="block mt-4 text-center text-sm text-primary-500 hover:text-primary-600">
              查看完整排行 →
            </Link>
          </div>

          <div className="card">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
              <Users className="w-5 h-5 text-primary-500 mr-2" />
              热门小组
            </h3>
            <div className="space-y-3">
              {groupsData?.data?.map((group: any) => (
                <Link
                  key={group.id}
                  to={`/groups/${group.id}`}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {group.avatar ? (
                    <img src={group.avatar} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{group.name}</p>
                    <p className="text-xs text-gray-500">{group.category} · {group.memberCount}人</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/groups" className="block mt-4 text-center text-sm text-primary-500 hover:text-primary-600">
              查看全部小组 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
