import React, { useState, useEffect } from 'react';
import { settingsApi } from '../api/index.js';

export default function Settings({ siteName, onSiteNameChange }) {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await settingsApi.get();
      setSettings(res.data);
    } catch (err) {
      console.error('加载设置失败:', err);
    }
  };

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await settingsApi.update(settings);
      if (settings.site_name) {
        onSiteNameChange(settings.site_name);
        document.title = settings.site_name;
      }
      setMessage('设置保存成功！');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('保存失败: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">系统设置</h1>
      </div>

      {message && (
        <div className={`alert ${message.includes('成功') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">基本设置</div>
        </div>
        <div className="settings-form">
          <div className="form-group">
            <label className="form-label">站点名称</label>
            <input
              type="text"
              className="form-control"
              value={settings.site_name || ''}
              onChange={(e) => handleChange('site_name', e.target.value)}
              placeholder="请输入站点名称"
            />
          </div>
          <div className="form-group">
            <label className="form-label">系统描述</label>
            <textarea
              className="form-control"
              style={{ minHeight: '80px', resize: 'vertical' }}
              value={settings.site_description || ''}
              onChange={(e) => handleChange('site_description', e.target.value)}
              placeholder="请输入系统描述"
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">关于系统</div>
        </div>
        <div style={{ color: '#606266', fontSize: '14px', lineHeight: '1.8' }}>
          <p><strong>在线表单收集工具</strong></p>
          <p>版本: 1.0.0</p>
          <p>一个轻量级的表单数据收集平台，支持拖拽创建表单、设置校验规则、限制提交次数、导出 CSV/Excel 等功能。</p>
          <p>技术栈: Node.js (Express) + React + SQLite</p>
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '保存中...' : '保存设置'}
        </button>
      </div>
    </div>
  );
}
