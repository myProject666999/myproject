import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Heart, Share2, Bookmark, MessageCircle, Eye, Clock, ChevronRight, Loader2 } from 'lucide-react';
import RatingStars from '../components/RatingStars';
import { Note, Comment } from '../types';
import { api } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [note, setNote] = useState<Note | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const noteId = parseInt(id || '1');
        const [noteData, commentsData] = await Promise.all([
          api.getNoteById(noteId),
          api.getCommentsByNoteId(noteId),
        ]);
        setNote(noteData as Note);
        setComments((commentsData as any).list || []);
        const [likeStatus, favStatus, followStatus] = await Promise.all([
          api.checkLike(noteId, 'note').catch(() => ({ isLiked: false })),
          api.checkFavorite(noteId, 'note').catch(() => ({ isFavorite: false })),
          api.checkFollow((noteData as any).user?.id || 0).catch(() => ({ isFollowing: false })),
        ]);
        setIsLiked(likeStatus.isLiked);
        setIsFavorited(favStatus.isFavorite);
        setIsFollowing(followStatus.isFollowing);
      } catch (error) {
        console.error('Failed to fetch note:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isAuthenticated]);

  const requireAuth = (action: () => void) => {
    if (!isAuthenticated) {
      alert('请先登录');
      navigate('/profile');
      return;
    }
    action();
  };

  const handleLike = () => {
    requireAuth(async () => {
      if (actionLoading) return;
      setActionLoading('like');
      try {
        const result = await api.toggleLike(note!.id, 'note');
        setIsLiked(result.liked);
        setNote(prev => prev ? {
          ...prev,
          likesCount: result.liked ? prev.likesCount + 1 : prev.likesCount - 1,
        } : null);
      } catch (error) {
        console.error('Like failed:', error);
        alert('操作失败，请重试');
      } finally {
        setActionLoading(null);
      }
    });
  };

  const handleFavorite = () => {
    requireAuth(async () => {
      if (actionLoading) return;
      setActionLoading('favorite');
      try {
        if (isFavorited) {
          await api.removeFavorite(note!.id, 'note');
          setIsFavorited(false);
        } else {
          await api.addFavorite(note!.id, 'note', 'want');
          setIsFavorited(true);
        }
      } catch (error) {
        console.error('Favorite failed:', error);
        alert('操作失败，请重试');
      } finally {
        setActionLoading(null);
      }
    });
  };

  const handleFollow = () => {
    requireAuth(async () => {
      if (actionLoading) return;
      setActionLoading('follow');
      try {
        const result = await api.toggleFollow(note!.user.id);
        setIsFollowing(result.following);
        setNote(prev => prev ? {
          ...prev,
          user: {
            ...prev.user,
            followersCount: result.following ? prev.user.followersCount + 1 : prev.user.followersCount - 1,
          },
        } : null);
      } catch (error) {
        console.error('Follow failed:', error);
        alert('操作失败，请重试');
      } finally {
        setActionLoading(null);
      }
    });
  };

  const handleSubmitComment = () => {
    requireAuth(async () => {
      if (!newComment.trim() || actionLoading) return;
      setActionLoading('comment');
      try {
        const comment = await api.createComment(note!.id, newComment);
        setComments([comment as Comment, ...comments]);
        setNewComment('');
      } catch (error) {
        console.error('Comment failed:', error);
        alert('评论失败，请重试');
      } finally {
        setActionLoading(null);
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-500">笔记不存在</div>
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
          <button
            onClick={handleFollow}
            disabled={actionLoading === 'follow'}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-2 ${
              isFollowing
                ? 'bg-gray-200 text-gray-600'
                : 'bg-orange-500 text-white'
            }`}
          >
            {actionLoading === 'follow' && <Loader2 className="w-4 h-4 animate-spin" />}
            {isFollowing ? '已关注' : '关注'}
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
          disabled={actionLoading === 'comment'}
          className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <button
          onClick={handleLike}
          disabled={actionLoading === 'like'}
          className={`p-2 rounded-full transition-all ${
            isLiked ? 'bg-red-50 text-red-500' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {actionLoading === 'like' ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500' : ''}`} />
          )}
        </button>
        <button
          onClick={handleFavorite}
          disabled={actionLoading === 'favorite'}
          className={`p-2 rounded-full transition-all ${
            isFavorited ? 'bg-orange-50 text-orange-500' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {actionLoading === 'favorite' ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Bookmark className={`w-6 h-6 ${isFavorited ? 'fill-orange-500' : ''}`} />
          )}
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
