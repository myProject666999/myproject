const cityModel = require('../models/cityModel');
const weatherService = require('../services/weatherService');

const cityController = {
  async searchCities(req, res) {
    try {
      const { q } = req.query;
      if (!q || q.trim().length < 1) {
        return res.status(400).json({ error: '查询关键词不能为空' });
      }

      const cities = cityModel.searchCities(q.trim());
      res.json({ data: cities });
    } catch (err) {
      console.error('[City] Search error:', err);
      res.status(500).json({ error: '搜索城市失败' });
    }
  },

  async getAllCities(req, res) {
    try {
      const cities = cityModel.getAllCities();
      res.json({ data: cities });
    } catch (err) {
      console.error('[City] Get all error:', err);
      res.status(500).json({ error: '获取城市列表失败' });
    }
  },

  async getCityDetail(req, res) {
    try {
      const { id } = req.params;
      const city = cityModel.getCityById(id);
      if (!city) {
        return res.status(404).json({ error: '城市不存在' });
      }
      res.json({ data: city });
    } catch (err) {
      console.error('[City] Detail error:', err);
      res.status(500).json({ error: '获取城市详情失败' });
    }
  }
};

const favoriteController = {
  async getFavorites(req, res) {
    try {
      const favorites = cityModel.getFavorites();
      res.json({ data: favorites });
    } catch (err) {
      console.error('[Favorite] Get error:', err);
      res.status(500).json({ error: '获取收藏列表失败' });
    }
  },

  async addFavorite(req, res) {
    try {
      const { cityId } = req.body;
      if (!cityId) {
        return res.status(400).json({ error: '城市ID不能为空' });
      }

      const city = cityModel.getCityById(cityId);
      if (!city) {
        return res.status(404).json({ error: '城市不存在' });
      }

      const favorite = cityModel.addFavorite(cityId);
      res.json({ data: favorite, message: '已添加到收藏' });
    } catch (err) {
      console.error('[Favorite] Add error:', err);
      res.status(500).json({ error: '添加收藏失败' });
    }
  },

  async removeFavorite(req, res) {
    try {
      const { cityId } = req.params;
      cityModel.removeFavorite(cityId);
      res.json({ message: '已从收藏中移除' });
    } catch (err) {
      console.error('[Favorite] Remove error:', err);
      res.status(500).json({ error: '移除收藏失败' });
    }
  }
};

const weatherController = {
  async getCurrentWeather(req, res) {
    try {
      const { cityId } = req.params;
      const city = cityModel.getCityById(cityId);
      if (!city) {
        return res.status(404).json({ error: '城市不存在' });
      }

      const cached = await weatherService.getCachedWeather(cityId, 'current');
      if (cached) {
        return res.json({ data: cached, cached: true });
      }

      const weather = weatherService.generateCurrentWeather(city);
      await weatherService.setCachedWeather(cityId, 'current', weather);
      res.json({ data: weather, cached: false });
    } catch (err) {
      console.error('[Weather] Current error:', err);
      res.status(500).json({ error: '获取天气数据失败' });
    }
  },

  async getForecast(req, res) {
    try {
      const { cityId } = req.params;
      const { days = 7 } = req.query;
      const city = cityModel.getCityById(cityId);
      if (!city) {
        return res.status(404).json({ error: '城市不存在' });
      }

      const cached = await weatherService.getCachedWeather(cityId, `forecast:${days}`);
      if (cached) {
        return res.json({ data: cached, cached: true });
      }

      const forecast = weatherService.generateForecast(city, parseInt(days, 10));
      await weatherService.setCachedWeather(cityId, `forecast:${days}`, forecast);
      res.json({ data: forecast, cached: false });
    } catch (err) {
      console.error('[Weather] Forecast error:', err);
      res.status(500).json({ error: '获取预报数据失败' });
    }
  },

  async getIndices(req, res) {
    try {
      const { cityId } = req.params;
      const city = cityModel.getCityById(cityId);
      if (!city) {
        return res.status(404).json({ error: '城市不存在' });
      }

      const cached = await weatherService.getCachedWeather(cityId, 'indices');
      if (cached) {
        return res.json({ data: cached, cached: true });
      }

      const currentCached = await weatherService.getCachedWeather(cityId, 'current');
      const currentTemp = currentCached?.current?.temp;
      const indices = weatherService.generateIndices(city, currentTemp);
      await weatherService.setCachedWeather(cityId, 'indices', indices);
      res.json({ data: indices, cached: false });
    } catch (err) {
      console.error('[Weather] Indices error:', err);
      res.status(500).json({ error: '获取生活指数失败' });
    }
  },

  async getAlerts(req, res) {
    try {
      const { cityId } = req.params;
      const city = cityModel.getCityById(cityId);
      if (!city) {
        return res.status(404).json({ error: '城市不存在' });
      }

      const cached = await weatherService.getCachedWeather(cityId, 'alerts');
      if (cached) {
        return res.json({ data: cached, cached: true });
      }

      const alerts = weatherService.generateAlerts(city);
      await weatherService.setCachedWeather(cityId, 'alerts', alerts);
      res.json({ data: alerts, cached: false });
    } catch (err) {
      console.error('[Weather] Alerts error:', err);
      res.status(500).json({ error: '获取预警信息失败' });
    }
  },

  async getAllWeather(req, res) {
    try {
      const { cityId } = req.params;
      const city = cityModel.getCityById(cityId);
      if (!city) {
        return res.status(404).json({ error: '城市不存在' });
      }

      const [current, forecast, indices, alerts] = await Promise.all([
        weatherService.getCachedWeather(cityId, 'current').then(cached => {
          if (cached) return cached;
          const w = weatherService.generateCurrentWeather(city);
          weatherService.setCachedWeather(cityId, 'current', w);
          return w;
        }),
        weatherService.getCachedWeather(cityId, 'forecast:7').then(cached => {
          if (cached) return cached;
          const f = weatherService.generateForecast(city, 7);
          weatherService.setCachedWeather(cityId, 'forecast:7', f);
          return f;
        }),
        weatherService.getCachedWeather(cityId, 'indices').then(cached => {
          if (cached) return cached;
          const i = weatherService.generateIndices(city);
          weatherService.setCachedWeather(cityId, 'indices', i);
          return i;
        }),
        weatherService.getCachedWeather(cityId, 'alerts').then(cached => {
          if (cached) return cached;
          const a = weatherService.generateAlerts(city);
          weatherService.setCachedWeather(cityId, 'alerts', a);
          return a;
        })
      ]);

      res.json({
        data: { current, forecast, indices, alerts },
        city: { id: city.id, name: city.name, country: city.country }
      });
    } catch (err) {
      console.error('[Weather] All error:', err);
      res.status(500).json({ error: '获取全部天气数据失败' });
    }
  },

  async forceRefresh(req, res) {
    try {
      const { cityId } = req.params;
      const city = cityModel.getCityById(cityId);
      if (!city) {
        return res.status(404).json({ error: '城市不存在' });
      }

      const { cacheDel } = require('../config/redis');
      await cacheDel(`weather:${cityId}:current`);
      await cacheDel(`weather:${cityId}:forecast:7`);
      await cacheDel(`weather:${cityId}:indices`);
      await cacheDel(`weather:${cityId}:alerts`);

      res.json({ message: '缓存已刷新', cityId });
    } catch (err) {
      console.error('[Weather] Refresh error:', err);
      res.status(500).json({ error: '刷新缓存失败' });
    }
  }
};

const settingsController = {
  async getSettings(req, res) {
    try {
      const settings = cityModel.getSettings();
      res.json({ data: settings });
    } catch (err) {
      console.error('[Settings] Get error:', err);
      res.status(500).json({ error: '获取设置失败' });
    }
  },

  async updateSettings(req, res) {
    try {
      const { settings } = req.body;
      if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ error: '设置数据无效' });
      }

      const results = {};
      for (const [key, value] of Object.entries(settings)) {
        results[key] = cityModel.updateSetting(key, String(value));
      }

      res.json({ data: results, message: '设置已更新' });
    } catch (err) {
      console.error('[Settings] Update error:', err);
      res.status(500).json({ error: '更新设置失败' });
    }
  }
};

module.exports = {
  cityController,
  favoriteController,
  weatherController,
  settingsController
};
