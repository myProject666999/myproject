import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Calendar,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { performanceAPI, portfolioAPI } from '../services/api';
import { cn } from '../lib/utils';

interface PerformanceData {
  date: string;
  totalValue: number;
  cashBalance: number;
  profit: number;
  profitPercent: number;
}

interface Transaction {
  id: number;
  symbol: string;
  name: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  total: number;
  created_at: string;
}

const Performance: React.FC = () => {
  const [performance, setPerformance] = useState<any>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [activeTab, setActiveTab] = useState<'chart' | 'transactions'>('chart');

  const loadData = async () => {
    try {
      const [perfResponse, transResponse] = await Promise.all([
        performanceAPI.getPerformance(timeRange),
        portfolioAPI.getTransactions(1, 20)
      ]);
      setPerformance(perfResponse.data);
      setTransactions(transResponse.data.transactions);
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const chartData = performance?.history || [];
  const initialInvestment = 100000;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">收益分析</h1>
        <p className="text-gray-500 mt-1">查看您的投资收益和交易历史</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center space-x-2 text-gray-500 text-sm mb-2">
            <DollarSign className="w-4 h-4" />
            <span>总资产</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ¥{performance?.currentTotalValue?.toLocaleString() || '0.00'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center space-x-2 text-gray-500 text-sm mb-2">
            <BarChart3 className="w-4 h-4" />
            <span>持仓市值</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ¥{performance?.totalMarketValue?.toLocaleString() || '0.00'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center space-x-2 text-gray-500 text-sm mb-2">
            <Calendar className="w-4 h-4" />
            <span>可用资金</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ¥{performance?.balance?.toLocaleString() || '0.00'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center space-x-2 text-gray-500 text-sm mb-2">
            {performance?.totalProfit >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span>累计收益</span>
          </div>
          <div className={cn(
            'text-2xl font-bold',
            performance?.totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
          )}>
            {performance?.totalProfit >= 0 ? '+' : ''}¥{performance?.totalProfit?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            <div className="text-sm font-normal">
              ({performance?.totalProfitPercent >= 0 ? '+' : ''}{performance?.totalProfitPercent ? parseFloat(performance.totalProfitPercent).toFixed(2) : '0.00'}%)
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('chart')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  activeTab === 'chart'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                收益曲线
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  activeTab === 'transactions'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                交易记录
              </button>
            </div>

            {activeTab === 'chart' && (
              <div className="flex space-x-2">
                {[7, 30, 90, 180].map((days) => (
                  <button
                    key={days}
                    onClick={() => setTimeRange(days)}
                    className={cn(
                      'px-3 py-1 text-sm rounded-lg transition-colors',
                      timeRange === days
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'text-gray-500 hover:bg-gray-100'
                    )}
                  >
                    {days}天
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'chart' ? (
            <div>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      tickLine={false}
                      axisLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(value) => (value / 10000).toFixed(0) + '万'}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: number) => [`¥${value.toLocaleString()}`, '总资产']}
                      labelFormatter={(label) => `日期: ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalValue"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                <div>
                  <div className="text-sm text-gray-500">初始资金</div>
                  <div className="text-lg font-semibold text-gray-900">¥{initialInvestment.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">最高资产</div>
                  <div className="text-lg font-semibold text-emerald-600">
                    ¥{Math.max(...chartData.map((d: any) => d.totalValue), initialInvestment).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">最低资产</div>
                  <div className="text-lg font-semibold text-red-600">
                    ¥{Math.min(...chartData.map((d: any) => d.totalValue), initialInvestment).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">收益率</div>
                  <div className={cn(
                    'text-lg font-semibold',
                    performance?.totalProfitPercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                  )}>
                    {performance?.totalProfitPercent >= 0 ? '+' : ''}{performance?.totalProfitPercent ? parseFloat(performance.totalProfitPercent).toFixed(2) : '0.00'}%
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">暂无交易记录</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        'p-2 rounded-lg',
                        tx.type === 'buy' ? 'bg-emerald-100' : 'bg-red-100'
                      )}>
                        {tx.type === 'buy' ? (
                          <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {tx.symbol} <span className="text-gray-500 font-normal">{tx.name}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {tx.type === 'buy' ? '买入' : '卖出'} {tx.shares.toLocaleString()} 股 × ¥{parseFloat(tx.price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        'font-medium',
                        tx.type === 'buy' ? 'text-emerald-600' : 'text-red-600'
                      )}>
                        {tx.type === 'buy' ? '-' : '+'}¥{tx.total.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(tx.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Performance;
