import { Link } from 'react-router-dom';
import { Check, Crown, Star } from 'lucide-react';
import type { MembershipTier } from '@/types';
import { formatPriceWithSymbol } from '@/utils/format';

interface TierCardProps {
  tier: MembershipTier;
  isRecommended?: boolean;
  creatorId: number;
  onSubscribe?: () => void;
}

const TierCard = ({ tier, isRecommended, creatorId, onSubscribe }: TierCardProps) => {
  const getTierColor = (level: number) => {
    const colors = [
      'from-neutral-500 to-neutral-600',
      'from-primary-500 to-primary-600',
      'from-accent-500 to-accent-600',
    ];
    return colors[level - 1] || colors[0];
  };

  const getTierBorder = (level: number) => {
    const borders = [
      'border-neutral-300',
      'border-primary-300',
      'border-accent-300',
    ];
    return borders[level - 1] || borders[0];
  };

  return (
    <div
      className={`relative bg-white rounded-2xl border-2 ${getTierBorder(tier.tierLevel)} 
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden
        ${isRecommended ? 'ring-4 ring-primary-200' : ''}`}
    >
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-accent-500 to-primary-500 text-white px-4 py-1 text-xs font-medium flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          推荐
        </div>
      )}

      <div className={`h-2 bg-gradient-to-r ${getTierColor(tier.tierLevel)}`} />

      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getTierColor(tier.tierLevel)} 
            flex items-center justify-center`}>
            <Crown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-800">{tier.tierName}</h3>
            <p className="text-sm text-neutral-500">Lv.{tier.tierLevel} 会员</p>
          </div>
        </div>

        <div className="mb-6">
          <span className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
            {formatPriceWithSymbol(tier.price)}
          </span>
          <span className="text-neutral-500 ml-1">/月</span>
        </div>

        <p className="text-neutral-600 mb-6 min-h-[48px]">{tier.description}</p>

        <div className="space-y-3 mb-6">
          {tier.benefits?.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${getTierColor(tier.tierLevel)} 
                flex items-center justify-center flex-shrink-0`}>
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-neutral-700 text-sm">{benefit}</span>
            </div>
          ))}
        </div>

        {onSubscribe ? (
          <button
            onClick={onSubscribe}
            className={`w-full py-3 rounded-xl font-semibold text-white 
              bg-gradient-to-r ${getTierColor(tier.tierLevel)}
              hover:shadow-lg hover:shadow-primary-500/25 transition-all
              active:scale-[0.98]`}
          >
            立即订阅
          </button>
        ) : (
          <Link
            to={`/creator/${creatorId}/tiers`}
            className={`w-full py-3 rounded-xl font-semibold text-white 
              bg-gradient-to-r ${getTierColor(tier.tierLevel)}
              hover:shadow-lg hover:shadow-primary-500/25 transition-all
              active:scale-[0.98] block text-center`}
          >
            查看详情
          </Link>
        )}
      </div>
    </div>
  );
};

export default TierCard;
