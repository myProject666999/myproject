import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { documentsApi, spacesApi } from '../api';
import CommentSidebar from '../components/CommentSidebar';

interface Collaborator {
  user_id: number;
  username: string;
  socket_id: string;
}

interface Member {
  user_id: number;
  username: string;
  email?: string;
}

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean'],
  ],
};

const quillFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'color',
  'background',
  'list',
  'align',
  'blockquote',
  'code-block',
  'link',
  'image',
];

const DocumentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [spaceId, setSpaceId] = useState<number | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [loading, setLoading] = useState(true);

  const quillRef = useRef<ReactQuill>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isRemoteChangeRef = useRef(false);

  const docId = id ? Number(id) : NaN;

  useEffect(() => {
    if (docId) {
      loadDocument();
      connectSocket();
    }
    return () => {
      disconnectSocket();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [docId]);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const response = await documentsApi.get(docId);
      const doc = response.data;
      setTitle(doc.title || '');
      setContent(doc.content || '');
      setSpaceId(doc.space_id);
      if (doc.space_id) {
        try {
          const membersResponse = await spacesApi.getMembers(doc.space_id);
          setMembers(membersResponse.data || []);
        } catch (_err) {
          setMembers([]);
        }
      }
    } catch (err) {
      console.error('加载文档失败', err);
      alert('加载文档失败');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const connectSocket = () => {
    if (socketRef.current) return;
    try {
      const token = localStorage.getItem('token');
      const socket = io({
        transports: ['websocket', 'polling'],
        auth: token ? { token } : undefined,
      });

      socket.on('connect', () => {
        socket.emit('document:join', {
          document_id: docId,
          user_id: user?.userId,
          username: user?.username,
        });
      });

      socket.on('document:collaborators', (data: Collaborator[]) => {
        setCollaborators(data || []);
      });

      socket.on('document:change', (data: { content: string; user_id: number }) => {
        if (data.user_id === user?.userId) return;
        isRemoteChangeRef.current = true;
        setContent(data.content || '');
        setSaveStatus('saved');
        setTimeout(() => {
          isRemoteChangeRef.current = false;
        }, 100);
      });

      socket.on('document:title-change', (data: { title: string; user_id: number }) => {
        if (data.user_id === user?.userId) return;
        setTitle(data.title || '');
      });

      socketRef.current = socket;
    } catch (err) {
      console.warn('WebSocket 连接失败', err);
    }
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      try {
        socketRef.current.emit('document:leave', {
          document_id: docId,
          user_id: user?.userId,
        });
      } catch (_err) {
        /* ignore */
      }
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const scheduleSave = useCallback(
    (newContent: string, newTitle: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      setSaveStatus('unsaved');
      saveTimeoutRef.current = setTimeout(() => {
        performSave(newContent, newTitle);
      }, 3000);
    },
    [docId]
  );

  const performSave = async (newContent: string, newTitle: string) => {
    if (!docId) return;
    try {
      setSaveStatus('saving');
      await documentsApi.update(docId, {
        title: newTitle,
        content: newContent,
      });
      setSaveStatus('saved');
    } catch (err: any) {
      console.error('自动保存失败', err);
      setSaveStatus('unsaved');
    }
  };

  const handleContentChange = (value: string) => {
    if (isRemoteChangeRef.current) return;
    setContent(value);
    if (socketRef.current) {
      socketRef.current.emit('document:change', {
        document_id: docId,
        content: value,
        user_id: user?.userId,
      });
    }
    scheduleSave(value, title);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (socketRef.current) {
      socketRef.current.emit('document:title-change', {
        document_id: docId,
        title: newTitle,
        user_id: user?.userId,
      });
    }
    scheduleSave(content, newTitle);
  };

  const handleBack = () => {
    if (spaceId) {
      navigate(`/spaces/${spaceId}`);
    } else {
      navigate(-1);
    }
  };

  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return <span style={{ color: '#faad14' }}>保存中...</span>;
      case 'unsaved':
        return <span style={{ color: '#999' }}>未保存</span>;
      case 'saved':
      default:
        return <span style={{ color: '#52c41a' }}>已保存</span>;
    }
  };

  return (
    <div className="app" style={{ flexDirection: 'column', height: '100vh' }}>
      <div
        style={{
          padding: '12px 16px',
          background: '#fff',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <button className="btn btn-default" onClick={handleBack} style={{ padding: '6px 12px' }}>
          ← 返回
        </button>
        <input
          type="text"
          className="editor-title"
          style={{
            flex: 1,
            fontSize: 18,
            padding: '6px 10px',
            border: '1px solid transparent',
            borderRadius: 4,
            outline: 'none',
          }}
          value={title}
          onChange={handleTitleChange}
          placeholder="文档标题"
          onFocus={(e) => (e.currentTarget.style.borderColor = '#1890ff')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'transparent')}
        />
        <div style={{ fontSize: 13, minWidth: 80, textAlign: 'right' }}>
          {renderSaveStatus()}
        </div>
        {collaborators.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
            <span style={{ fontSize: 12, color: '#666' }}>在线：</span>
            {collaborators.map((c) => (
              <div
                key={c.socket_id}
                title={c.username}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: '#1890ff',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 'bold',
                  marginLeft: 2,
                  border: '2px solid #fff',
                  boxShadow: '0 0 0 1px #52c41a',
                }}
              >
                {c.username?.[0]?.toUpperCase()}
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#fff',
            color: '#999',
          }}
        >
          加载中...
        </div>
      ) : (
        <div className="editor-container" style={{ flex: 1, borderRadius: 0 }}>
          <div className="editor-main">
            <div className="editor-content" style={{ padding: 0 }}>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={content}
                onChange={handleContentChange}
                modules={quillModules}
                formats={quillFormats}
                placeholder="开始输入内容..."
                style={{ height: '100%' }}
              />
            </div>
          </div>
          <CommentSidebar documentId={docId} members={members} />
        </div>
      )}
    </div>
  );
};

export default DocumentEditor;
