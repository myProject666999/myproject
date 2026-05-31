import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { postApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Heart, MessageCircle, Send, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import dayjs from '../utils/dayjs';

export default function PostDetailPage() {
  const { id } = useParams();
  const postId = Number(id);
  const { user } = useAuthStore();
  const [comment, setComment] = useState('');
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery(
    ['post', postId],
    () => postApi.getPostDetail(postId).then((res) => res.data)
  );

  const { data: hasLiked } = useQuery(
    ['hasLiked', postId],
    () => postApi.hasLiked(postId).then((res) => res.data),
    { enabled: !!user }
  );

  const likeMutation = useMutation(
    () => postApi.likePost(postId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['post', postId]);
        queryClient.invalidateQueries(['hasLiked', postId]);
      },
    }
  );

  const commentMutation = useMutation(
    () => postApi.commentPost(postId, { content: comment }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['post', postId]);
        setComment('');
      },
    }
  );

  const deleteMutation = useMutation(
    () => postApi.deletePost(postId),
    {
      onSuccess: () => {
        window.location.href = '/';
      },
    }
  );

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    commentMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="text-gray-500 hover:text-primary-500 flex items-center">
        <ArrowLeft className="w-4 h-4 mr-1" />
        返回
      </Link>

      <div className="card">
        <div className="flex items-start space-x-3">
          {post?.user?.avatar ? (
            <img
              src={post.user.avatar}
              alt=""
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-500 font-bold">
                {post?.user?.nickname?.[0]}
              </span>
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-800">
                  {post?.user?.nickname}
                </span>
                {post?.group && (
                  <Link
                    to={`/groups/${post.group.id}`}
                    className="ml-2 text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded"
                  >
                    {post.group.name}
                  </Link>
                )}
              </div>
              {post?.userId === user?.id && (
                <button
                  onClick={() => {
                    if (confirm('确定删除这条动态吗？')) {
                      deleteMutation.mutate();
                    }
                  }}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {dayjs(post?.createdAt).format('YYYY-MM-DD HH:mm')}
            </p>
          </div>
        </div>

        <p className="mt-4 text-gray-700 whitespace-pre-wrap">{post?.content}</p>

        {post?.images && post.images.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {post.images.map((img: string, idx: number) => (
              <img
                key={idx}
                src={img}
                alt=""
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t flex items-center space-x-6">
          <button
            onClick={() => likeMutation.mutate()}
            className={`flex items-center space-x-1 ${
              hasLiked?.hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart
              className={`w-5 h-5 ${hasLiked?.hasLiked ? 'fill-current' : ''}`}
            />
            <span>{post?.likeCount}</span>
          </button>
          <span className="flex items-center space-x-1 text-gray-500">
            <MessageCircle className="w-5 h-5" />
            <span>{post?.commentCount}</span>
          </span>
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-800 mb-4">评论 ({post?.comments?.length || 0})</h3>

        <form onSubmit={handleComment} className="mb-6">
          <div className="flex space-x-3">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-500 font-bold">
                  {user?.nickname?.[0]}
                </span>
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="说点什么..."
                className="input-field resize-none"
                rows={2}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!comment.trim() || commentMutation.isLoading}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>发送</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="space-y-4">
          {post?.comments?.map((c: any) => (
            <div key={c.id} className="flex space-x-3">
              {c.user?.avatar ? (
                <img
                  src={c.user.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-500 text-sm font-bold">
                    {c.user?.nickname?.[0]}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-800 text-sm">
                    {c.user?.nickname}
                  </span>
                  <span className="text-xs text-gray-500">
                    {dayjs(c.createdAt).fromNow()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{c.content}</p>
              </div>
            </div>
          ))}
          {(!post?.comments || post.comments.length === 0) && (
            <p className="text-center text-gray-500 py-4">暂无评论</p>
          )}
        </div>
      </div>
    </div>
  );
}
