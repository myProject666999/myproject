import React from 'react';
import { Link } from 'react-router-dom';

export default function FavoriteItem({ city, isFavorited, onRemove }) {
  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(city.id);
  };

  return (
    <Link to={`/city/${city.id}`} className="favorite-item">
      <div className="favorite-city-info">
        <span className="favorite-city-name">{city.name}</span>
        <span className="favorite-city-country">{city.country}{city.state ? ` · ${city.state}` : ''}</span>
      </div>
      <button
        className="favorite-remove-btn"
        onClick={handleRemove}
        title="取消收藏"
      >
        ✕
      </button>
    </Link>
  );
}
