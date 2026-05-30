import { Link } from 'react-router-dom';
import { Lock, Crown, ArrowRight } from 'lucide-react';

interface ContentLockProps {
  minTierLevel: number;
  creatorId: number;
  tierName?: string;
}

const ContentLock = ({ minTierLevel, creatorId, tierName }: ContentLockProps) => {
  return (
    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/60 to-transparent 
      backdrop-blur-sm flex flex-col items-center justify-center p-6 rounded-2xl z-10">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 
        flex items-center justify-center mb-4 animate-pulse-glow">
        <Lock className="w-8 h-8 text-white" />
      </div>

      <div className="text-center mb-6">
        <h4 className="text-xl font-bold text-white mb-2">
          专属内容 · {tierName || `Lv.${minTierLevel} 会员`}
        </h4>
        <p className="text-neutral-300 text-sm">
          订阅后即可解锁此内容及更多专属权益
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          to={`/creator/${creatorId}/tiers`}
          className="w-full py-3 px-6 bg-gradient-to-r from-primary-500 to-accent-500 
            text-white font-semibold rounded-xl flex items-center justify-center gap-2
            hover:shadow-lg hover:shadow-primary-500/30 transition-all active:scale-[0.98]"
        >
          <Crown className="w-5 h-5" />
          立即订阅
          <ArrowRight className="w-4 h-4" />
        </Link>

        <button
          onClick={() => navigator.clipboard.writeText(window.location.href)}
          className="w-full py-2 px-6 bg-white/10 backdrop-blur text-white/80 
            text-sm rounded-xl hover:bg-white/20 transition-all"
        >
          分享给好友
        </button>
      </div>

      <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 
        bg-black/30 backdrop-blur rounded-full">
        <Crown className="w-3 h-3 text-accent-400" />
        <span className="text-xs text-white/80">会员专享</span>
      </div>
    </div>
  );
};

export default ContentLock;
