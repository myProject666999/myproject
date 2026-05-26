import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { portfolioAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { cn } from '../lib/utils';

interface Position {
  id: number;
  symbol: string;
  name: string;
  shares: number;
  avg_cost: number;
  price: number;
  marketValue: number;
  profit: number;
  profitPercent: number;
}

interface PortfolioData {
  balance: number;
  totalMarketValue: number;
  totalAssets: number;
  positions: Position[];
}

const Portfolio: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Position | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = useState(100);
  const [trading, setTrading] = useState(false);
  const navigate = useNavigate();
  const { updateBalance } = useAuthStore();

  const loadPortfolio = async () => {
    try {
      const response = await portfolioAPI.getPortfolio();
      setPortfolio(response.data);
      updateBalance(response.data.balance);
    } catch (error) {
      console.error('加载持仓失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const handleTrade = async () => {
    if (!selectedStock) return;
    if (shares <= 0) {
      alert('请输入有效的交易数量');
      return;
    }

    setTrading(true);
    try {
      if (tradeType === 'buy') {
        await portfolioAPI.buy({
          symbol: selectedStock.symbol,
          shares,
          price: selectedStock.price
        });
        alert('买入成功！');
      } else {
        if (shares > selectedStock.shares) {
          alert('持仓不足');
          setTrading(false);
          return;
        }
        await portfolioAPI.sell({
          symbol: selectedStock.symbol,
          shares,
          price: selectedStock.price
        });
        alert('卖出成功！');
      }
      setShowTradeModal(false);
      loadPortfolio();
    } catch (error: any) {
      alert(error.response?.data?.message || '交易失败');
    } finally {
      setTrading(false);
    }
  };

  const openTradeModal = (position: Position, type: 'buy' | 'sell') => {
    setSelectedStock(position);
    setTradeType(type);
    setShares(type === 'sell' ? Math.min(100, position.shares) : 100);
    setShowTradeModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const totalProfit = portfolio?.positions.reduce((sum, pos) => sum + pos.profit, 0) || 0;
  const totalCost = portfolio?.positions.reduce((sum, pos) => sum + pos.shares * pos.avg_cost, 0) || 0;
  const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">持仓管理</h1>
        <p className="text-gray-500 mt-1">管理您的模拟持仓和交易</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-gray-500">总资产</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ¥{portfolio?.totalAssets?.toLocaleString() || '0.00'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-500">可用资金</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ¥{portfolio?.balance?.toLocaleString() || '0.00'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className={cn(
              'p-2 rounded-lg',
              totalProfit >= 0 ? 'bg-emerald-100' : 'bg-red-100'
            )}>
              {totalProfit >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
            <span className="text-gray-500">持仓盈亏</span>
          </div>
          <div className={cn(
            'text-3xl font-bold',
            totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
          )}>
            {totalProfit >= 0 ? '+' : ''}¥{totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-lg font-normal ml-2">
              ({totalProfitPercent >= 0 ? '+' : ''}{totalProfitPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">持仓列表</h2>
            <span className="text-sm text-gray-500">共 {portfolio?.positions?.length || 0} 支股票</span>
          </div>
        </div>

        {portfolio?.positions?.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无持仓</h3>
            <p className="text-gray-500">去自选股页面选择股票开始交易吧</p>
            <button
              onClick={() => navigate('/watchlist')}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              去自选股
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    股票
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    持仓数量
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    成本价
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    现价
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    市值
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    盈亏
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {portfolio?.positions?.map((position) => (
                  <tr
                    key={position.id}
                    onClick={() => navigate(`/stock/${position.symbol}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{position.symbol}</div>
                        <div className="text-sm text-gray-500">{position.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {position.shares.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      ¥{position.avg_cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      ¥{position.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      ¥{position.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={cn(
                        'font-medium flex items-center justify-end space-x-1',
                        position.profit >= 0 ? 'text-emerald-600' : 'text-red-600'
                      )}>
                        {position.profit >= 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        <span>
                          {position.profit >= 0 ? '+' : ''}¥{position.profit.toFixed(2)}
                        </span>
                      </div>
                      <div className={cn(
                        'text-sm',
                        position.profitPercent >= 0 ? 'text-emerald-500' : 'text-red-500'
                      )}>
                        {position.profitPercent >= 0 ? '+' : ''}{position.profitPercent.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => openTradeModal(position, 'buy')}
                          className="px-3 py-1 text-sm bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          买入
                        </button>
                        <button
                          onClick={() => openTradeModal(position, 'sell')}
                          className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          卖出
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showTradeModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              {tradeType === 'buy' ? '买入' : '卖出'} {selectedStock.symbol}
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
                  onClick={() => {
                    setTradeType('sell');
                    setShares(Math.min(shares, selectedStock.shares));
                  }}
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
                <div className="text-2xl font-bold text-gray-900">¥{selectedStock.price.toFixed(2)}</div>
              </div>
              {tradeType === 'sell' && (
                <div className="text-sm text-gray-500">
                  可卖数量：{selectedStock.shares.toLocaleString()} 股
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  交易数量（股）
                </label>
                <input
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(Math.min(parseInt(e.target.value) || 0, tradeType === 'sell' ? selectedStock.shares : 999999))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  min="1"
                  max={tradeType === 'sell' ? selectedStock.shares : undefined}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  预计金额
                </label>
                <div className="text-xl font-bold text-gray-900">
                  ¥{(shares * selectedStock.price).toLocaleString()}
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
    </div>
  );
};

export default Portfolio;
