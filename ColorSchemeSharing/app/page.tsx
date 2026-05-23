'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ColorScheme } from '@/types';
import { HUE_CATEGORIES } from '@/lib/colorUtils';

export default function SquarePage() {
  const [schemes, setSchemes] = useState<ColorScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHue, setSelectedHue] = useState<number | null>(null);

  const fetchSchemes = async (hue?: number | null) => {
    setLoading(true);
    try {
      let url = '/api/schemes';
      if (hue !== null && hue !== undefined) {
        url += `?hue=${hue}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSchemes(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch schemes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes(selectedHue);
  }, [selectedHue]);

  const toggleFavorite = async (schemeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/schemes/${schemeId}/favorite`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSchemes((prev) =>
          prev.map((scheme) =>
            scheme.id === schemeId
              ? { ...scheme, isFavorite: data.data.isFavorite }
              : scheme
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div>
      <h1 className="page-title">配色广场</h1>

      <div className="hue-filter">
        <button
          className={`hue-btn ${selectedHue === null ? 'active' : ''}`}
          onClick={() => setSelectedHue(null)}
        >
          全部
        </button>
        {HUE_CATEGORIES.map((cat) => (
          <button
            key={cat.hue}
            className={`hue-btn ${selectedHue === cat.hue ? 'active' : ''}`}
            onClick={() => setSelectedHue(cat.hue)}
          >
            <span
              className="hue-dot"
              style={{ backgroundColor: cat.color }}
            />
            {cat.name}
          </button>
        ))}
      </div>

      {schemes.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🎨</div>
          <p>暂无配色方案</p>
        </div>
      ) : (
        <div className="scheme-grid">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className="scheme-card"
              onClick={() => (window.location.href = `/schemes/${scheme.id}`)}
            >
              <div className="scheme-colors">
                {scheme.colors.map((color) => (
                  <div
                    key={color.id}
                    className="scheme-color"
                    style={{ backgroundColor: color.hex }}
                  >
                    <span>{color.hex}</span>
                  </div>
                ))}
              </div>
              <div className="scheme-info">
                <h3>{scheme.name}</h3>
                {scheme.description && <p>{scheme.description}</p>}
                <div className="scheme-meta">
                  <span>
                    {new Date(scheme.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                  <button
                    className={`favorite-btn ${scheme.isFavorite ? 'active' : ''}`}
                    onClick={(e) => toggleFavorite(scheme.id, e)}
                  >
                    {scheme.isFavorite ? '❤️' : '🤍'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
