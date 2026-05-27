import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { favoriteApi, settingsApi } from '../services/api.js';

const AppContext = createContext(null);

const DEFAULT_SETTINGS = {
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
  showAlerts: 'true',
  autoRefresh: 'true'
};

export function AppProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState({});

  const loadFavorites = useCallback(async () => {
    try {
      const res = await favoriteApi.getAll();
      setFavorites(res.data || []);
    } catch (err) {
      console.error('[Context] Failed to load favorites:', err);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      const res = await settingsApi.get();
      const loadedSettings = { ...DEFAULT_SETTINGS, ...(res.data || {}) };
      setSettings(loadedSettings);
    } catch (err) {
      console.error('[Context] Failed to load settings:', err);
    }
  }, []);

  const addFavorite = useCallback(async (cityId) => {
    try {
      const res = await favoriteApi.add(cityId);
      await loadFavorites();
      return res;
    } catch (err) {
      console.error('[Context] Failed to add favorite:', err);
      throw err;
    }
  }, [loadFavorites]);

  const removeFavorite = useCallback(async (cityId) => {
    try {
      const res = await favoriteApi.remove(cityId);
      await loadFavorites();
      return res;
    } catch (err) {
      console.error('[Context] Failed to remove favorite:', err);
      throw err;
    }
  }, [loadFavorites]);

  const isFavorite = useCallback((cityId) => {
    return favorites.some((f) => f.id === cityId);
  }, [favorites]);

  const updateSettings = useCallback(async (newSettings) => {
    try {
      const merged = { ...settings, ...newSettings };
      setSettings(merged);
      await settingsApi.update(merged);
      return merged;
    } catch (err) {
      console.error('[Context] Failed to update settings:', err);
      throw err;
    }
  }, [settings]);

  const convertTemp = useCallback((temp) => {
    if (settings.temperatureUnit === 'fahrenheit') {
      return Math.round((temp * 9 / 5) + 32);
    }
    return temp;
  }, [settings.temperatureUnit]);

  const tempUnit = settings.temperatureUnit === 'fahrenheit' ? '°F' : '°C';
  const windUnit = settings.windSpeedUnit === 'mph' ? 'mph' : 'km/h';

  const convertWindSpeed = useCallback((speedKmh) => {
    if (settings.windSpeedUnit === 'mph') {
      return Math.round(speedKmh * 0.621371);
    }
    return speedKmh;
  }, [settings.windSpeedUnit]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.all([loadFavorites(), loadSettings()]);
      setLoading(false);
    }
    init();
  }, [loadFavorites, loadSettings]);

  return (
    <AppContext.Provider value={{
      favorites,
      settings,
      loading,
      alerts,
      setAlerts,
      addFavorite,
      removeFavorite,
      isFavorite,
      updateSettings,
      convertTemp,
      tempUnit,
      convertWindSpeed,
      windUnit,
      refreshFavorites: loadFavorites
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
