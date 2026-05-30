import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Filter, Eye, Heart, MessageCircle, Clock, Lock, Crown } from 'lucide-react';
import ContentCard from '@/components/ContentCard';
import { mockCreators, mockTiers, mockContents, mockSubscriptions } from '@/utils/mock';
import type { Creator, MembershipTier, Content } from '@/types';

const ContentFeed = () => {
  const { id } = useParams();
  const creatorId = Number(id);

  const [creator, setCreator] = useState<Creator | null>(null);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [userTierLevel, setUserTierLevel] = useState(0);
  const [filter, setFilter] = useState<'all' | 'free' | 'locked'>('all');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const foundCreator = mockCreators.find(c => c.id === creatorId) || mockCreators[0];
      setCreator(foundCreator);
      setTiers(mockTiers);
      setContents(mockContents);

      const sub = mockSubscriptions.find(
        s => s.creatorId === creatorId && s.status === 'ACTIVE'
      );
      if (sub) {
        const tier = mockTiers.find(t => t.id === sub.tierId);
        setUserTierLevel(tier?.tierLevel || 0);
      } else {
        setUserTierLevel(0);
      }

      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [creatorId]);

  const getTierName = (level: number) => {
    const tier = tiers.find(t => t.tierLevel === level);
    return tier?.tierName;
  };

  const filteredContents = contents.filter(content => {
    if (filter === 'free') return content.minTierLevel === 0;
    if (filter === 'locked') return content.minTierLevel > userTierLevel;
    return true;
  });

  if (loading || !creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-neutral-400">加载中...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border-b border-neutral-200 sticky top-16 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to={`/creator/${creatorId}`}
                className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                返回
              </Link>
              <div>
                <h1 className="font-display text-2xl font-bold text-neutral-800">
                  {creator.creatorName} 的内容
                </h1>
                <p className="text-sm text-neutral-500">共 {contents.length} 篇内容</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1">
                {[
                  { key: 'all', label: '全部' },
                  { key: 'free', label: '免费' },
                  { key: 'locked', label: '未解锁' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setFilter(item.key as typeof filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      filter === item.key
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {userTierLevel > 0 && (
          <div className="mb-8 p-4 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border border-primary-100">
            <p className="text-sm text-primary-700">
              <Crown className="w-4 h-4 inline mr-1" />
              你当前是 <strong>{getTierName(userTierLevel)}</strong>，可以浏览 Lv.{userTierLevel} 及以下的全部内容
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContents.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              canAccess={userTierLevel >= content.minTierLevel}
              creatorId={creatorId}
              tierName={getTierName(content.minTierLevel)}
            />
          ))}
        </div>

        {filteredContents.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-neutral-500">暂无符合条件的内容</p>
          </div>
        )}
      </div>

      {selectedContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-fade-in-up">
            <div className="relative h-64 overflow-hidden">
              {selectedContent.thumbnailUrl ? (
                <img
                  src={selectedContent.thumbnailUrl}
                  alt={selectedContent.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100" />
              )}
              {selectedContent.minTierLevel > userTierLevel && (
                <div className="absolute inset-0 bg-neutral-900/70 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-12 h-12 text-white mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">
                      {getTierName(selectedContent.minTierLevel)} 专属内容
                    </h3>
                    <Link
                      to={`/creator/${creatorId}/tiers`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl"
                    >
                      <Crown className="w-5 h-5" />
                      立即订阅解锁
                    </Link>
                  </div>
                </div>
              )}
              <button
                onClick={() => setSelectedContent(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
              >
                ×
              </button>
            </div>

            {selectedContent.minTierLevel <= userTierLevel && (
              <div className="p-8 overflow-y-auto max-h-[60vh]">
                <div className="flex items-center gap-4 mb-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedContent.minTierLevel === 0
                      ? 'bg-neutral-100 text-neutral-600'
                      : 'bg-primary-50 text-primary-600'
                  }`}>
                    {selectedContent.minTierLevel === 0 ? '公开' : `${getTierName(selectedContent.minTierLevel)} 专属`}
                  </span>
                  <span className="text-sm text-neutral-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedContent.createdAt}
                  </span>
                </div>

                <h2 className="font-display text-3xl font-bold text-neutral-800 mb-6">
                  {selectedContent.title}
                </h2>

                <div className="prose prose-lg max-w-none mb-8">
                  <p className="text-neutral-600 leading-relaxed text-lg">
                    {selectedContent.content}
                  </p>
                  <p className="text-neutral-600 leading-relaxed mt-4">
                    这是完整的文章内容。作为尊贵的会员，你可以阅读这篇深度分析文章的全部内容。
                    文章中包含了详细的数据对比、性能测试和使用体验，希望能为你的选购决策提供帮助。
                  </p>
                </div>

                <div className="flex items-center gap-6 pt-6 border-t border-neutral-200">
                  <button className="flex items-center gap-2 text-neutral-500 hover:text-primary-600 transition-colors">
                    <Eye className="w-5 h-5" />
                    {selectedContent.viewCount}
                  </button>
                  <button className="flex items-center gap-2 text-neutral-500 hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                    {selectedContent.likeCount}
                  </button>
                  <button className="flex items-center gap-2 text-neutral-500 hover:text-primary-600 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    {selectedContent.commentCount}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ContentFeed;
