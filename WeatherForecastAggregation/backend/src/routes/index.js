const express = require('express');
const {
  cityController,
  favoriteController,
  weatherController,
  settingsController
} = require('../controllers');

const router = express.Router();

router.get('/cities/search', cityController.searchCities);
router.get('/cities', cityController.getAllCities);
router.get('/cities/:id', cityController.getCityDetail);

router.get('/favorites', favoriteController.getFavorites);
router.post('/favorites', favoriteController.addFavorite);
router.delete('/favorites/:cityId', favoriteController.removeFavorite);

router.get('/weather/:cityId', weatherController.getCurrentWeather);
router.get('/weather/:cityId/forecast', weatherController.getForecast);
router.get('/weather/:cityId/indices', weatherController.getIndices);
router.get('/weather/:cityId/alerts', weatherController.getAlerts);
router.get('/weather/:cityId/all', weatherController.getAllWeather);
router.post('/weather/:cityId/refresh', weatherController.forceRefresh);

router.get('/settings', settingsController.getSettings);
router.put('/settings', settingsController.updateSettings);

module.exports = router;
