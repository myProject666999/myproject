import React, { useState, useEffect } from 'react';
import { blacklistService } from '../services/api';
import { Blacklist } from '../types';

const emptyBlacklist: Blacklist = {
  name: '',
  id_card: '',
  phone: '',
  reason: ''
};

const BlacklistPage: React.FC = () => {
  const [blacklists, setBlacklists] = useState<Blacklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlacklist, setEditingBlacklist] = useState<Blacklist | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [formData, setFormData] = useState<Blacklist>(emptyBlacklist);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBlacklists = async (keyword?: string) => {
    try {
      setLoading(true);
      const response = keyword 
        ? await blacklistService.search(keyword)
        : await blacklistService.getAll();
      setBlacklists(response.data);
    } catch (error) {
      console.error('获取黑名单列表失败:', error);
      showMessage('error', '获取黑名单列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlacklists();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSearch = () => {
    fetchBlacklists(searchKeyword);
  };

  const handleResetSearch = () => {
    setSearchKeyword('');
    fetchBlacklists();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBlacklist && editingBlacklist.id) {
        await blacklistService.update(editingBlacklist.id, formData);
        showMessage('success', '黑名单信息更新成功');
      } else {
        await blacklistService.create(formData);
        showMessage('success', '黑名单信息添加成功');
      }
      setShowForm(false);
      setEditingBlacklist(null);
      setFormData(emptyBlacklist);
      fetchBlacklists(searchKeyword);
    } catch (error) {
      console.error('保存黑名单信息失败:', error);
      showMessage('error', '保存黑名单信息失败');
    }
  };

  const handleEdit = (blacklist: Blacklist) => {
    setEditingBlacklist(blacklist);
    setFormData(blacklist);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('确定要删除该黑名单信息吗？')) {
      try {
        await blacklistService.delete(id);
        showMessage('success', '黑名单信息删除成功');
        fetchBlacklists(searchKeyword);
      } catch (error) {
        console.error('删除黑名单信息失败:', error);
        showMessage('error', '删除黑名单信息失败');
      }
    }
  };

  const handleAdd = () => {
    setEditingBlacklist(null);
    setFormData(emptyBlacklist);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBlacklist(null);
    setFormData(emptyBlacklist);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">黑名单管理</h2>
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium shadow-md"
          >
            + 添加黑名单
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[300px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                搜索黑名单
              </label>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="输入姓名、身份证号、电话、原因进行模糊查询..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              🔍 查询
            </button>
            <button
              onClick={handleResetSearch}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
            >
              🔄 重置
            </button>
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingBlacklist ? '编辑黑名单信息' : '添加黑名单信息'}
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      姓名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="请输入姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      身份证号 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="id_card"
                      value={formData.id_card}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="请输入身份证号"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      联系电话
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="请输入联系电话"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    原因 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={3}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="请输入列入黑名单的原因"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                  >
                    {editingBlacklist ? '更新' : '添加'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    身份证号
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    联系电话
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    原因
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    添加时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-2"></div>
                      加载中...
                    </td>
                  </tr>
                ) : blacklists.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      暂无黑名单数据
                    </td>
                  </tr>
                ) : (
                  blacklists.map(blacklist => (
                    <tr key={blacklist.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{blacklist.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {blacklist.id_card}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {blacklist.phone || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="truncate" title={blacklist.reason}>
                          {blacklist.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {blacklist.create_time ? new Date(blacklist.create_time).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(blacklist)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          ✏️ 编辑
                        </button>
                        <button
                          onClick={() => blacklist.id && handleDelete(blacklist.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          🗑️ 删除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          共 {blacklists.length} 条记录
        </div>
      </div>
    </div>
  );
};

export default BlacklistPage;
