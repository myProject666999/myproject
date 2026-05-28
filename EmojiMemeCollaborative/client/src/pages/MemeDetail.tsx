import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Share2, Download, ArrowLeft, User, MessageCircle, Flag } from 'lucide-react';

const mockMeme = {
  id: 1,
  title: '这是一个超搞笑的梗图',
  image: 'https://picsum.photos/600/600?random=10',
  author: '小明',
  authorAvatar: '',
  likeCount: 1234,
  viewCount: 5678,
  createdAt: '2024-01-15',
  description: '这是一个非常有趣的梗图，分享给大家一起乐一乐！',
  tags: ['搞笑', '日常'],
};

const mockComments = [
  { id: 1, author: '路人甲', content: '哈哈哈哈太好笑了！', createdAt: '2小时前', likes: 23 },
  { id: 2, author: '吃瓜群众', content: '已收藏了', createdAt: '5小时前', likes: 15 },
  { id: 3, author: '梗图大师', content: '求教程！', createdAt: '1天前', likes: 8 },
];

const MemeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(mockMeme.likeCount);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(mockComments);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  const handleComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: comments.length + 1,
        author: '我',
        content: commentText,
        createdAt: '刚刚',
        likes: 0,
      };
      setComments([newComment, ...comments]);
      setCommentText('');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mockMeme.image;
    link.download = `meme-${id}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen pt-20 pb-10">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          返回
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="cyber-card rounded-xl overflow-hidden">
              <div className="aspect-square bg-dark/50 flex items-center justify-center">
                <img
                  src={mockMeme.image}
                  alt={mockMeme.title}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>

            <div className="cyber-card rounded-xl p-6 mt-6">
              <h1 className="text-2xl font-bold mb-4">{mockMeme.title}</h1>
              <p className="text-gray-400 mb-4">{mockMeme.description}</p>

              <div className="flex flex-wrap gap-2 mb-6">
                {mockMeme.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs rounded-full bg-primary/20 text-primary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 transition-colors ${
                      liked ? 'text-primary' : 'text-gray-400 hover:text-primary'
                    }`}
                  >
                    <Heart size={24} fill={liked ? 'currentColor' : 'none'} />
                    <span>{likes}</span>
                  </button>
                  <span className="flex items-center gap-2 text-gray-400">
                    <MessageCircle size={20} />
                    <span>{comments.length}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className="p-2 rounded-lg hover:bg-primary/10 text-gray-400 hover:text-white transition-colors"
                    title="分享"
                  >
                    <Share2 size={20} />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-2 rounded-lg hover:bg-primary/10 text-gray-400 hover:text-white transition-colors"
                    title="下载"
                  >
                    <Download size={20} />
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                    title="举报"
                  >
                    <Flag size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="cyber-card rounded-xl p-6 mt-6">
              <h3 className="font-semibold mb-4">评论 ({comments.length})</h3>

              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  placeholder="发表评论..."
                  className="flex-1 px-4 py-3 cyber-input rounded-xl"
                />
                <button
                  onClick={handleComment}
                  className="px-6 py-3 cyber-btn rounded-xl font-medium"
                >
                  发送
                </button>
              </div>

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                      <User size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.author}</span>
                        <span className="text-xs text-gray-500">{comment.createdAt}</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{comment.content}</p>
                      <button className="text-xs text-gray-500 hover:text-primary transition-colors">
                        👍 {comment.likes}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="cyber-card rounded-xl p-4 sticky top-24">
              <h3 className="font-semibold mb-4">作者</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-medium">{mockMeme.author}</p>
                  <p className="text-xs text-gray-500">发布于 {mockMeme.createdAt}</p>
                </div>
              </div>
              <button className="w-full py-2 cyber-btn-outline rounded-lg text-sm font-medium">
                关注
              </button>
            </div>

            <div className="cyber-card rounded-xl p-4 mt-4">
              <h3 className="font-semibold mb-4">作品数据</h3>
              <div className="space-y-3">
                <DataItem label="浏览量" value={mockMeme.viewCount} />
                <DataItem label="点赞数" value={likes} />
                <DataItem label="评论数" value={comments.length} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DataItem = ({ label, value }: { label: string; value: number | string }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-400 text-sm">{label}</span>
    <span className="font-semibold text-primary">{value}</span>
  </div>
);

export default MemeDetail;
