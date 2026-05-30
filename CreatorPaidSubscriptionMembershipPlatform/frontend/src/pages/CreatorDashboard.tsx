import { useEffect, useState } from 'react';
import { DollarSign, Clock, Wallet, Users, TrendingUp, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { mockEarnings, mockEarningDetails, mockWithdrawals, mockCurrentUser } from '@/utils/mock';
import type { CreatorEarnings, EarningDetail, WithdrawalRecord } from '@/types';
import { formatPriceWithSymbol, formatDate, formatNumber, getStatusColor, getStatusBg, getStatusText } from '@/utils/format';

const CreatorDashboard = () => {
  const [earnings, setEarnings] = useState<CreatorEarnings | null>(null);
  const [earningDetails, setEarningDetails] = useState<EarningDetail[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings' | 'withdrawals'>('overview');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setEarnings(mockEarnings);
      setEarningDetails(mockEarningDetails);
      setWithdrawals(mockWithdrawals);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (amount >= 10000 && earnings && amount <= earnings.availableEarnings) {
      alert(`提现申请已提交！金额：${formatPriceWithSymbol(amount)}`);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
    }
  };

  if (loading || !earnings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-neutral-400">加载中...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-r from-primary-500 to-accent-500 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-3xl font-bold">
              {mockCurrentUser.nickname?.[0] || 'C'}
            </div>
            <div className="text-white">
              <h1 className="font-display text-3xl font-bold mb-1">创作者收益台</h1>
              <p className="text-white/80">欢迎回来，{mockCurrentUser.nickname}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="总收入"
            value={formatPriceWithSymbol(earnings.totalEarnings)}
            icon={<DollarSign className="w-6 h-6" />}
            color="primary"
            trend={{ value: 12.5, isUp: true }}
          />
          <StatCard
            title="待结算"
            value={formatPriceWithSymbol(earnings.pendingEarnings)}
            icon={<Clock className="w-6 h-6" />}
            color="warning"
          />
          <StatCard
            title="可提现"
            value={formatPriceWithSymbol(earnings.availableEarnings)}
            icon={<Wallet className="w-6 h-6" />}
            color="success"
            trend={{ value: 8.2, isUp: true }}
          />
          <StatCard
            title="活跃订阅"
            value={formatNumber(earnings.activeSubscribers)}
            icon={<Users className="w-6 h-6" />}
            color="accent"
            trend={{ value: 5.3, isUp: true }}
          />
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200 mb-8">
          <div className="flex border-b border-neutral-200">
            {[
              { key: 'overview', label: '收益概览', icon: <TrendingUp className="w-4 h-4" /> },
              { key: 'earnings', label: '收益明细', icon: <DollarSign className="w-4 h-4" /> },
              { key: 'withdrawals', label: '提现记录', icon: <CreditCard className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'text-primary-600 border-primary-500 bg-primary-50/50'
                    : 'text-neutral-500 border-transparent hover:text-neutral-700'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    disabled={earnings.availableEarnings < 10000}
                    className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wallet className="w-5 h-5 inline mr-2" />
                    申请提现
                  </button>
                  <div className="flex-1 flex items-center text-sm text-neutral-500">
                    最低提现金额：{formatPriceWithSymbol(10000)}，当前可提现：
                    <span className="text-success-500 font-semibold ml-1">
                      {formatPriceWithSymbol(earnings.availableEarnings)}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-neutral-800 mb-4">收益趋势</h3>
                  <div className="h-64 bg-neutral-50 rounded-xl flex items-center justify-center">
                    <div className="text-center text-neutral-400">
                      <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                      <p>图表组件预留位置</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-neutral-800 mb-4">最近收益</h3>
                  <div className="space-y-3">
                    {earningDetails.slice(0, 5).map((detail) => (
                      <div
                        key={detail.id}
                        className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl ${getStatusBg(detail.settlementStatus)} flex items-center justify-center text-white`}>
                            {detail.settlementStatus === 'PENDING' ? (
                              <Clock className="w-5 h-5" />
                            ) : detail.settlementStatus === 'SETTLED' ? (
                              <ArrowUpRight className="w-5 h-5" />
                            ) : (
                              <ArrowDownRight className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-800">
                              {detail.type === 'SUBSCRIPTION' ? '订阅收入' : '打赏收入'}
                            </p>
                            <p className="text-sm text-neutral-500">{formatDate(detail.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-success-500">
                            +{formatPriceWithSymbol(detail.amount)}
                          </p>
                          <p className={`text-sm ${getStatusColor(detail.settlementStatus)}`}>
                            {getStatusText(detail.settlementStatus)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'earnings' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-4 px-4 text-neutral-500 font-medium">时间</th>
                      <th className="text-left py-4 px-4 text-neutral-500 font-medium">类型</th>
                      <th className="text-right py-4 px-4 text-neutral-500 font-medium">金额</th>
                      <th className="text-right py-4 px-4 text-neutral-500 font-medium">平台抽成</th>
                      <th className="text-right py-4 px-4 text-neutral-500 font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earningDetails.map((detail) => (
                      <tr key={detail.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-4 px-4 text-neutral-600">{formatDate(detail.createdAt)}</td>
                        <td className="py-4 px-4 text-neutral-800">
                          {detail.type === 'SUBSCRIPTION' ? '订阅收入' : '打赏收入'}
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-success-500">
                          +{formatPriceWithSymbol(detail.amount)}
                        </td>
                        <td className="py-4 px-4 text-right text-neutral-500">
                          {formatPriceWithSymbol(detail.platformFee)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(detail.settlementStatus)}`}>
                            {getStatusText(detail.settlementStatus)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'withdrawals' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-4 px-4 text-neutral-500 font-medium">提现单号</th>
                      <th className="text-left py-4 px-4 text-neutral-500 font-medium">申请时间</th>
                      <th className="text-right py-4 px-4 text-neutral-500 font-medium">金额</th>
                      <th className="text-left py-4 px-4 text-neutral-500 font-medium">方式</th>
                      <th className="text-right py-4 px-4 text-neutral-500 font-medium">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-4 px-4 font-mono text-sm text-neutral-600">{withdrawal.withdrawalNo}</td>
                        <td className="py-4 px-4 text-neutral-600">{formatDate(withdrawal.createdAt)}</td>
                        <td className="py-4 px-4 text-right font-semibold text-neutral-800">
                          {formatPriceWithSymbol(withdrawal.amount)}
                        </td>
                        <td className="py-4 px-4 text-neutral-600">
                          {withdrawal.withdrawalMethod === 'ALIPAY' ? '支付宝' : '微信支付'}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                            {getStatusText(withdrawal.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 animate-fade-in-up">
            <h3 className="font-display text-2xl font-bold text-neutral-800 mb-6">申请提现</h3>

            <div className="bg-neutral-50 rounded-2xl p-4 mb-6">
              <p className="text-sm text-neutral-500 mb-1">可提现金额</p>
              <p className="text-3xl font-bold text-primary-600">
                {formatPriceWithSymbol(earnings.availableEarnings)}
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">提现金额</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-lg">¥</span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="请输入提现金额"
                  min="10000"
                  max={earnings.availableEarnings}
                  className="w-full pl-10 pr-4 py-4 border-2 border-neutral-200 rounded-xl text-xl font-semibold focus:border-primary-400 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-sm text-neutral-500 mt-2">
                最低提现金额 {formatPriceWithSymbol(10000)}，全部提现 
                <button 
                  onClick={() => setWithdrawAmount(earnings.availableEarnings.toString())}
                  className="text-primary-600 hover:underline ml-1"
                >
                  点击填写
                </button>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-4 border-2 border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleWithdraw}
                disabled={!withdrawAmount || parseInt(withdrawAmount) < 10000 || parseInt(withdrawAmount) > earnings.availableEarnings}
                className="flex-1 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认提现
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatorDashboard;
