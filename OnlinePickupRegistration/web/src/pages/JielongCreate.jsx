import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJielong } from '../api/index.js';

const FIELD_TYPES = [
  { value: 'text', label: '单行文本' },
  { value: 'textarea', label: '多行文本' },
  { value: 'number', label: '数字' },
  { value: 'phone', label: '手机号' },
  { value: 'email', label: '邮箱' },
];

export default function JielongCreate() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creator, setCreator] = useState('');
  const [deadline, setDeadline] = useState('');
  const [fields, setFields] = useState([
    { key: 'name', label: '姓名', type: 'text' },
    { key: 'phone', label: '手机号', type: 'phone' },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const addField = () => {
    const newKey = 'field_' + Date.now().toString(36).slice(-4);
    setFields([...fields, { key: newKey, label: '', type: 'text' }]);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index, patch) => {
    setFields(
      fields.map((f, i) => (i === index ? { ...f, ...patch } : f))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('请输入接龙标题');
      return;
    }
    if (fields.length === 0) {
      alert('至少添加一个字段');
      return;
    }
    for (const f of fields) {
      if (!f.label.trim()) {
        alert('所有字段都必须填写字段名');
        return;
      }
    }
    setSubmitting(true);
    try {
      const jielong = await createJielong({
        title: title.trim(),
        description: description.trim(),
        creator: creator.trim() || '匿名',
        deadline: deadline || null,
        fields: fields.map((f) => ({
          key: f.key,
          label: f.label.trim(),
          type: f.type,
        })),
      });
      navigate(`/jielong/${jielong.id}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: 20, color: '#222' }}>创建接龙</h2>
      <form className="card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">接龙标题 *</label>
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例如：周末聚餐报名"
            maxLength={50}
          />
        </div>

        <div className="form-group">
          <label className="form-label">描述说明</label>
          <textarea
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请输入接龙的详细说明..."
            maxLength={500}
          />
        </div>

        <div className="form-group">
          <label className="form-label">创建人</label>
          <input
            className="form-input"
            value={creator}
            onChange={(e) => setCreator(e.target.value)}
            placeholder="输入你的昵称"
            maxLength={20}
          />
        </div>

        <div className="form-group">
          <label className="form-label">截止时间（可选）</label>
          <input
            className="form-input"
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            自定义字段 *
            <span style={{ fontWeight: 'normal', color: '#999', marginLeft: 8 }}>
              参与者需要填写的内容
            </span>
          </label>
          {fields.map((field, index) => (
            <div key={index} className="field-item">
              <input
                className="form-input"
                placeholder="字段名，如：姓名"
                value={field.label}
                onChange={(e) => updateField(index, { label: e.target.value })}
                maxLength={20}
              />
              <select
                className="form-select"
                value={field.type}
                onChange={(e) => updateField(index, { type: e.target.value })}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => removeField(index)}
              >
                删除
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-secondary btn-sm add-field-btn"
            onClick={addField}
          >
            + 添加字段
          </button>
        </div>

        <div className="btn-group" style={{ marginTop: 24 }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? '创建中...' : '创建接龙'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(-1)}
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
