'use client';

import { useState } from 'react';

interface EmbedModalProps {
  snippetId: number;
  onClose: () => void;
}

export default function EmbedModal({ snippetId, onClose }: EmbedModalProps) {
  const [embedType, setEmbedType] = useState<'script' | 'iframe' | 'link'>('script');
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const scriptEmbed = `<script src="${baseUrl}/embed/${snippetId}.js"></script>`;
  const iframeEmbed = `<iframe src="${baseUrl}/embed/${snippetId}" width="100%" height="400" frameborder="0"></iframe>`;
  const linkEmbed = `<a href="${baseUrl}/snippets/${snippetId}">查看代码片段</a>`;

  const getEmbedCode = () => {
    switch (embedType) {
      case 'script':
        return scriptEmbed;
      case 'iframe':
        return iframeEmbed;
      case 'link':
        return linkEmbed;
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">嵌入代码片段</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setEmbedType('script')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                embedType === 'script'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Script 标签
            </button>
            <button
              onClick={() => setEmbedType('iframe')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                embedType === 'iframe'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Iframe 嵌入
            </button>
            <button
              onClick={() => setEmbedType('link')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                embedType === 'link'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              链接
            </button>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap break-all">
              {getEmbedCode()}
            </pre>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {embedType === 'script' && '将此脚本标签复制到你的 HTML 中即可嵌入代码片段'}
              {embedType === 'iframe' && '使用 iframe 嵌入完整的代码片段页面'}
              {embedType === 'link' && '创建一个指向此代码片段的链接'}
            </p>
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>已复制!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>复制代码</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">预览</h3>
            <div className="bg-white rounded-lg overflow-hidden border border-blue-200">
              {embedType === 'script' && (
                <div className="p-4">
                  <p className="text-sm text-gray-500 italic">Script 嵌入预览 (需要在浏览器中查看效果)</p>
                </div>
              )}
              {embedType === 'iframe' && (
                <iframe
                  src={`${baseUrl}/embed/${snippetId}`}
                  width="100%"
                  height="300"
                  frameBorder="0"
                  title="Embed Preview"
                />
              )}
              {embedType === 'link' && (
                <div className="p-4">
                  <a
                    href={`${baseUrl}/snippets/${snippetId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 underline"
                  >
                    查看代码片段 #{snippetId}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
