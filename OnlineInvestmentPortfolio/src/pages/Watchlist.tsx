import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, TrendingUp, TrendingDown, RefreshCw, Loader2, Star } from 'lucide-react';
import { watchlistAPI, stockAPI } from '../services/api';
import { cn } from '../lib/utils';

interface StockItem {
  id: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  added_at: string;
}

const Watchlist: React.FC = () => {
  const [watchlist, setWatchlist] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const loadWatchlist = async () => {
    try {
      const response = await watchlistAPI.getAll();
      setWatchlist(response.data);
    } catch (error) {
      console.error('加载自选股失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim()) {
        try {
          const response = await stockAPI.search(searchQuery);
          setSearchResults(response.data);
        } catch (error) {
          console.error('搜索失败:', error);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddStock = async (symbol: string) => {
    try {
      await watchlistAPI.add(symbol);
      setSearchQuery('');
      setSearchResults([]);
      setShowSearch(false);
      loadWatchlist();
    } catch (error: any) {
      alert(error.response?.data?.message || '添加失败');
    }
  };

  const handleRemoveStock = async (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要移除这支股票吗？')) {
      try {
        await watchlistAPI.remove(symbol);
        loadWatchlist();
      } catch (error) {
        console.error('移除失败:', error);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWatchlist();
    setRefreshing(false);
  };

  const formatNumber = (num: number) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">自选股</h1>
          <p className="text-gray-500 mt-1">共 {watchlist.length} 支股票</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={cn('w-5 h-5', refreshing && 'animate-spin')} />
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>添加自选</span>
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索股票代码或名称..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              autoFocus
            />
          </div>
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                >
                  <div>
                    <div className="font-medium text-gray-900">{stock.symbol}</div>
                    <div className="text-sm text-gray-500">{stock.name}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-900 font-medium">¥{stock.price.toFixed(2)}</span>
                    <button
                      onClick={() => handleAddStock(stock.symbol)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {watchlist.map((stock) => (
          <div
            key={stock.id}
            onClick={() => navigate(`/stock/${stock.symbol}`)}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-gray-900">{stock.symbol}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">{stock.name}</div>
              </div>
              <button
                onClick={(e) => handleRemoveStock(stock.symbol, e)}
                className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  ¥{stock.price?.toFixed(2) || '--'}
                </div>
                <div
                  className={cn(
                    'flex items-center space-x-1 mt-1 text-sm font-medium',
                    stock.change_percent >= 0 ? 'text-emerald-600' : 'text-red-600'
                  )}
                >
                  {stock.change_percent >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span>
                    {stock.change_percent >= 0 ? '+' : ''}
                    {stock.change_percent?.toFixed(2) || '0.00'}%
                  </span>
                  <span className="text-gray-400 font-normal ml-1">
                    ({stock.change >= 0 ? '+' : ''}
                    {stock.change?.toFixed(2) || '0.00'})
                  </span>
                </div>
              </div>
              <div className="text-right text-xs text-gray-500">
                <div>成交量</div>
                <div className="text-gray-700">{formatNumber(stock.volume || 0)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {watchlist.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无自选股</h3>
          <p className="text-gray-500 mb-4">点击上方按钮添加您关注的股票</p>
          <button
            onClick={() => setShowSearch(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>添加自选股</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
