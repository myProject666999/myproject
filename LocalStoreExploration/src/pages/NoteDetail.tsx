import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Heart, Share2, Bookmark, MessageCircle, Eye, Clock, ChevronRight } from 'lucide-react';
import RatingStars from '../components/RatingStars';
import { Note, Comment } from '../types';
import { api } from '../services/api';

const mockNote: Note = {
  id: 1,
  userId: 1,
  shopId: 1,
  title: '超赞的火锅店！必点毛肚和肥牛',
  content: '今天来打卡这家网红火锅店，环境真的太棒了！毛肚特别新鲜，七上八下之后口感脆嫩。肥牛也是入口即化，麻辣锅底味道正宗。人均150左右，性价比很高！强烈推荐给各位火锅爱好者～\n\n店内装修很有特色，是那种复古工业风，拍照也很好看。服务员态度很好，会主动帮忙涮菜，换骨碟也很勤快。\n\n必点菜品：\n1. 鲜毛肚 - 真的超级新鲜，涮完脆脆的\n2. 雪花肥牛 - 肥瘦相间，入口即化\n3. 手打虾滑 - Q弹有嚼劲\n4. 麻辣牛肉 - 辣得过瘾',
  images: [
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1594983162858-89e53a1c5d50?w=800&h=600&fit=crop',
  ],
  ratingOverall: 4.8,
  ratingTaste: 5,
  ratingEnv: 4.5,
  ratingService: 4.7,
  ratingCost: 4.2,
  lat: 39.9087,
  lng: 116.4474,
  address: '北京市朝阳区建国路88号SOHO现代城底商',
  category: '火锅',
  status: 'approved',
  viewsCount: 2345,
  likesCount: 186,
  commentsCount: 45,
  createdAt: '2024-01-15T10:00:00Z',
  user: {
    id: 1,
    username: 'daren1',
    nickname: '美食达人小王',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    bio: '专注美食探店10年，吃遍全城好吃的！',
    followersCount: 12580,
    notesCount: 156,
    isVerified: 1,
    createdAt: '2023-01-01T00:00:00Z',
  },
  shop: {
    id: 1,
    name: '老王火锅店',
    address: '北京市朝阳区建国路88号SOHO现代城底商',
    phone: '010-88888888',
    category: '火锅',
    coverImage: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
    images: [],
    rating: 4.8,
    lat: 39.9087,
    lng: 116.4474,
    businessHours: '10:00-22:00',
    notesCount: 36,
    averageCost: 128,
  },
};

const mockComments: Comment[] = [
  {
    id: 1,
    userId: 2,
    noteId: 1,
    content: '这家我也去过！毛肚确实好吃，每次必点！',
    likesCount: 23,
    createdAt: '2024-01-15T12:00:00Z',
    user: {
      id: 2,
      username: 'daren2',
      nickname: '探店达人小美',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      bio: '颜值与美食并存',
      followersCount: 8950,
      notesCount: 89,
      isVerified: 1,
      createdAt: '2023-02-01T00:00:00Z',
    },
  },
  {
    id: 2,
    userId: 3,
    noteId: 1,
    content: '收藏了，周末去打卡！人均大概多少呀？',
    likesCount: 15,
    createdAt: '2024-01-15T14:30:00Z',
    user: {
      id: 3,
      username: 'daren3',
      nickname: '吃货老张',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      bio: '不是在吃，就是在去吃的路上',
      followersCount: 5680,
      notesCount: 72,
      isVerified: 1,
      createdAt: '2023-03-01T00:00:00Z',
    },
  },
];

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const [note, setNote] = useState<Note>(mockNote);
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setNote(mockNote);
        setComments(mockComments);
      } catch (error) {
        console.error('Failed to fetch note:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: comments.length + 1,
        userId: 1,
        noteId: parseInt(id || '1'),
        content: newComment,
        likesCount: 0,
        createdAt: new Date().toISOString(),
        user: {
          id: 1,
          username: 'me',
          nickname: '我',
          avatar: 'https://picsum.photos/40/40',
          bio: '',
          followersCount: 0,
          notesCount: 0,
          isVerified: 0,
          createdAt: new Date().toISOString(),
        },
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="relative">
        <div className="relative h-72">
          <img
            src={note.images[currentImage]}
            alt={note.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 flex gap-2">
            {note.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentImage ? 'bg-white w-6' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>

        <Link
          to="/"
          className="absolute top-4 left-4 w-10 h-10 bg-black/30 backdrop-blur rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>

        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-10 h-10 bg-black/30 backdrop-blur rounded-full flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 py-5 bg-white -mt-6 rounded-t-3xl relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <h1 className="text-xl font-bold text-gray-900 mb-2">{note.title}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              <span>·</span>
              <Eye className="w-4 h-4" />
              <span>{note.viewsCount} 浏览</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <RatingStars rating={note.ratingOverall} showValue />
          </div>
        </div>

        <div className="flex items-center gap-3 py-4 border-t border-gray-100">
          <img
            src={note.user.avatar}
            alt={note.user.nickname}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{note.user.nickname}</span>
              {note.user.isVerified && (
                <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">达人</span>
              )}
            </div>
            <p className="text-sm text-gray-500">{note.user.followersCount} 粉丝</p>
          </div>
          <button className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-full">
            关注
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 py-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">口味</p>
            <p className="text-lg font-bold text-gray-900">{note.ratingTaste}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">环境</p>
            <p className="text-lg font-bold text-gray-900">{note.ratingEnv}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">服务</p>
            <p className="text-lg font-bold text-gray-900">{note.ratingService}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">性价比</p>
            <p className="text-lg font-bold text-gray-900">{note.ratingCost}</p>
          </div>
        </div>

        <div className="py-4 border-t border-gray-100">
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{note.content}</p>
        </div>

        <Link
          to={`/shop/${note.shop.id}`}
          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mt-4"
        >
          <img
            src={note.shop.coverImage}
            alt={note.shop.name}
            className="w-20 h-20 rounded-xl object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{note.shop.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{note.shop.address}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-orange-500 font-medium">¥{note.shop.averageCost}/人</span>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs text-gray-400">{note.shop.notesCount} 条探店</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>

        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            评论 ({comments.length})
          </h2>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <img
                  src={comment.user.avatar}
                  alt={comment.user.nickname}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {comment.user.nickname}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                  <button className="flex items-center gap-1 text-gray-400 text-xs mt-2">
                    <Heart className="w-4 h-4" />
                    <span>{comment.likesCount}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-4">
        <input
          type="text"
          placeholder="写下你的评论..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
          className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <button
          onClick={handleLike}
          className={`p-2 rounded-full transition-all ${
            isLiked ? 'bg-red-50 text-red-500' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500' : ''}`} />
        </button>
        <button
          onClick={handleFavorite}
          className={`p-2 rounded-full transition-all ${
            isFavorited ? 'bg-orange-50 text-orange-500' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Bookmark className={`w-6 h-6 ${isFavorited ? 'fill-orange-500' : ''}`} />
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
