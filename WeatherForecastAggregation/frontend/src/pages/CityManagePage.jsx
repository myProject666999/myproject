import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { cityApi } from '../services/api.js';
import CitySearchResult from '../components/CitySearchResult.jsx';
import FavoriteItem from '../components/FavoriteItem.jsx';

export default function CityManagePage() {
  const { favorites, addFavorite, removeFavorite, isFavorite, loading } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [allCities, setAllCities] = useState([]);

  const loadAllCities = useCallback(async () => {
    try {
      const res = await cityApi.getAll();
      setAllCities(res.data || []);
    } catch (err) {
      console.error('[CityManage] Failed to load cities:', err);
    }
  }, []);

  useEffect(() => {
    loadAllCities();
  }, [loadAllCities]);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await cityApi.search(searchQuery.trim());
      setSearchResults(res.data || []);
    } catch (err) {
      console.error('[CityManage] Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleAddFavorite = async (city) => {
    try {
      await addFavorite(city.id);
    } catch (err) {
      console.error('[CityManage] Add favorite failed:', err);
    }
  };

  const handleRemoveFavorite = async (cityId) => {
    try {
      await removeFavorite(cityId);
    } catch (err) {
      console.error('[CityManage] Remove favorite failed:', err);
    }
  };

  const displayCities = searchQuery.trim() ? searchResults : allCities;

  return (
    <div className="city-manage-page">
      <div className="page-header">
        <h1>城市管理</h1>
      </div>

      <section className="favorites-section">
        <h2>我的收藏 ({favorites.length})</h2>
        {loading ? (
          <div className="loading-inline">
            <div className="loading-spinner small" />
            <span>加载中...</span>
          </div>
        ) : favorites.length === 0 ? (
          <div className="empty-inline">暂无收藏城市</div>
        ) : (
          <div className="favorites-list">
            {favorites.map((city) => (
              <FavoriteItem
                key={city.id}
                city={city}
                isFavorited={true}
                onRemove={handleRemoveFavorite}
              />
            ))}
          </div>
        )}
      </section>

      <section className="search-section">
        <h2>搜索城市</h2>
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="输入城市名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="search-clear" onClick={handleClearSearch}>
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary" disabled={searching}>
            {searching ? '搜索中...' : '搜索'}
          </button>
        </form>

        <div className="search-results">
          <h3>{searchQuery.trim() ? `搜索结果 (${searchResults.length})` : `全部城市 (${allCities.length})`}</h3>
          {displayCities.length === 0 ? (
            <div className="empty-inline">
              {searching ? '搜索中...' : '没有找到匹配的城市'}
            </div>
          ) : (
            <div className="city-grid">
              {displayCities.map((city) => (
                <CitySearchResult
                  key={city.id}
                  city={city}
                  isFavorited={isFavorite(city.id)}
                  onAdd={handleAddFavorite}
                  onRemove={handleRemoveFavorite}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
