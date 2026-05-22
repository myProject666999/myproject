'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CodeEditor from '@/components/CodeEditor';
import EmbedModal from '@/components/EmbedModal';
import type { Snippet, SnippetVersion, ApiResponse } from '@/types';

export default function SnippetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [versions, setVersions] = useState<SnippetVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<SnippetVersion | null>(null);

  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editLanguage, setEditLanguage] = useState('javascript');
  const [editVisibility, setEditVisibility] = useState<'public' | 'private'>('public');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editTagInput, setEditTagInput] = useState('');
  const [editChangeNote, setEditChangeNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSnippet();
      fetchVersions();
    }
  }, [id]);

  const fetchSnippet = async () => {
    try {
      const res = await fetch(`/api/snippets/${id}`);
      const data: ApiResponse<Snippet> = await res.json();
      if (data.success && data.data) {
        setSnippet(data.data);
      } else {
        setError(data.error || '加载失败');
      }
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    try {
      const res = await fetch(`/api/snippets/${id}/versions`);
      const data: ApiResponse<SnippetVersion[]> = await res.json();
      if (data.success && data.data) {
        setVersions(data.data);
      }
    } catch (err) {
      console.error('获取版本历史失败:', err);
    }
  };

  const handleEdit = () => {
    if (snippet) {
      setEditTitle(snippet.title);
      setEditDescription(snippet.description || '');
      setEditCode(snippet.code);
      setEditLanguage(snippet.language);
      setEditVisibility(snippet.visibility);
      setEditTags(snippet.tags?.map(t => t.name) || []);
      setIsEditing(true);
      setSelectedVersion(null);
    }
  };

  const handleSave = async () => {
    if (!editTitle.trim() || !editCode.trim()) {
      setError('标题和代码不能为空');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/snippets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          code: editCode,
          language: editLanguage,
          visibility: editVisibility,
          tags: editTags,
          change_note: editChangeNote,
        }),
      });

      const data: ApiResponse<{ id: number; version: number }> = await res.json();

      if (data.success) {
        setIsEditing(false);
        fetchSnippet();
        fetchVersions();
      } else {
        setError(data.error || '保存失败');
      }
    } catch (err: any) {
      setError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个代码片段吗？此操作不可撤销。')) {
      return;
    }

    try {
      const res = await fetch(`/api/snippets/${id}`, {
        method: 'DELETE',
      });

      const data: ApiResponse<null> = await res.json();

      if (data.success) {
        router.push('/');
      } else {
        setError(data.error || '删除失败');
      }
    } catch (err: any) {
      setError(err.message || '删除失败');
    }
  };

  const viewVersion = (version: SnippetVersion) => {
    setSelectedVersion(version);
    setIsEditing(false);
  };

  const getLanguageBadgeColor = (lang: string) => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-100 text-yellow-800',
      typescript: 'bg-blue-100 text-blue-800',
      python: 'bg-green-100 text-green-800',
      java: 'bg-red-100 text-red-800',
      html: 'bg-orange-100 text-orange-800',
      css: 'bg-purple-100 text-purple-800',
    };
    return colors[lang.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error && !snippet) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="mt-4 text-red-700">{error}</p>
          <Link href="/" className="mt-4 inline-block text-primary-600 hover:text-primary-700">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (!snippet) return null;

  const displayCode = selectedVersion ? selectedVersion.code : editCode;
  const displayLanguage = selectedVersion ? selectedVersion.language : editLanguage;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-2xl font-bold text-gray-900 border-b-2 border-primary-500 focus:outline-none pb-1"
                placeholder="标题"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedVersion ? selectedVersion.title : snippet.title}
              </h1>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {snippet.visibility === 'private' && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                私有
              </span>
            )}
            {!isEditing && !selectedVersion && (
              <>
                <button
                  onClick={() => setShowEmbed(true)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  title="嵌入代码"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(snippet.code)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  title="复制代码"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={handleEdit}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                  title="编辑"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  title="删除"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">代码</label>
              <CodeEditor
                code={editCode}
                language={editLanguage}
                onChange={setEditCode}
                height="400px"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">语言</label>
                <select
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'html', 'css', 'json', 'bash', 'sql', 'markdown'].map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">可见性</label>
                <select
                  value={editVisibility}
                  onChange={(e) => setEditVisibility(e.target.value as 'public' | 'private')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="public">公开</option>
                  <option value="private">私有</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {editTags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => setEditTags(editTags.filter(t => t !== tag))}
                      className="ml-1 text-primary-600 hover:text-primary-800"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={editTagInput}
                onChange={(e) => setEditTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && editTagInput.trim()) {
                    e.preventDefault();
                    if (!editTags.includes(editTagInput.trim())) {
                      setEditTags([...editTags, editTagInput.trim()]);
                    }
                    setEditTagInput('');
                  }
                }}
                placeholder="输入标签后按回车添加"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">版本说明</label>
              <input
                type="text"
                value={editChangeNote}
                onChange={(e) => setEditChangeNote(e.target.value)}
                placeholder="描述这次修改的内容..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setError('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存修改'}
              </button>
            </div>
          </div>
        ) : (
          <>
            {(selectedVersion ? selectedVersion.description : snippet.description) && (
              <p className="text-gray-600 mb-4">
                {selectedVersion ? selectedVersion.description : snippet.description}
              </p>
            )}

            <div className="flex items-center space-x-2 mb-4">
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getLanguageBadgeColor(selectedVersion ? selectedVersion.language : snippet.language)}`}>
                {selectedVersion ? selectedVersion.language : snippet.language}
              </span>
              {(selectedVersion ? [] : snippet.tags || []).map((tag) => (
                <span key={tag.id} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                  #{tag.name}
                </span>
              ))}
            </div>

            <CodeEditor
              code={displayCode}
              language={displayLanguage}
              onChange={() => {}}
              readOnly
              height="400px"
            />

            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>v{selectedVersion ? selectedVersion.version : snippet.current_version}</span>
                <span>更新于 {formatDate(selectedVersion ? selectedVersion.created_at : snippet.updated_at)}</span>
              </div>
              {selectedVersion && (
                <button
                  onClick={() => setSelectedVersion(null)}
                  className="text-primary-600 hover:text-primary-700"
                >
                  查看最新版本
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {!isEditing && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <button
            onClick={() => setShowVersions(!showVersions)}
            className="flex items-center justify-between w-full text-left"
          >
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              版本历史 ({versions.length})
            </h2>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${showVersions ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showVersions && (
            <div className="mt-4 space-y-2">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedVersion?.id === version.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => viewVersion(version)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">v{version.version}</span>
                      {version.change_note && (
                        <span className="text-sm text-gray-500">{version.change_note}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{formatDate(version.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showEmbed && (
        <EmbedModal
          snippetId={parseInt(id)}
          onClose={() => setShowEmbed(false)}
        />
      )}
    </div>
  );
}
