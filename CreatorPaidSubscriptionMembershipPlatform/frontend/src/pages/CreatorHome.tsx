import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, CheckCircle, Share2, Crown, Eye } from 'lucide-react';
import TierCard from '@/components/TierCard';
import ContentCard from '@/components/ContentCard';
import { mockCreators, mockTiers, mockContents, mockSubscriptions } from '@/utils/mock';
import type { Creator, MembershipTier, Content, Subscription } from '@/types';
import { formatNumber } from '@/utils/format';

const CreatorHome = () => {
  const { id } = useParams();
  const creatorId = Number(id);

  const [creator, setCreator] = useState<Creator | null>(null);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [userTierLevel, setUserTierLevel] = useState(0);
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

  if (loading || !creator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-neutral-400">加载中...</div>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-80 overflow-hidden">
        {creator.coverImage ? (
          <img
            src={creator.coverImage}
            alt={creator.creatorName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-24 relative">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-3xl p-6 shadow-xl border border-neutral-200 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-32 h-32 rounded-3xl border-4 border-white mx-auto -mt-24 mb-4 
                  overflow-hidden bg-gradient-to-br from-primary-400 to-accent-400 
                  flex items-center justify-center text-white text-4xl font-bold shadow-lg animate-float">
                  {creator.creatorName?.[0] || 'C'}
                </div>
                <div className="flex items-center justify-center gap-2 mb-1">
                  <h1 className="font-display text-2xl font-bold text-neutral-800">
                    {creator.creatorName}
                  </h1>
                  {creator.isVerified && (
                    <CheckCircle className="w-5 h-5 text-primary-500 fill-primary-100" />
                  )}
                </div>
                <p className="text-sm text-neutral-500 flex items-center justify-center gap-1">
                  <Users className="w-4 h-4" />
                  {formatNumber(creator.totalSubscribers)} 位订阅者
                </p>
              </div>

              <p className="text-neutral-600 text-sm leading-relaxed mb-6">
                {creator.description}
              </p>

              <div className="flex gap-2">
                <Link
                  to={`/creator/${creatorId}/tiers`}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-accent-500 
                    text-white font-semibold rounded-xl text-center hover:shadow-lg 
                    hover:shadow-primary-500/25 transition-all active:scale-[0.98]"
                >
                  <Crown className="w-4 h-4 inline mr-1" />
                  订阅
                </Link>
                <button className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center 
                  hover:bg-neutral-200 transition-colors">
                  <Share2 className="w-5 h-5 text-neutral-600" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full">
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-neutral-800">会员等级</h2>
                <Link
                  to={`/creator/${creatorId}/tiers`}
                  className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1"
                >
                  查看全部
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tiers.map((tier, index) => (
                  <TierCard
                    key={tier.id}
                    tier={tier}
                    creatorId={creatorId}
                    isRecommended={index === 1}
                  />
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-neutral-800">最新内容</h2>
                <Link
                  to={`/creator/${creatorId}/contents`}
                  className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  查看全部
                </Link>
              </div>

              {userTierLevel > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-accent-50 
                  rounded-xl border border-primary-100">
                  <p className="text-sm text-primary-700">
                    <Crown className="w-4 h-4 inline mr-1" />
                    你当前是 <strong>{getTierName(userTierLevel)}</strong>，可以浏览 Lv.{userTierLevel} 及以下的全部内容
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contents.slice(0, 6).map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    canAccess={userTierLevel >= content.minTierLevel}
                    creatorId={creatorId}
                    tierName={getTierName(content.minTierLevel)}
                  />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatorHome;
