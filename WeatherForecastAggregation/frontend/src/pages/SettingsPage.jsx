import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function SettingsPage() {
  const { settings, updateSettings } = useApp();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('[Settings] Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setSaved(false);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>设置</h1>
      </div>

      <div className="settings-content">
        <section className="settings-section">
          <h2>通用设置</h2>

          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">温度单位</label>
              <p className="setting-desc">选择显示温度的单位</p>
            </div>
            <div className="setting-control">
              <select
                className="setting-select"
                value={localSettings.temperatureUnit}
                onChange={(e) => handleChange('temperatureUnit', e.target.value)}
              >
                <option value="celsius">摄氏度 (°C)</option>
                <option value="fahrenheit">华氏度 (°F)</option>
              </select>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">风速单位</label>
              <p className="setting-desc">选择显示风速的单位</p>
            </div>
            <div className="setting-control">
              <select
                className="setting-select"
                value={localSettings.windSpeedUnit}
                onChange={(e) => handleChange('windSpeedUnit', e.target.value)}
              >
                <option value="kmh">公里/小时 (km/h)</option>
                <option value="mph">英里/小时 (mph)</option>
              </select>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>通知设置</h2>

          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">天气预警</label>
              <p className="setting-desc">在首页显示天气预警信息</p>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={localSettings.showAlerts === 'true'}
                  onChange={(e) => handleChange('showAlerts', String(e.target.checked))}
                />
                <span className="slider" />
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label className="setting-label">自动刷新</label>
              <p className="setting-desc">定时自动刷新收藏城市的天气数据</p>
            </div>
            <div className="setting-control">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={localSettings.autoRefresh === 'true'}
                  onChange={(e) => handleChange('autoRefresh', String(e.target.checked))}
                />
                <span className="slider" />
              </label>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>关于</h2>
          <div className="about-info">
            <p><strong>天气预报聚合</strong></p>
            <p>版本 1.0.0</p>
            <p className="about-desc">聚合多城市实时天气与生活指数，让您出行更便捷</p>
            <p className="about-small">数据每30分钟自动刷新 · 可手动刷新</p>
          </div>
        </section>

        <div className="settings-actions">
          <button className="btn btn-secondary" onClick={handleReset} disabled={saving}>
            重置
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : saved ? '已保存 ✓' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  );
}
