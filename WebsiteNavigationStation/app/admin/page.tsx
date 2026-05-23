'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import type { Category, WebsiteWithCategory } from '@/lib/types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'websites' | 'categories'>('websites');
  const [categories, setCategories] = useState<Category[]>([]);
  const [websites, setWebsites] = useState<WebsiteWithCategory[]>([]);
  const [editingWebsite, setEditingWebsite] = useState<WebsiteWithCategory | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showWebsiteForm, setShowWebsiteForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPrivate, setFilterPrivate] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      const [catsRes, websRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/websites'),
      ]);
      const [cats, webs] = await Promise.all([catsRes.json(), websRes.json()]);
      setCategories(cats);
      setWebsites(webs);
    } catch (error) {
      console.error('获取数据失败:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredWebsites = websites.filter((w) => {
    const matchesSearch = searchQuery
      ? w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.url.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesCategory = filterCategory ? w.category_id === parseInt(filterCategory) : true;
    const matchesPrivate = filterPrivate
      ? w.is_private === (filterPrivate === 'true' ? 1 : 0)
      : true;
    return matchesSearch && matchesCategory && matchesPrivate;
  });

  const handleDeleteWebsite = async (id: number) => {
    if (!confirm('确定要删除这个网站吗？')) return;
    try {
      await fetch(`/api/websites/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('确定要删除这个分类吗？该分类下的所有网站也会被删除！')) return;
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      alert('删除失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                ← 返回首页
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">🛠️ 管理后台</h1>
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <button
              onClick={() => setActiveTab('websites')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'websites'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              网站管理
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'categories'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              分类管理
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'websites' ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                网站列表 ({filteredWebsites.length})
              </h2>
              <button
                onClick={() => {
                  setEditingWebsite(null);
                  setShowWebsiteForm(true);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                + 添加网站
              </button>
            </div>

            <div className="bg-white rounded-xl p-4 mb-6 flex flex-wrap gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索网站..."
                className="flex-1 min-w-[200px] px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">全部分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              <select
                value={filterPrivate}
                onChange={(e) => setFilterPrivate(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">全部类型</option>
                <option value="false">公开</option>
                <option value="true">私人</option>
              </select>
            </div>

            <div className="bg-white rounded-xl overflow-hidden border">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">网站</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">分类</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">类型</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">浏览量</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWebsites.map((website) => (
                    <tr key={website.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                            {website.favicon_url ? (
                              <img
                                src={website.favicon_url}
                                alt={website.name}
                                className="w-5 h-5"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${new URL(website.url).hostname}&sz=64`;
                                }}
                              />
                            ) : (
                              <span>🌐</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{website.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-[200px]">
                              {website.url}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {website.category_icon} {website.category_name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {website.is_private === 1 && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">
                              私人
                            </span>
                          )}
                          {website.is_featured === 1 && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                              热门
                            </span>
                          )}
                          {website.is_private === 0 && website.is_featured === 0 && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                              公开
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{website.view_count}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setEditingWebsite(website);
                            setShowWebsiteForm(true);
                          }}
                          className="px-3 py-1 text-sm text-primary-600 hover:text-primary-700"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteWebsite(website.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredWebsites.length === 0 && (
                <div className="text-center py-12 text-gray-500">暂无网站</div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                分类列表 ({categories.length})
              </h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setShowCategoryForm(true);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                + 添加分类
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const websiteCount = websites.filter((w) => w.category_id === category.id).length;
                return (
                  <div
                    key={category.id}
                    className="bg-white rounded-xl p-4 border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{category.icon}</span>
                        <div>
                          <h3 className="font-medium text-gray-800">{category.name}</h3>
                          <p className="text-sm text-gray-500">{websiteCount} 个网站</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setShowCategoryForm(true);
                          }}
                          className="px-2 py-1 text-sm text-primary-600 hover:text-primary-700"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="px-2 py-1 text-sm text-red-600 hover:text-red-700"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {showWebsiteForm && (
        <WebsiteFormModal
          website={editingWebsite}
          categories={categories}
          onClose={() => setShowWebsiteForm(false)}
          onSuccess={() => {
            setShowWebsiteForm(false);
            fetchData();
          }}
        />
      )}

      {showCategoryForm && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => setShowCategoryForm(false)}
          onSuccess={() => {
            setShowCategoryForm(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function WebsiteFormModal({
  website,
  categories,
  onClose,
  onSuccess,
}: {
  website: WebsiteWithCategory | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: website?.name || '',
    url: website?.url || '',
    description: website?.description || '',
    category_id: website?.category_id || (categories[0]?.id || ''),
    is_private: website?.is_private || 0,
    is_featured: website?.is_featured || 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = website ? `/api/websites/${website.id}` : '/api/websites';
      const method = website ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        alert(data.error || '保存失败');
      }
    } catch (error) {
      alert('保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">
            {website ? '编辑网站' : '添加网站'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              网站名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              网站URL *
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              分类 *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_private === 1}
                onChange={(e) => setFormData({ ...formData, is_private: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">设为私人</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured === 1}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">设为热门</span>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryFormModal({
  category,
  onClose,
  onSuccess,
}: {
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    icon: category?.icon || '📁',
    sort_order: category?.sort_order || 0,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = category ? `/api/categories/${category.id}` : '/api/categories';
      const method = category ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        alert(data.error || '保存失败');
      }
    } catch (error) {
      alert('保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  const icons = ['📁', '🛠️', '💻', '🎨', '🎮', '📚', '🏠', '🌐', '📧', '🎵', '🎬', '📱', '💼', '🔧', '⚙️'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-800">
            {category ? '编辑分类' : '添加分类'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              分类名称 *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">图标</label>
            <div className="flex flex-wrap gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon })}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center ${
                    formData.icon === icon
                      ? 'bg-primary-100 border-2 border-primary-500'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
