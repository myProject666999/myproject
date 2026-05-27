import React from 'react';
import { Link } from 'react-router-dom';

export default function WeatherCard({ city, weatherData, convertTemp, tempUnit, convertWindSpeed, windUnit }) {
  if (!weatherData) {
    return (
      <div className="weather-card skeleton">
        <div className="skeleton-header" />
        <div className="skeleton-body" />
      </div>
    );
  }

  const current = weatherData.current?.current;
  const forecast = weatherData.forecast?.forecast || [];
  const alerts = weatherData.alerts?.alerts || [];

  return (
    <Link to={`/city/${city.id}`} className="weather-card">
      {alerts.length > 0 && (
        <div className="card-alert-badge">
          ⚠️ {alerts.length}
        </div>
      )}
      <div className="card-header">
        <h3 className="card-city-name">{city.name}</h3>
        <span className="card-city-country">{city.country}</span>
      </div>

      {current && (
        <div className="card-weather">
          <div className="card-temp">
            <span className="card-temp-value">{convertTemp(current.temp)}</span>
            <span className="card-temp-unit">{tempUnit}</span>
          </div>
          <div className="card-condition">
            <span className="card-condition-icon">{current.icon}</span>
            <span className="card-condition-text">{current.condition}</span>
          </div>
        </div>
      )}

      {forecast.length >= 2 && (
        <div className="card-forecast-mini">
          {forecast.slice(0, 3).map((day, idx) => (
            <div key={idx} className="forecast-mini-item">
              <span className="forecast-mini-day">{day.day_of_week}</span>
              <span className="forecast-mini-icon">{day.icon}</span>
              <span className="forecast-mini-temp">
                {convertTemp(day.high)}° / {convertTemp(day.low)}°
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="card-footer">
        {current && (
          <>
            <span className="card-footer-item">💧 {current.humidity}%</span>
            <span className="card-footer-item">💨 {convertWindSpeed(current.wind.speed)} {windUnit}</span>
          </>
        )}
      </div>
    </Link>
  );
}
