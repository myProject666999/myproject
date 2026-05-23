'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ColorScheme } from '@/types';
import { hexToHsl } from '@/lib/colorUtils';

export default function SchemeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [scheme, setScheme] = useState<ColorScheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCss, setShowCss] = useState(false);
  const [cssContent, setCssContent] = useState('');

  const fetchScheme = async () => {
    try {
      const res = await fetch(`/api/schemes/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setScheme(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch scheme:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheme();
  }, [params.id]);

  const toggleFavorite = async () => {
    if (!scheme) return;
    try {
      const res = await fetch(`/api/schemes/${scheme.id}/favorite`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setScheme({ ...scheme, isFavorite: data.data.isFavorite });
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const generateCss = async () => {
    try {
      const res = await fetch(`/api/schemes/${params.id}/css`);
      const css = await res.text();
      setCssContent(css);
      setShowCss(true);
    } catch (error) {
      console.error('Failed to generate CSS:', error);
    }
  };

  const copyCss = () => {
    navigator.clipboard.writeText(cssContent);
    alert('CSS 已复制到剪贴板');
  };

  const downloadCss = () => {
    const blob = new Blob([cssContent], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scheme?.name || 'color-scheme'}.css`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteScheme = async () => {
    if (!scheme) return;
    if (!confirm('确定要删除这个配色方案吗？')) return;

    try {
      const res = await fetch(`/api/schemes/${scheme.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to delete scheme:', error);
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!scheme) {
    return <div className="error">配色方案不存在</div>;
  }

  return (
    <div>
      <Link href="/" className="back-link">
        ← 返回广场
      </Link>

      <div className="detail-page">
        <div className="detail-header">
          <div>
            <h1 className="detail-title">{scheme.name}</h1>
            {scheme.description && (
              <p className="detail-desc">{scheme.description}</p>
            )}
          </div>
          <button
            className={`favorite-btn ${scheme.isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
            style={{ fontSize: '2rem' }}
          >
            {scheme.isFavorite ? '❤️' : '🤍'}
          </button>
        </div>

        <div className="detail-colors">
          {scheme.colors.map((color) => {
            const hsl = hexToHsl(color.hex);
            return (
              <div key={color.id} className="detail-color-item">
                <div
                  className="detail-color-box"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="detail-color-hex">{color.hex}</div>
                <div className="detail-color-hsl">
                  HSL({hsl.h}, {hsl.s}%, {hsl.l}%)
                </div>
              </div>
            );
          })}
        </div>

        <div className="detail-actions">
          <button className="btn btn-primary" onClick={generateCss}>
            🎨 生成 CSS
          </button>
          <button className="btn btn-danger" onClick={deleteScheme}>
            🗑️ 删除
          </button>
        </div>

        {showCss && (
          <div
            style={{
              marginTop: '24px',
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <strong>CSS 代码</strong>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" onClick={copyCss}>
                  复制
                </button>
                <button className="btn btn-secondary" onClick={downloadCss}>
                  下载
                </button>
              </div>
            </div>
            <pre
              style={{
                background: '#282c34',
                color: '#abb2bf',
                padding: '16px',
                borderRadius: '8px',
                overflowX: 'auto',
                fontSize: '0.9rem',
              }}
            >
              {cssContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
