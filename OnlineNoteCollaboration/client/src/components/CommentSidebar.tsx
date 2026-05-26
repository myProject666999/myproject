import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { commentsApi } from '../api';
import dayjs from 'dayjs';

interface Comment {
  id: number;
  document_id: number;
  content: string;
  parent_id: number | null;
  user_id: number;
  username: string;
  created_at: string;
  updated_at: string;
  resolved: boolean;
  resolved_by: number | null;
  resolved_at: string | null;
  mentions?: number[];
}

interface CommentSidebarProps {
  documentId: number;
  members?: { user_id: number; username: string; email?: string }[];
}

interface MentionPickerProps {
  members: { user_id: number; username: string }[];
  filter: string;
  onSelect: (username: string) => void;
}

const MentionPicker: React.FC<MentionPickerProps> = ({ members, filter, onSelect }) => {
  const filteredMembers = members.filter((m) =>
    m.username.toLowerCase().includes(filter.toLowerCase())
  );
  if (filteredMembers.length === 0) {
    return (
      <div
        style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          right: 0,
          background: '#fff',
          border: '1px solid #e0e0e0',
          borderRadius: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxHeight: 160,
          overflowY: 'auto',
          zIndex: 10,
          padding: 8,
          fontSize: 12,
          color: '#999',
        }}
      >
        无匹配成员
      </div>
    );
  }
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        background: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxHeight: 200,
        overflowY: 'auto',
        zIndex: 10,
      }}
    >
      {filteredMembers.map((m) => (
        <div
          key={m.user_id}
          onClick={() => onSelect(m.username)}
          style={{
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: 13,
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = '#f0f7ff')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}
        >
          @{m.username}
        </div>
      ))}
    </div>
  );
};

const CommentSidebar: React.FC<CommentSidebarProps> = ({ documentId, members = [] }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [mentionOpen, setMentionOpen] = useState<number | null>(null);
  const [mentionFilter, setMentionFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (documentId) {
      loadComments();
    }
  }, [documentId]);

  const loadComments = async () => {
    try {
      const response = await commentsApi.list(documentId);
      setComments(response.data || []);
    } catch (err) {
      console.error('加载评论失败', err);
    }
  };

  const topLevelComments = comments.filter((c) => !c.parent_id);
  const getReplies = (id: number) => comments.filter((c) => c.parent_id === id);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const { content, mentions } = parseMentions(newComment);
      await commentsApi.create({
        document_id: documentId,
        content,
        mentions,
      });
      setNewComment('');
      loadComments();
    } catch (err: any) {
      alert(err.response?.data?.message || '发表评论失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async (parentId: number) => {
    if (!replyContent.trim()) return;
    setLoading(true);
    try {
      const { content, mentions } = parseMentions(replyContent);
      await commentsApi.create({
        document_id: documentId,
        content,
        parent_id: parentId,
        mentions,
      });
      setReplyingTo(null);
      setReplyContent('');
      loadComments();
    } catch (err: any) {
      alert(err.response?.data?.message || '回复失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此评论吗？')) return;
    try {
      await commentsApi.delete(id);
      loadComments();
    } catch (err: any) {
      alert(err.response?.data?.message || '删除失败');
    }
  };

  const handleToggleResolve = async (id: number, resolved: boolean) => {
    try {
      if (resolved) {
        await commentsApi.unresolve(id);
      } else {
        await commentsApi.resolve(id);
      }
      loadComments();
    } catch (err: any) {
      alert(err.response?.data?.message || '操作失败');
    }
  };

  const parseMentions = (text: string): { content: string; mentions: number[] } => {
    const mentions: number[] = [];
    const regex = /@(\S+)/g;
    const content = text.replace(regex, (m, name) => {
      const member = members.find(
        (mb) => mb.username.toLowerCase() === name.toLowerCase()
      );
      if (member) {
        mentions.push(member.user_id);
        return `[user:${member.user_id}]@${member.username}[/user]`;
      }
      return m;
    });
    return { content, mentions };
  };

  const renderContent = (content: string) => {
    return content.replace(/\[user:(\d+)\]@(\S+)\[\/user\]/g, (_, uid, name) => {
      return `<span style="color:#1890ff;cursor:pointer;background:#e6f7ff;padding:0 4px;border-radius:3px;">@${name}</span>`;
    });
  };

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    setContent: (v: string) => void,
    currentContent: string,
    mentionTargetId: number | null
  ) => {
    if (e.key === '@') {
      setMentionOpen(mentionTargetId);
      setMentionFilter('');
      return;
    }
    if (e.key === 'Escape') {
      setMentionOpen(null);
      return;
    }
    if (e.key === ' ') {
      setMentionOpen(null);
      return;
    }
    if (mentionOpen === mentionTargetId) {
      if (e.key.length === 1) {
        setMentionFilter((f) => f + e.key);
      } else if (e.key === 'Backspace') {
        setMentionFilter((f) => f.slice(0, -1));
      }
    }
  };

  const handleSelectMention = (
    username: string,
    setContent: (v: string) => void,
    currentContent: string,
    textarea: HTMLTextAreaElement | null,
    closeMention: () => void
  ) => {
    if (!textarea) return;
    const selEnd = textarea.selectionEnd;
    const before = currentContent.slice(0, selEnd);
    const after = currentContent.slice(selEnd);
    const atIdx = before.lastIndexOf('@');
    if (atIdx < 0) return;
    const newContent = before.slice(0, atIdx) + `@${username} ` + after;
    setContent(newContent);
    closeMention();
    setTimeout(() => {
      const inserted = atIdx + username.length + 2;
      textarea.focus();
      textarea.setSelectionRange(inserted, inserted);
    }, 0);
  };

  return (
    <div className="comment-sidebar">
      <div className="comment-header">评论 ({topLevelComments.length})</div>
      <div className="comment-list">
        {topLevelComments.length === 0 && (
          <div style={{ textAlign: 'center', color: '#999', padding: '24px 0' }}>
            暂无评论
          </div>
        )}
        {topLevelComments.map((comment) => {
          const replies = getReplies(comment.id);
          const isMine = user?.userId === comment.user_id;
          return (
            <div key={comment.id} className={`comment-item ${comment.resolved ? 'resolved' : ''}`}>
              <div className="comment-meta">
                <span style={{ fontWeight: 600, color: '#333' }}>{comment.username}</span>
                <span style={{ margin: '0 6px' }}>·</span>
                <span>{dayjs(comment.created_at).format('YYYY-MM-DD HH:mm')}</span>
                {comment.resolved && (
                  <span
                    style={{
                      marginLeft: 8,
                      padding: '1px 6px',
                      background: '#52c41a',
                      color: '#fff',
                      borderRadius: 3,
                      fontSize: 11,
                    }}
                  >
                    已解决
                  </span>
                )}
              </div>
              <div
                className="comment-content"
                dangerouslySetInnerHTML={{ __html: renderContent(comment.content) }}
              />
              <div style={{ marginTop: 8, display: 'flex', gap: 8, fontSize: 12 }}>
                <button
                  className="btn btn-default"
                  style={{ padding: '2px 8px', fontSize: 12 }}
                  onClick={() => handleToggleResolve(comment.id, comment.resolved)}
                >
                  {comment.resolved ? '取消解决' : '解决'}
                </button>
                <button
                  className="btn btn-default"
                  style={{ padding: '2px 8px', fontSize: 12 }}
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                >
                  回复
                </button>
                {isMine && (
                  <button
                    className="btn btn-danger"
                    style={{ padding: '2px 8px', fontSize: 12 }}
                    onClick={() => handleDelete(comment.id)}
                  >
                    删除
                  </button>
                )}
              </div>

              {replyingTo === comment.id && (
                <div
                  style={{
                    marginTop: 8,
                    padding: 8,
                    background: '#f5f5f5',
                    borderRadius: 4,
                    position: 'relative',
                  }}
                >
                  <textarea
                    ref={replyTextareaRef}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="回复评论...（输入 @ 可提及成员）"
                    rows={2}
                    onKeyDown={(e) =>
                      handleTextareaKeyDown(e, setReplyContent, replyContent, comment.id)
                    }
                  />
                  {mentionOpen === comment.id && (
                    <MentionPicker
                      members={members}
                      filter={mentionFilter}
                      onSelect={(u) =>
                        handleSelectMention(
                          u,
                          setReplyContent,
                          replyContent,
                          replyTextareaRef.current,
                          () => setMentionOpen(null)
                        )
                      }
                    />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
                    <button
                      className="btn btn-default"
                      style={{ padding: '4px 10px', fontSize: 12 }}
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                    >
                      取消
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{ padding: '4px 10px', fontSize: 12 }}
                      onClick={() => handleAddReply(comment.id)}
                      disabled={loading}
                    >
                      发送
                    </button>
                  </div>
                </div>
              )}

              {replies.length > 0 && (
                <div style={{ marginTop: 8, paddingLeft: 16, borderLeft: '2px solid #e0e0e0' }}>
                  {replies.map((reply) => {
                    const isReplyMine = user?.userId === reply.user_id;
                    return (
                      <div
                        key={reply.id}
                        style={{ marginTop: 8, padding: 6, background: '#fafafa', borderRadius: 4 }}
                      >
                        <div className="comment-meta">
                          <span style={{ fontWeight: 600, color: '#333' }}>{reply.username}</span>
                          <span style={{ margin: '0 6px' }}>·</span>
                          <span>{dayjs(reply.created_at).format('YYYY-MM-DD HH:mm')}</span>
                        </div>
                        <div
                          className="comment-content"
                          dangerouslySetInnerHTML={{ __html: renderContent(reply.content) }}
                        />
                        {isReplyMine && (
                          <div style={{ marginTop: 4 }}>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '2px 8px', fontSize: 12 }}
                              onClick={() => handleDelete(reply.id)}
                            >
                              删除
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="comment-input">
        <div style={{ position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="添加评论...（输入 @ 可提及成员）"
            rows={3}
            onKeyDown={(e) =>
              handleTextareaKeyDown(e, setNewComment, newComment, 0)
            }
          />
          {mentionOpen === 0 && (
            <MentionPicker
              members={members}
              filter={mentionFilter}
              onSelect={(u) =>
                handleSelectMention(
                  u,
                  setNewComment,
                  newComment,
                  textareaRef.current,
                  () => setMentionOpen(null)
                )
              }
            />
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            className="btn btn-primary"
            onClick={handleAddComment}
            disabled={loading || !newComment.trim()}
          >
            {loading ? '发送中...' : '发表评论'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentSidebar;
