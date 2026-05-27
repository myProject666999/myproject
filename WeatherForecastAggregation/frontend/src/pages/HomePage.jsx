import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { weatherApi } from '../services/api.js';
import WeatherCard from '../components/WeatherCard.jsx';
import AlertBanner from '../components/AlertBanner.jsx';

export default function HomePage() {
  const { favorites, loading, convertTemp, tempUnit, convertWindSpeed, windUnit, settings } = useApp();
  const [weatherData, setWeatherData] = useState({});
  const [dataLoading, setDataLoading] = useState(true);
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    async function loadWeather() {
      if (favorites.length === 0) {
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      const results = {};
      const allAlerts = [];

      for (const city of favorites) {
        try {
          const res = await weatherApi.getAll(city.id);
          if (res.data) {
            results[city.id] = res.data;
            if (res.data.alerts?.alerts?.length > 0 && settings.showAlerts === 'true') {
              res.data.alerts.alerts.forEach((alert) => {
                allAlerts.push({ ...alert, city: city.name, cityId: city.id });
              });
            }
          }
        } catch (err) {
          console.error(`[Home] Failed to load weather for ${city.name}:`, err);
        }
      }

      setWeatherData(results);
      setActiveAlerts(allAlerts);
      setDataLoading(false);
    }

    loadWeather();
  }, [favorites, settings.showAlerts]);

  const handleRefresh = async () => {
    setDataLoading(true);
    for (const city of favorites) {
      try {
        await weatherApi.refresh(city.id);
      } catch (err) {
        console.error(`[Home] Failed to refresh ${city.name}:`, err);
      }
    }
    const results = {};
    for (const city of favorites) {
      try {
        const res = await weatherApi.getAll(city.id);
        if (res.data) results[city.id] = res.data;
      } catch (err) {}
    }
    setWeatherData(results);
    setDataLoading(false);
  };

  if (loading || dataLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>正在加载天气数据...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🏙️</div>
        <h2>还没有收藏的城市</h2>
        <p>搜索并添加您关注的城市，即可在此查看天气预报</p>
        <Link to="/cities" className="btn btn-primary">
          添加城市
        </Link>
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>天气概览</h1>
        <button className="btn btn-secondary" onClick={handleRefresh}>
          🔄 刷新
        </button>
      </div>

      {activeAlerts.length > 0 && (
        <div className="alerts-section">
          {activeAlerts.map((alert, idx) => (
            <AlertBanner key={idx} alert={alert} />
          ))}
        </div>
      )}

      <div className="weather-grid">
        {favorites.map((city) => {
          const data = weatherData[city.id];
          return (
            <WeatherCard
              key={city.id}
              city={city}
              weatherData={data}
              convertTemp={convertTemp}
              tempUnit={tempUnit}
              convertWindSpeed={convertWindSpeed}
              windUnit={windUnit}
            />
          );
        })}
      </div>
    </div>
  );
}
