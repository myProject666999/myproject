import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, X, ArrowLeft, Crown, Star, Zap } from 'lucide-react';
import TierCard from '@/components/TierCard';
import { mockCreators, mockTiers, mockSubscriptions } from '@/utils/mock';
import type { Creator, MembershipTier, Subscription } from '@/types';
import { formatPriceWithSymbol } from '@/utils/format';

const MembershipTiers = () => {
  const { id } = useParams();
  const creatorId = Number(id);

  const [creator, setCreator] = useState<Creator | null>(null);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [currentTier, setCurrentTier] = useState<MembershipTier | null>(null);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const foundCreator = mockCreators.find(c => c.id === creatorId) || mockCreators[0];
      setCreator(foundCreator);
      setTiers(mockTiers);

      const sub = mockSubscriptions.find(
        s => s.creatorId === creatorId && s.status === 'ACTIVE'
      );
      if (sub) {
        const tier = mockTiers.find(t => t.id === sub.tierId);
        setCurrentTier(tier || null);
      }

      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [creatorId]);

  const handleSubscribe = (tier: MembershipTier) => {
    setSelectedTier(tier);
    setShowSubscribeModal(true);
  };

  const allBenefits = Array.from(new Set(tiers.flatMap(t => t.benefits))).sort((a, b) => {
    const countA = tiers.filter(t => t.benefits.includes(a)).length;
    const countB = tiers.filter(t => t.benefits.includes(b)).length;
    return countB - countA;
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
      <div className="bg-gradient-to-br from-primary-500/10 via-white to-accent-500/10 py-12">
        <div className="container mx-auto px-4">
          <Link
            to={`/creator/${creatorId}`}
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回创作者主页
          </Link>

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-display text-4xl font-bold text-neutral-800 mb-4">
              选择适合你的会员等级
            </h1>
            <p className="text-lg text-neutral-500">
              支持 <span className="font-semibold text-primary-600">{creator.creatorName}</span> 的创作，
              解锁专属内容和会员特权
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier, index) => (
            <div key={tier.id} className="relative">
              {currentTier?.id === tier.id && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 
                  bg-success-500 text-white text-sm font-medium rounded-full z-10">
                  当前订阅
                </div>
              )}
              <TierCard
                tier={tier}
                creatorId={creatorId}
                isRecommended={index === 1}
                onSubscribe={() => handleSubscribe(tier)}
              />
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-neutral-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-neutral-200">
            <h2 className="font-display text-2xl font-bold text-neutral-800 flex items-center gap-3">
              <Zap className="w-6 h-6 text-accent-500" />
              权益对比
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="p-4 text-left text-neutral-500 font-medium">权益</th>
                  {tiers.map(tier => (
                    <th key={tier.id} className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <Crown className={`w-5 h-5 ${
                          tier.tierLevel === 1 ? 'text-neutral-500' :
                          tier.tierLevel === 2 ? 'text-primary-500' : 'text-accent-500'
                        }`} />
                        <span className="font-semibold text-neutral-800">{tier.tierName}</span>
                        <span className="text-sm text-neutral-500">
                          {formatPriceWithSymbol(tier.price)}/月
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allBenefits.map((benefit, index) => (
                  <tr
                    key={index}
                    className={`border-b border-neutral-100 ${
                      index % 2 === 0 ? 'bg-neutral-50/50' : ''
                    }`}
                  >
                    <td className="p-4 text-neutral-700">{benefit}</td>
                    {tiers.map(tier => (
                      <td key={tier.id} className="p-4 text-center">
                        {tier.benefits.includes(benefit) ? (
                          <div className="flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-success-500 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <X className="w-5 h-5 text-neutral-300" />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 p-8 bg-gradient-to-r from-primary-50 to-accent-50 rounded-3xl border border-primary-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl font-bold text-neutral-800 mb-2">
                为什么选择按月订阅？
              </h3>
              <p className="text-neutral-600">
                灵活订阅，随时取消。你的支持让创作者能够持续创作优质内容。
              </p>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-100" />
                <span className="text-neutral-700">随时取消</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-100" />
                <span className="text-neutral-700">按月付费</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-100" />
                <span className="text-neutral-700">安全支付</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSubscribeModal && selectedTier && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 animate-fade-in-up">
            <h3 className="font-display text-2xl font-bold text-neutral-800 mb-2">
              确认订阅
            </h3>
            <p className="text-neutral-500 mb-6">
              你即将订阅 <span className="font-semibold text-primary-600">{creator.creatorName}</span> 的
              <span className="font-semibold"> {selectedTier.tierName}</span>
            </p>

            <div className="bg-neutral-50 rounded-2xl p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-neutral-500">会员等级</span>
                <span className="font-medium">{selectedTier.tierName}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-neutral-500">计费周期</span>
                <span className="font-medium">每月</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-200">
                <span className="text-neutral-500">应付金额</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatPriceWithSymbol(selectedTier.price)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubscribeModal(false)}
                className="flex-1 py-3 border-2 border-neutral-200 text-neutral-700 
                  font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  alert('订阅成功！（模拟）');
                  setShowSubscribeModal(false);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-primary-500 to-accent-500 
                  text-white font-semibold rounded-xl hover:shadow-lg 
                  hover:shadow-primary-500/25 transition-all active:scale-[0.98]"
              >
                确认支付
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MembershipTiers;
