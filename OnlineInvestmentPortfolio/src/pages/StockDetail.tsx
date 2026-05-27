import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Plus,
  ShoppingCart,
  Loader2,
  Star,
  Bell
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { stockAPI, watchlistAPI, portfolioAPI } from '../services/api';
import { cn } from '../lib/utils';

interface StockInfo {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  market_cap: number;
  pe_ratio: number;
}

interface HistoryItem {
  date: string;
  close: number;
  volume: number;
}

const StockDetail: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [stock, setStock] = useState<StockInfo | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = useState(100);
  const [trading, setTrading] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertType, setAlertType] = useState('price_above');
  const [alertThreshold, setAlertThreshold] = useState('');

  useEffect(() => {
    if (symbol) {
      loadStockData();
      loadHistory();
      checkWatchlist();
    }
  }, [symbol, timeRange]);

  const loadStockData = async () => {
    try {
      const response = await stockAPI.getStock(symbol!);
      setStock(response.data);
    } catch (error) {
      console.error('加载股票信息失败:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await stockAPI.getHistory(symbol!, timeRange);
      setHistory(response.data);
    } catch (error) {
      console.error('加载历史数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWatchlist = async () => {
    try {
      const response = await watchlistAPI.getAll();
      const exists = response.data.some((item: any) => item.symbol === symbol);
      setInWatchlist(exists);
    } catch (error) {
      console.error('检查自选股失败:', error);
    }
  };

  const toggleWatchlist = async () => {
    try {
      if (inWatchlist) {
        await watchlistAPI.remove(symbol!);
        setInWatchlist(false);
      } else {
        await watchlistAPI.add(symbol!);
        setInWatchlist(true);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '操作失败');
    }
  };

  const handleTrade = async () => {
    if (!stock) return;
    if (shares <= 0) {
      alert('请输入有效的交易数量');
      return;
    }

    setTrading(true);
    try {
      if (tradeType === 'buy') {
        await portfolioAPI.buy({ symbol: symbol!, shares, price: stock.price });
        alert('买入成功！');
      } else {
        await portfolioAPI.sell({ symbol: symbol!, shares, price: stock.price });
        alert('卖出成功！');
      }
      setShowTradeModal(false);
    } catch (error: any) {
      alert(error.response?.data?.message || '交易失败');
    } finally {
      setTrading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000000) {
      return (num / 1000000000000).toFixed(2) + '万亿';
    }
    if (num >= 100000000) {
      return (num / 100000000).toFixed(2) + '亿';
    }
    if (num >= 10000) {
      return (num / 10000).toFixed(2) + '万';
    }
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">未找到该股票</p>
        <button
          onClick={() => navigate('/watchlist')}
          className="mt-4 text-emerald-600 hover:underline"
        >
          返回自选股
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/watchlist')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{stock.symbol}</h1>
              <span className="text-gray-500">{stock.name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleWatchlist}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors',
              inWatchlist
                ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <Star className={cn('w-5 h-5', inWatchlist && 'fill-yellow-500')} />
            <span>{inWatchlist ? '已添加自选' : '加自选'}</span>
          </button>
          <button
            onClick={() => setShowAlertModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span>设置提醒</span>
          </button>
          <button
            onClick={() => setShowTradeModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>交易</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-4xl font-bold text-gray-900">¥{parseFloat(stock.price).toFixed(2)}</div>
            <div
              className={cn(
                'flex items-center space-x-2 mt-2 text-lg font-medium',
                parseFloat(stock.change_percent) >= 0 ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {parseFloat(stock.change_percent) >= 0 ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
              <span>
                {parseFloat(stock.change_percent) >= 0 ? '+' : ''}
                {parseFloat(stock.change_percent).toFixed(2)}%
              </span>
              <span className="text-gray-400 font-normal">
                ({parseFloat(stock.change) >= 0 ? '+' : ''}
                {parseFloat(stock.change).toFixed(2)})
              </span>
            </div>
          </div>
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
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
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
                tickFormatter={(value) => value.toFixed(0)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [`¥${value.toFixed(2)}`, '收盘价']}
                labelFormatter={(label) => `日期: ${label}`}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center space-x-2 text-gray-500 text-sm mb-2">
            <DollarSign className="w-4 h-4" />
            <span>成交量</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{formatNumber(stock.volume)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center space-x-2 text-gray-500 text-sm mb-2">
            <BarChart3 className="w-4 h-4" />
            <span>市值</span>
          </div>
          <div className="text-xl font-bold text-gray-900">¥{formatNumber(stock.market_cap)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center space-x-2 text-gray-500 text-sm mb-2">
            <PieChart className="w-4 h-4" />
            <span>市盈率</span>
          </div>
          <div className="text-xl font-bold text-gray-900">{stock.pe_ratio ? parseFloat(stock.pe_ratio).toFixed(2) : '--'}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center space-x-2 text-gray-500 text-sm mb-2">
            <TrendingUp className="w-4 h-4" />
            <span>52周最高</span>
          </div>
          <div className="text-xl font-bold text-emerald-600">¥{(parseFloat(stock.price) * 1.3).toFixed(2)}</div>
        </div>
      </div>

      {showTradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {tradeType === 'buy' ? '买入' : '卖出'} {stock.symbol}
            </h3>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setTradeType('buy')}
                  className={cn(
                    'flex-1 py-2 rounded-lg font-medium transition-colors',
                    tradeType === 'buy'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  买入
                </button>
                <button
                  onClick={() => setTradeType('sell')}
                  className={cn(
                    'flex-1 py-2 rounded-lg font-medium transition-colors',
                    tradeType === 'sell'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  卖出
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  当前价格
                </label>
                <div className="text-2xl font-bold text-gray-900">¥{parseFloat(stock.price).toFixed(2)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  交易数量（股）
                </label>
                <input
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  预计金额
                </label>
                <div className="text-xl font-bold text-gray-900">
                  ¥{(shares * parseFloat(stock.price)).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowTradeModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleTrade}
                disabled={trading}
                className={cn(
                  'flex-1 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2',
                  tradeType === 'buy'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                )}
              >
                {trading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>交易中...</span>
                  </>
                ) : (
                  <span>确认{tradeType === 'buy' ? '买入' : '卖出'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAlertModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">设置价格提醒</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  提醒类型
                </label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="price_above">价格上涨到</option>
                  <option value="price_below">价格下跌到</option>
                  <option value="change_percent">涨跌幅达到</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {alertType === 'change_percent' ? '涨跌幅阈值（%）' : '目标价格（元）'}
                </label>
                <input
                  type="number"
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  placeholder={alertType === 'change_percent' ? '例如：5' : '例如：200'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  step={alertType === 'change_percent' ? '0.01' : '0.01'}
                />
              </div>
              {stock && (
                <div className="text-sm text-gray-500">
                  当前价格：¥{parseFloat(stock.price).toFixed(2)}，{parseFloat(stock.change_percent) >= 0 ? '+' : ''}{parseFloat(stock.change_percent).toFixed(2)}%
                </div>
              )}
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAlertModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!alertThreshold) {
                    alert('请输入阈值');
                    return;
                  }
                  setShowAlertModal(false);
                  alert('提醒设置成功！');
                }}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                设置提醒
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDetail;
