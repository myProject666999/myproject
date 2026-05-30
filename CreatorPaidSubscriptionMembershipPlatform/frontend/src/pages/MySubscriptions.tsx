import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Calendar, XCircle, RefreshCw, ChevronRight, AlertCircle } from 'lucide-react';
import { mockSubscriptions, mockCreators, mockTiers } from '@/utils/mock';
import type { Subscription, Creator, MembershipTier } from '@/types';
import { formatPriceWithSymbol, formatDate, getStatusColor, getStatusText } from '@/utils/format';

const MySubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSubscriptions(mockSubscriptions);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const getCreator = (creatorId: number) => {
    return mockCreators.find(c => c.id === creatorId);
  };

  const getTier = (tierId: number) => {
    return mockTiers.find(t => t.id === tierId);
  };

  const handleCancelClick = (sub: Subscription, immediate: boolean) => {
    setSelectedSubscription(sub);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = (immediate: boolean) => {
    if (selectedSubscription) {
      alert(`已${immediate ? '立即' : '到期后'}取消订阅！（模拟）`);
      setShowCancelModal(false);
      setSelectedSubscription(null);
    }
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE');
  const inactiveSubscriptions = subscriptions.filter(s => s.status !== 'ACTIVE');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-neutral-400">加载中...</div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-neutral-800 mb-2">我的订阅</h1>
            <p className="text-neutral-500">管理你的创作者订阅</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: '活跃订阅', value: activeSubscriptions.length, color: 'success' },
              { label: '本月支出', value: formatPriceWithSymbol(3980), color: 'primary' },
              { label: '累计支持', value: formatPriceWithSymbol(25800), color: 'accent' },
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
                <p className="text-neutral-500 mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold ${
                  stat.color === 'success' ? 'text-success-500' :
                  stat.color === 'primary' ? 'text-primary-600' : 'text-accent-500'
                }`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {activeSubscriptions.length > 0 && (
            <div className="mb-12">
              <h2 className="font-display text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                <Crown className="w-6 h-6 text-primary-500" />
                活跃订阅
              </h2>
              <div className="space-y-4">
                {activeSubscriptions.map((sub) => {
                  const creator = getCreator(sub.creatorId);
                  const tier = getTier(sub.tierId);
                  return (
                    <div
                      key={sub.id}
                      className="bg-white rounded-2xl border border-neutral-200 p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-400 
                          flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                          {creator?.creatorName?.[0] || 'C'}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <Link
                              to={`/creator/${sub.creatorId}`}
                              className="text-xl font-bold text-neutral-800 hover:text-primary-600 transition-colors"
                            >
                              {creator?.creatorName}
                            </Link>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)} bg-opacity-10`}
                              style={{ backgroundColor: 'currentColor', opacity: 0.1 }}>
                              {getStatusText(sub.status)}
                            </span>
                          </div>
                          <p className="text-primary-600 font-medium mb-2">{tier?.tierName}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              到期：{formatDate(sub.currentPeriodEnd)}
                            </span>
                            <span className="flex items-center gap-1">
                              <RefreshCw className="w-4 h-4" />
                              {sub.autoRenew === 1 ? '自动续费已开启' : '自动续费已关闭'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <p className="text-2xl font-bold text-primary-600">
                            {formatPriceWithSymbol(sub.lastPaymentAmount)}
                            <span className="text-sm font-normal text-neutral-500">/月</span>
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCancelClick(sub, false)}
                              className="px-4 py-2 text-neutral-600 hover:text-red-500 font-medium transition-colors"
                            >
                              取消订阅
                            </button>
                            <Link
                              to={`/creator/${sub.creatorId}/contents`}
                              className="px-4 py-2 bg-primary-500 text-white font-medium rounded-xl hover:bg-primary-600 transition-colors flex items-center gap-1"
                            >
                              浏览内容
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {inactiveSubscriptions.length > 0 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-neutral-800 mb-6 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-neutral-400" />
                历史订阅
              </h2>
              <div className="space-y-4">
                {inactiveSubscriptions.map((sub) => {
                  const creator = getCreator(sub.creatorId);
                  const tier = getTier(sub.tierId);
                  return (
                    <div
                      key={sub.id}
                      className="bg-white rounded-2xl border border-neutral-200 p-6 opacity-75"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-neutral-200 flex items-center justify-center text-neutral-500 text-2xl font-bold flex-shrink-0">
                          {creator?.creatorName?.[0] || 'C'}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-xl font-bold text-neutral-800">
                              {creator?.creatorName}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)} bg-opacity-10`}
                              style={{ backgroundColor: 'currentColor', opacity: 0.1 }}>
                              {getStatusText(sub.status)}
                            </span>
                          </div>
                          <p className="text-neutral-600 mb-2">{tier?.tierName}</p>
                          <p className="text-sm text-neutral-500">
                            取消于：{sub.canceledAt ? formatDate(sub.canceledAt) : formatDate(sub.currentPeriodEnd)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Link
                            to={`/creator/${sub.creatorId}/tiers`}
                            className="px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                          >
                            重新订阅
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {subscriptions.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200">
              <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-6">
                <Crown className="w-10 h-10 text-neutral-400" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-800 mb-2">还没有订阅</h3>
              <p className="text-neutral-500 mb-6">发现优质创作者，支持你喜爱的内容</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                发现创作者
              </Link>
            </div>
          )}
        </div>
      </div>

      {showCancelModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="font-display text-2xl font-bold text-neutral-800 text-center mb-2">
              取消订阅？
            </h3>
            <p className="text-neutral-500 text-center mb-8">
              你可以选择立即取消或在计费周期结束时取消。
              <br />
              立即取消将立即失去会员权益。
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleConfirmCancel(false)}
                className="w-full py-4 border-2 border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
              >
                到期后取消
              </button>
              <button
                onClick={() => handleConfirmCancel(true)}
                className="w-full py-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
              >
                立即取消
              </button>
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full py-4 text-neutral-500 font-medium hover:text-neutral-700 transition-colors"
              >
                暂不取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MySubscriptions;
