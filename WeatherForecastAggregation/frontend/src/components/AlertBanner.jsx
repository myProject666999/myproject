import React from 'react';

export default function AlertBanner({ alert }) {
  const severityColors = {
    warning: 'alert-warning',
    watch: 'alert-watch',
    advisory: 'alert-advisory'
  };

  return (
    <div className={`alert-banner ${severityColors[alert.severity] || 'alert-warning'}`}>
      <span className="alert-icon">⚠️</span>
      <div className="alert-content">
        <span className="alert-title">{alert.title || alert.type}</span>
        <span className="alert-city">📍 {alert.city}</span>
        <span className="alert-message">{alert.message}</span>
        {alert.expiry && (
          <span className="alert-expiry">
            有效期至: {new Date(alert.expiry).toLocaleString('zh-CN')}
          </span>
        )}
      </div>
    </div>
  );
}
