'use client';

import Link from 'next/link';
import type { Snippet } from '@/types';

interface SnippetCardProps {
  snippet: Snippet;
}

export default function SnippetCard({ snippet }: SnippetCardProps) {
  const getLanguageBadgeColor = (lang: string) => {
    const colors: Record<string, string> = {
      javascript: 'bg-yellow-100 text-yellow-800',
      typescript: 'bg-blue-100 text-blue-800',
      python: 'bg-green-100 text-green-800',
      java: 'bg-red-100 text-red-800',
      html: 'bg-orange-100 text-orange-800',
      css: 'bg-purple-100 text-purple-800',
      jsx: 'bg-cyan-100 text-cyan-800',
      tsx: 'bg-indigo-100 text-indigo-800',
    };
    return colors[lang.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const codePreview = snippet.code
    .split('\n')
    .slice(0, 6)
    .join('\n');

  return (
    <Link
      href={`/snippets/${snippet.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden group"
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
            {snippet.title}
          </h3>
          <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
            {snippet.visibility === 'private' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                私有
              </span>
            )}
          </div>
        </div>

        {snippet.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{snippet.description}</p>
        )}

        <div className="bg-gray-900 rounded-lg p-3 mb-3 overflow-hidden">
          <pre className="text-gray-100 text-xs font-mono whitespace-pre-wrap line-clamp-6 leading-relaxed">
            {codePreview}
            {snippet.code.split('\n').length > 6 && (
              <span className="text-gray-500">...</span>
            )}
          </pre>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getLanguageBadgeColor(snippet.language)}`}>
              {snippet.language}
            </span>
            {snippet.tags && snippet.tags.slice(0, 3).map((tag) => (
              <span key={tag.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                #{tag.name}
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-400">
            <span>v{snippet.current_version}</span>
            <span>·</span>
            <span>{formatDate(snippet.updated_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
