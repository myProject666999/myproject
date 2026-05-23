'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sortColorsByHue, getHue } from '@/lib/colorUtils';

const DEFAULT_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

export default function CreatePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colors, setColors] = useState<string[]>(DEFAULT_COLORS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const sortedColors = sortColorsByHue(colors);

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('请输入配色方案名称');
      return;
    }

    const uniqueColors = new Set(colors.map((c) => c.toLowerCase()));
    if (uniqueColors.size !== 5) {
      setError('请确保5个颜色都是不同的');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/schemes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          colors,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/schemes/${data.data.id}`);
      } else {
        setError(data.error || '创建失败');
      }
    } catch (err: any) {
      setError(err.message || '创建失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Link href="/" className="back-link">
        ← 返回广场
      </Link>

      <form className="create-form" onSubmit={handleSubmit}>
        <h1 className="page-title">创建配色方案</h1>

        {error && <div className="error">{error}</div>}

        <div className="form-group">
          <label className="form-label">方案名称 *</label>
          <input
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：海洋蓝调"
            maxLength={255}
          />
        </div>

        <div className="form-group">
          <label className="form-label">方案描述</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="简单描述这个配色方案的特点..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">选择 5 个颜色 *</label>
          <div className="color-inputs">
            {colors.map((color, index) => (
              <div key={index} className="color-input-item">
                <div
                  className="color-input-box"
                  style={{ backgroundColor: color }}
                >
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                  />
                </div>
                <input
                  type="text"
                  className="color-input-value"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  maxLength={7}
                />
                <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>
                  色相: {getHue(color)}°
                </div>
              </div>
            ))}
          </div>
          <div className="form-hint">
            提示：颜色将按色相自动排序
          </div>
        </div>

        <div className="sort-info">
          <div className="sort-info-title">预览（按色相排序）：</div>
          <div className="sort-colors-preview">
            {sortedColors.map((color, index) => (
              <div
                key={index}
                className="sort-color-item"
                style={{ backgroundColor: color }}
              >
                {color}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {submitting ? '创建中...' : '✨ 创建配色方案'}
        </button>
      </form>
    </div>
  );
}
