import React from 'react';
import { Link } from 'react-router-dom';

export default function CitySearchResult({ city, isFavorited, onAdd, onRemove }) {
  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorited) {
      onRemove(city.id);
    } else {
      onAdd(city);
    }
  };

  return (
    <Link to={`/city/${city.id}`} className="city-search-result">
      <div className="city-info">
        <h4 className="city-name">{city.name}</h4>
        <span className="city-details">
          {city.country}{city.state ? ` · ${city.state}` : ''}
        </span>
      </div>
      <button
        className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
        onClick={handleFavoriteClick}
      >
        {isFavorited ? '★' : '☆'}
      </button>
    </Link>
  );
}
