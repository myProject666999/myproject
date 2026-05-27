import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { weatherApi, cityApi } from '../services/api.js';

export default function DetailPage() {
  const { cityId } = useParams();
  const { convertTemp, tempUnit, convertWindSpeed, windUnit, isFavorite, addFavorite, removeFavorite } = useApp();
  const [city, setCity] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cityRes, weatherRes] = await Promise.all([
          cityApi.getById(cityId),
          weatherApi.getAll(cityId)
        ]);

        setCity(cityRes.data);
        setWeather(weatherRes.data);
        setFavorited(isFavorite(parseInt(cityId, 10)));
      } catch (err) {
        console.error('[Detail] Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [cityId]);

  useEffect(() => {
    setFavorited(isFavorite(parseInt(cityId, 10)));
  }, [isFavorite, cityId]);

  const handleToggleFavorite = async () => {
    try {
      if (favorited) {
        await removeFavorite(cityId);
        setFavorited(false);
      } else {
        await addFavorite(cityId);
        setFavorited(true);
      }
    } catch (err) {
      console.error('[Detail] Toggle favorite failed:', err);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await weatherApi.refresh(cityId);
      const res = await weatherApi.getAll(cityId);
      setWeather(res.data);
    } catch (err) {
      console.error('[Detail] Refresh failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>加载中...</p>
      </div>
    );
  }

  if (!city || !weather) {
    return (
      <div className="empty-state">
        <div className="empty-icon">😕</div>
        <h2>数据加载失败</h2>
        <Link to="/" className="btn btn-primary">返回首页</Link>
      </div>
    );
  }

  const current = weather.current?.current;
  const forecast = weather.forecast?.forecast || [];
  const indices = weather.indices?.indices || [];
  const alerts = weather.alerts?.alerts || [];

  return (
    <div className="detail-page">
      <div className="detail-header">
        <Link to="/" className="back-link">← 返回</Link>
        <div className="header-info">
          <h1>{city.name}</h1>
          <p className="header-sub">{city.country}{city.state ? ` · ${city.state}` : ''}</p>
        </div>
        <div className="header-actions">
          <button
            className={`btn ${favorited ? 'btn-danger' : 'btn-primary'}`}
            onClick={handleToggleFavorite}
          >
            {favorited ? '★ 已收藏' : '☆ 收藏'}
          </button>
          <button className="btn btn-secondary" onClick={handleRefresh}>
            🔄 刷新
          </button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="alerts-section">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`alert-banner alert-${alert.severity}`}>
              <span className="alert-icon">⚠️</span>
              <div className="alert-content">
                <span className="alert-title">{alert.title}</span>
                <span className="alert-message">{alert.message}</span>
                {alert.expiry && (
                  <span className="alert-expiry">有效期至: {new Date(alert.expiry).toLocaleString('zh-CN')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="current-weather-card detail">
        <div className="current-weather-main">
          <div className="current-temp">
            <span className="temp-value">{convertTemp(current.temp)}</span>
            <span className="temp-unit">{tempUnit}</span>
          </div>
          <div className="current-condition">
            <span className="condition-icon">{current.icon}</span>
            <span className="condition-text">{current.condition}</span>
          </div>
          <div className="current-feels">
            体感 {convertTemp(current.feels_like)}{tempUnit}
          </div>
        </div>

        <div className="current-weather-details">
          <div className="detail-item">
            <span className="detail-label">💧 湿度</span>
            <span className="detail-value">{current.humidity}%</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">💨 风速</span>
            <span className="detail-value">{convertWindSpeed(current.wind.speed)} {windUnit}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">🧭 风向</span>
            <span className="detail-value">{current.wind.direction}风</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">📊 气压</span>
            <span className="detail-value">{current.pressure} hPa</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">👁️ 能见度</span>
            <span className="detail-value">{current.visibility} km</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">☀️ 紫外线</span>
            <span className="detail-value">{current.uv_index}</span>
          </div>
        </div>

        <div className="sun-times">
          <div className="sun-item">
            <span className="sun-icon">🌅</span>
            <span className="sun-label">日出</span>
            <span className="sun-time">{current.sunrise}</span>
          </div>
          <div className="sun-item">
            <span className="sun-icon">🌇</span>
            <span className="sun-label">日落</span>
            <span className="sun-time">{current.sunset}</span>
          </div>
        </div>
      </div>

      <section className="forecast-section">
        <h2>7天预报</h2>
        <div className="forecast-list">
          {forecast.map((day, idx) => (
            <div key={idx} className="forecast-item">
              <div className="forecast-date">
                <span className="forecast-day">{day.day_of_week}</span>
                <span className="forecast-date-text">{day.date}</span>
              </div>
              <div className="forecast-icon">{day.icon}</div>
              <div className="forecast-condition">{day.condition}</div>
              <div className="forecast-temp">
                <span className="temp-high">{convertTemp(day.high)}°</span>
                <span className="temp-sep">/</span>
                <span className="temp-low">{convertTemp(day.low)}°</span>
              </div>
              <div className="forecast-extra">
                <span>💧{day.humidity}%</span>
                <span>🌧️{day.precipitation}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="indices-section">
        <h2>生活指数</h2>
        <div className="indices-grid">
          {indices.map((index, idx) => (
            <div key={idx} className="index-card">
              <div className="index-header">
                <span className="index-icon">{index.icon}</span>
                <span className="index-name">{index.name}</span>
              </div>
              <div className={`index-level level-${index.level}`}>{index.level}</div>
              <div className="index-advice">{index.advice}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
