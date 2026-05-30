import { Link } from 'react-router-dom';
import { Users, Crown, CheckCircle } from 'lucide-react';
import type { Creator } from '@/types';
import { formatNumber, formatPriceWithSymbol } from '@/utils/format';

interface CreatorCardProps {
  creator: Creator;
}

const CreatorCard = ({ creator }: CreatorCardProps) => {
  return (
    <Link
      to={`/creator/${creator.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-neutral-200 
        hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="h-32 relative overflow-hidden">
        {creator.coverImage ? (
          <img
            src={creator.coverImage}
            alt={creator.creatorName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="px-6 pb-6 -mt-12">
        <div className="flex items-end justify-between mb-4">
          <div className="w-24 h-24 rounded-2xl border-4 border-white overflow-hidden 
            bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center 
            text-white text-2xl font-bold shadow-lg group-hover:scale-105 transition-transform">
            {creator.creatorName?.[0] || 'C'}
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-primary-50 rounded-full">
            <Crown className="w-4 h-4 text-primary-500" />
            <span className="text-xs font-medium text-primary-600">创作者</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-bold text-neutral-800">{creator.creatorName}</h3>
            {creator.isVerified && (
              <CheckCircle className="w-5 h-5 text-primary-500 fill-primary-100" />
            )}
          </div>
          <p className="text-neutral-500 text-sm line-clamp-2">{creator.description}</p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-neutral-500">
            <Users className="w-4 h-4" />
            <span>{formatNumber(creator.totalSubscribers)} 订阅者</span>
          </div>
          <div className="text-primary-600 font-medium">
            {formatPriceWithSymbol(990)} 起/月
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CreatorCard;
