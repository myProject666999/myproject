import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';
import { groupApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Users, Search, Plus, Lock, ArrowRight, Loader2 } from 'lucide-react';

const categories = ['全部', '学习', '编程', '考研', '语言', '考试', '其他'];

export default function GroupListPage() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery(
    ['groups', activeCategory, keyword, page],
    () =>
      groupApi
        .getGroups({
          category: activeCategory === '全部' ? undefined : activeCategory,
          keyword: keyword || undefined,
          page,
          limit: 12,
        })
        .then((res) => res.data)
  );

  const joinMutation = useMutation((groupId: number) => groupApi.joinGroup(groupId), {
    onSuccess: () => {
      queryClient.invalidateQueries('userGroups');
    },
  });

  const handleJoin = (groupId: number) => {
    joinMutation.mutate(groupId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">学习小组</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>创建小组</span>
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
              placeholder="搜索小组..."
              className="input-field pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data?.map((group: any) => (
            <div key={group.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-3">
                {group.avatar ? (
                  <img
                    src={group.avatar}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-primary-500" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-gray-800 truncate">{group.name}</h3>
                    {group.isPrivate && (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{group.category}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                {group.description || '暂无描述'}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    <Users className="w-4 h-4 inline mr-1" />
                    {group.memberCount}/{group.maxMembers}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/groups/${group.id}`)}
                  className="text-primary-500 hover:text-primary-600 text-sm flex items-center"
                >
                  查看
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && data?.data?.length === 0 && (
        <div className="card text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>没有找到相关小组</p>
        </div>
      )}

      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries('groups');
          }}
        />
      )}
    </div>
  );
}

function CreateGroupModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('学习');
  const [maxMembers, setMaxMembers] = useState(30);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    () => groupApi.createGroup({ name, description, category, maxMembers }),
    {
      onSuccess: (res) => {
        queryClient.invalidateQueries('groups');
        onSuccess();
      },
      onError: (err: any) => {
        setError(err.response?.data?.message || '创建失败');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name) {
      setError('请输入小组名称');
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">创建小组</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">小组名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="请输入小组名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">小组描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="请输入小组描述"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                {categories.filter((c) => c !== '全部').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最大人数</label>
              <input
                type="number"
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                className="input-field"
                min={5}
                max={200}
              />
            </div>
          </div>
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg">{error}</div>
          )}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="flex-1 btn-primary flex items-center justify-center"
            >
              {createMutation.isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                '创建'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
