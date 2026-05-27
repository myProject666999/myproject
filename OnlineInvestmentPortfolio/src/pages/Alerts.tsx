import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Loader2,
  Search
} from 'lucide-react';
import { alertAPI, stockAPI } from '../services/api';
import { cn } from '../lib/utils';

interface Alert {
  id: number;
  symbol: string;
  name: string;
  type: 'price_above' | 'price_below' | 'change_percent';
  threshold: number;
  enabled: boolean;
  triggered: boolean;
  price: number;
  created_at: string;
}

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [alertType, setAlertType] = useState<'price_above' | 'price_below' | 'change_percent'>('price_above');
  const [threshold, setThreshold] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const loadAlerts = async () => {
    try {
      const response = await alertAPI.getAll();
      setAlerts(response.data);
    } catch (error) {
      console.error('加载提醒失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
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

  const handleSelectStock = (stock: any) => {
    setSelectedStock(stock);
    setSymbol(stock.symbol);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleCreateAlert = async () => {
    if (!symbol || !threshold) {
      alert('请填写完整信息');
      return;
    }

    setCreating(true);
    try {
      await alertAPI.create({
        symbol,
        type: alertType,
        threshold: parseFloat(threshold)
      });
      alert('提醒创建成功！');
      setShowCreateModal(false);
      setSymbol('');
      setThreshold('');
      setSelectedStock(null);
      loadAlerts();
    } catch (error: any) {
      alert(error.response?.data?.message || '创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleAlert = async (alert: Alert) => {
    try {
      await alertAPI.update(alert.id, { enabled: !alert.enabled });
      loadAlerts();
    } catch (error) {
      console.error('切换提醒状态失败:', error);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    if (confirm('确定要删除这条提醒吗？')) {
      try {
        await alertAPI.delete(id);
        loadAlerts();
      } catch (error) {
        console.error('删除提醒失败:', error);
      }
    }
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'price_above':
        return '价格上涨到';
      case 'price_below':
        return '价格下跌到';
      case 'change_percent':
        return '涨跌幅达到';
      default:
        return type;
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'price_above':
        return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'price_below':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'change_percent':
        return <DollarSign className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
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
          <h1 className="text-2xl font-bold text-gray-900">提醒设置</h1>
          <p className="text-gray-500 mt-1">设置股票价格和涨跌幅提醒</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>新建提醒</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">我的提醒</h2>
            <span className="text-sm text-gray-500">共 {alerts.length} 条提醒</span>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无提醒</h3>
            <p className="text-gray-500 mb-4">创建提醒，及时掌握股票价格变动</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>新建提醒</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'p-6 flex items-center justify-between hover:bg-gray-50 transition-colors',
                  !alert.enabled && 'opacity-60'
                )}
              >
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    'p-3 rounded-lg',
                    alert.triggered ? 'bg-yellow-100' : 'bg-gray-100'
                  )}>
                    {getAlertTypeIcon(alert.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{alert.symbol}</span>
                      <span className="text-gray-500">{alert.name}</span>
                      {alert.triggered && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
                          已触发
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {getAlertTypeLabel(alert.type)}
                      <span className="font-medium text-gray-900 mx-1">
                        {alert.type === 'change_percent' ? `${parseFloat(alert.threshold)}%` : `¥${parseFloat(alert.threshold).toFixed(2)}`}
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="ml-1">当前价格：¥{alert.price ? parseFloat(alert.price).toFixed(2) : '--'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleToggleAlert(alert)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {alert.enabled ? (
                      <ToggleRight className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ToggleLeft className="w-6 h-6" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">新建价格提醒</h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择股票
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={selectedStock ? `${selectedStock.symbol} - ${selectedStock.name}` : searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedStock(null);
                      setSymbol('');
                    }}
                    placeholder="搜索股票代码或名称..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map((stock) => (
                      <div
                        key={stock.symbol}
                        onClick={() => handleSelectStock(stock)}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{stock.symbol}</div>
                          <div className="text-sm text-gray-500">{stock.name}</div>
                        </div>
                        <span className="text-gray-900">¥{parseFloat(stock.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  提醒类型
                </label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value as any)}
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
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  placeholder={alertType === 'change_percent' ? '例如：5' : '例如：200'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  step={alertType === 'change_percent' ? '0.01' : '0.01'}
                />
              </div>

              {selectedStock && (
                <div className="text-sm text-gray-500">
                  当前价格：¥{parseFloat(selectedStock.price).toFixed(2)}
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedStock(null);
                  setSymbol('');
                  setThreshold('');
                  setSearchQuery('');
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateAlert}
                disabled={creating || !symbol || !threshold}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>创建中...</span>
                  </>
                ) : (
                  <span>创建提醒</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alerts;
