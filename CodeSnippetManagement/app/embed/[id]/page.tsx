'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CodeEditor from '@/components/CodeEditor';
import type { Snippet, ApiResponse } from '@/types';

export default function EmbedPage() {
  const params = useParams();
  const id = params?.id as string;
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchSnippet();
    }
  }, [id]);

  const fetchSnippet = async () => {
    try {
      const res = await fetch(`/api/snippets/${id}`);
      const data: ApiResponse<Snippet> = await res.json();
      if (data.success && data.data) {
        if (data.data.visibility === 'private') {
          setError('此代码片段为私有');
        } else {
          setSnippet(data.data);
        }
      } else {
        setError(data.error || '加载失败');
      }
    } catch (err: any) {
      setError(err.message || '加载失败');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <span className="text-white font-medium text-sm">{snippet.title}</span>
          <span className="text-gray-400 text-xs">{snippet.language}</span>
        </div>
        <a
          href={`/snippets/${snippet.id}`}
          className="text-gray-400 hover:text-white text-xs transition-colors"
          target="_blank"
        >
          查看完整代码 →
        </a>
      </div>
      <div className="h-[calc(100vh-40px)]">
        <CodeEditor
          code={snippet.code}
          language={snippet.language}
          onChange={() => {}}
          readOnly
          height="100%"
        />
      </div>
    </div>
  );
}
