import { useState } from 'react';
import { Shield, Check, X, Eye, Clock, AlertCircle, User } from 'lucide-react';

interface ReviewItem {
  id: number;
  title: string;
  image: string;
  author: string;
  submitTime: string;
  status: 'pending' | 'approved' | 'rejected';
}

const mockReviews: ReviewItem[] = [
  { id: 1, title: '搞笑梗图1', image: 'https://picsum.photos/200/200?random=30', author: '用户A', submitTime: '2024-01-15 10:30', status: 'pending' },
  { id: 2, title: '猫咪表情包', image: 'https://picsum.photos/200/200?random=31', author: '用户B', submitTime: '2024-01-15 09:20', status: 'pending' },
  { id: 3, title: '职场日常', image: 'https://picsum.photos/200/200?random=32', author: '用户C', submitTime: '2024-01-15 08:15', status: 'approved' },
  { id: 4, title: '游戏梗图', image: 'https://picsum.photos/200/200?random=33', author: '用户D', submitTime: '2024-01-14 22:45', status: 'rejected' },
  { id: 5, title: '动漫搞笑图', image: 'https://picsum.photos/200/200?random=34', author: '用户E', submitTime: '2024-01-14 20:30', status: 'pending' },
];

const Review = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [reviews, setReviews] = useState(mockReviews);

  const filteredReviews = reviews.filter((r) => r.status === activeTab);

  const handleApprove = (id: number) => {
    setReviews(reviews.map((r) => (r.id === id ? { ...r, status: 'approved' as const } : r)));
  };

  const handleReject = (id: number) => {
    setReviews(reviews.map((r) => (r.id === id ? { ...r, status: 'rejected' as const } : r)));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">待审核</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">已通过</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400">已拒绝</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-glow">审核后台</h1>
              <p className="text-gray-400">管理用户提交的梗图内容</p>
            </div>
          </div>
        </div>

        <div className="cyber-card rounded-2xl p-2 mb-8 inline-flex gap-2">
          <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} icon={<Clock size={16} />} label="待审核" count={reviews.filter((r) => r.status === 'pending').length} />
          <TabButton active={activeTab === 'approved'} onClick={() => setActiveTab('approved')} icon={<Check size={16} />} label="已通过" count={reviews.filter((r) => r.status === 'approved').length} />
          <TabButton active={activeTab === 'rejected'} onClick={() => setActiveTab('rejected')} icon={<X size={16} />} label="已拒绝" count={reviews.filter((r) => r.status === 'rejected').length} />
        </div>

        <div className="cyber-card rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-primary/20">
                <th className="text-left p-4 text-gray-400 font-medium">预览</th>
                <th className="text-left p-4 text-gray-400 font-medium">标题</th>
                <th className="text-left p-4 text-gray-400 font-medium">提交者</th>
                <th className="text-left p-4 text-gray-400 font-medium">提交时间</th>
                <th className="text-left p-4 text-gray-400 font-medium">状态</th>
                <th className="text-left p-4 text-gray-400 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr key={review.id} className="border-b border-primary/10 hover:bg-primary/5 transition-colors">
                  <td className="p-4">
                    <img
                      src={review.image}
                      alt={review.title}
                      className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedImage(review.image)}
                    />
                  </td>
                  <td className="p-4">
                    <span className="font-medium">{review.title}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <User size={12} className="text-white" />
                      </div>
                      <span className="text-gray-300">{review.author}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">{review.submitTime}</td>
                  <td className="p-4">{getStatusBadge(review.status)}</td>
                  <td className="p-4">
                    {review.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(review.id)}
                          className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                          title="通过"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(review.id)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          title="拒绝"
                        >
                          <X size={16} />
                        </button>
                        <button
                          onClick={() => setSelectedImage(review.image)}
                          className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                          title="查看大图"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    )}
                    {review.status !== 'pending' && (
                      <button
                        onClick={() => setSelectedImage(review.image)}
                        className="p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                        title="查看大图"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredReviews.length === 0 && (
            <div className="text-center py-20">
              <AlertCircle className="mx-auto text-gray-500 mb-4" size={48} />
              <p className="text-gray-400">暂无{activeTab === 'pending' ? '待审核' : activeTab === 'approved' ? '已通过' : '已拒绝'}的内容</p>
            </div>
          )}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[80vh]">
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[80vh] rounded-xl"
            />
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}

const TabButton = ({ active, onClick, icon, label, count }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      active
        ? 'bg-primary text-white neon-glow'
        : 'text-gray-400 hover:text-white hover:bg-primary/10'
    }`}
  >
    {icon}
    {label}
    <span className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-white/20' : 'bg-gray-700'}`}>
      {count}
    </span>
  </button>
);

export default Review;
