const fetch = require('node-fetch');
const { cacheGet, cacheSet } = require('../config/redis');

const WEATHER_CODE_MAP = {
  0: { icon: '☀️', desc: '晴', code: 'clear' },
  1: { icon: '🌤️', desc: '大部分晴', code: 'mostly_clear' },
  2: { icon: '⛅', desc: '局部多云', code: 'partly_cloudy' },
  3: { icon: '☁️', desc: '阴', code: 'overcast' },
  45: { icon: '🌫️', desc: '雾', code: 'fog' },
  48: { icon: '🌫️', desc: '雾凇', code: 'rime_fog' },
  51: { icon: '🌦️', desc: '小毛毛雨', code: 'light_drizzle' },
  53: { icon: '🌦️', desc: '毛毛雨', code: 'drizzle' },
  55: { icon: '🌧️', desc: '大毛毛雨', code: 'heavy_drizzle' },
  61: { icon: '🌦️', desc: '小雨', code: 'light_rain' },
  63: { icon: '🌧️', desc: '中雨', code: 'moderate_rain' },
  65: { icon: '🌧️', desc: '大雨', code: 'heavy_rain' },
  66: { icon: '🌨️', desc: '冻雨', code: 'freezing_rain' },
  67: { icon: '🌨️', desc: '强冻雨', code: 'heavy_freezing_rain' },
  71: { icon: '🌨️', desc: '小雪', code: 'light_snow' },
  73: { icon: '🌨️', desc: '中雪', code: 'moderate_snow' },
  75: { icon: '❄️', desc: '大雪', code: 'heavy_snow' },
  77: { icon: '❄️', desc: '雪粒', code: 'snow_grains' },
  80: { icon: '🌦️', desc: '小阵雨', code: 'light_showers' },
  81: { icon: '🌧️', desc: '阵雨', code: 'showers' },
  82: { icon: '⛈️', desc: '强阵雨', code: 'heavy_showers' },
  85: { icon: '🌨️', desc: '小阵雪', code: 'light_snow_showers' },
  86: { icon: '🌨️', desc: '强阵雪', code: 'heavy_snow_showers' },
  95: { icon: '⛈️', desc: '雷暴', code: 'thunderstorm' },
  96: { icon: '⛈️', desc: '雷暴伴小冰雹', code: 'thunderstorm_hail' },
  99: { icon: '⛈️', desc: '雷暴伴大冰雹', code: 'thunderstorm_heavy_hail' }
};

const WIND_DIRECTION_MAP = [
  '北', '东北偏北', '东北', '东北偏东',
  '东', '东南偏东', '东南', '东南偏南',
  '南', '西南偏南', '西南', '西南偏西',
  '西', '西北偏西', '西北', '西北偏北'
];

const CLOTHING_ADVICE = [
  { range: [-50, 0], advice: '羽绒服、厚棉衣、保暖内衣', level: '寒冷' },
  { range: [0, 5], advice: '棉衣、毛呢大衣、厚毛衣', level: '严寒' },
  { range: [5, 10], advice: '厚外套、毛衣、长裤', level: '冷' },
  { range: [10, 15], advice: '风衣、夹克、薄毛衣', level: '较冷' },
  { range: [15, 20], advice: '长袖衬衫、薄外套', level: '舒适' },
  { range: [20, 25], advice: '短袖、薄长裤', level: '舒适' },
  { range: [25, 30], advice: '短袖、短裤、凉鞋', level: '热' },
  { range: [30, 50], advice: '背心、短裤、注意防暑', level: '炎热' }
];

let rawWeatherCache = new Map();

function getWeatherInfo(code) {
  return WEATHER_CODE_MAP[code] || { icon: '🌡️', desc: '未知', code: 'unknown' };
}

function getWindDirection(degrees) {
  const index = Math.round(degrees / 22.5) % 16;
  return WIND_DIRECTION_MAP[index];
}

function getClothingAdvice(temp) {
  for (const item of CLOTHING_ADVICE) {
    if (temp >= item.range[0] && temp < item.range[1]) {
      return { level: item.level, advice: item.advice };
    }
  }
  return { level: '舒适', advice: '长袖衬衫' };
}

function getSportAdvice(weatherCode, windSpeed, temp) {
  if (weatherCode >= 95) return { level: '不宜', advice: '有雷暴，建议室内运动' };
  if (weatherCode >= 61 && weatherCode <= 67) return { level: '不宜', advice: '有雨，建议室内运动' };
  if (weatherCode >= 71 && weatherCode <= 77) return { level: '不宜', advice: '有雪，建议室内运动' };
  if (windSpeed > 30) return { level: '较适宜', advice: '风力较大，注意安全' };
  if (temp > 35) return { level: '不宜', advice: '高温天气，避免户外运动' };
  if (temp < 0) return { level: '较适宜', advice: '气温较低，注意保暖' };
  return { level: '适宜', advice: '天气晴好，适合户外运动' };
}

function getUVAdvice(uvIndex) {
  if (uvIndex <= 2) return { level: '最弱', advice: '无需防护' };
  if (uvIndex <= 5) return { level: '弱', advice: '涂抹防晒霜' };
  if (uvIndex <= 7) return { level: '中等', advice: '涂抹防晒霜，戴太阳镜' };
  if (uvIndex <= 10) return { level: '强', advice: '尽量避免户外活动' };
  return { level: '很强', advice: '避免外出，必须外出时做好防护' };
}

function getAirQualityAdvice() {
  const levels = [
    { level: '优', advice: '空气质量极佳' },
    { level: '良', advice: '空气质量良好' },
    { level: '轻度污染', advice: '敏感人群减少外出' },
    { level: '中度污染', advice: '建议佩戴口罩' }
  ];
  return levels[Math.floor(Math.random() * levels.length)];
}

function getComfortAdvice(temp, humidity) {
  if (temp >= 30 && humidity > 70) return { level: '不舒适', advice: '天气闷热，注意防暑' };
  if (temp >= 35) return { level: '不舒适', advice: '天气炎热，注意防暑降温' };
  if (temp <= 0) return { level: '较舒适', advice: '天气寒冷，注意保暖' };
  if (humidity > 80) return { level: '较舒适', advice: '湿度较高，注意防潮' };
  return { level: '舒适', advice: '天气舒适，适合外出' };
}

function calculateUVIndex(weatherCode, month) {
  const baseUV = [2, 3, 5, 7, 9, 10, 10, 9, 7, 5, 3, 2];
  let uv = baseUV[month - 1] || 5;

  if (weatherCode >= 45 && weatherCode <= 48) uv = Math.max(1, uv - 3);
  else if (weatherCode >= 51 && weatherCode <= 67) uv = Math.max(1, uv - 4);
  else if (weatherCode >= 71 && weatherCode <= 82) uv = Math.max(1, uv - 3);
  else if (weatherCode >= 2 && weatherCode <= 3) uv = Math.max(1, uv - 2);

  return Math.max(1, Math.min(11, uv));
}

function generateAlertsFromWeather(current, forecast) {
  const alerts = [];
  const now = new Date();

  if (current.temp <= -5) {
    alerts.push({
      type: '寒潮',
      severity: 'warning',
      title: '寒潮预警',
      message: `气温较低（${current.temp}°C），请注意防寒保暖`,
      expiry: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    });
  }

  if (current.temp >= 35) {
    alerts.push({
      type: '高温',
      severity: 'watch',
      title: '高温预警',
      message: `气温较高（${current.temp}°C），注意防暑降温`,
      expiry: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString()
    });
  }

  if (current.weatherCode >= 61 && current.weatherCode <= 65) {
    alerts.push({
      type: '暴雨',
      severity: 'warning',
      title: '暴雨预警',
      message: '有强降雨，请注意防范',
      expiry: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString()
    });
  }

  if (current.wind.speed >= 30) {
    alerts.push({
      type: '大风',
      severity: 'advisory',
      title: '大风预警',
      message: `风力较大（${current.wind.speed} km/h），请注意安全`,
      expiry: new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString()
    });
  }

  if (current.weatherCode >= 95) {
    alerts.push({
      type: '雷暴',
      severity: 'warning',
      title: '雷暴预警',
      message: '有雷暴天气，请勿在户外活动',
      expiry: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString()
    });
  }

  if (current.weatherCode >= 71 && current.weatherCode <= 75) {
    alerts.push({
      type: '暴雪',
      severity: 'warning',
      title: '暴雪预警',
      message: '有强降雪，请注意出行安全',
      expiry: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString()
    });
  }

  if (forecast && forecast.length > 0) {
    const futureHeavyRain = forecast.some(d => d.weatherCode >= 61 && d.weatherCode <= 65 && d.precipitation >= 50);
    if (futureHeavyRain && !alerts.some(a => a.type === '暴雨')) {
      alerts.push({
        type: '暴雨',
        severity: 'watch',
        title: '暴雨预报',
        message: '未来几天有强降雨可能，请注意防范',
        expiry: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString()
      });
    }

    const futureColdWave = forecast.some(d => d.low <= -5);
    if (futureColdWave && !alerts.some(a => a.type === '寒潮')) {
      alerts.push({
        type: '寒潮',
        severity: 'watch',
        title: '寒潮预报',
        message: '未来几天气温将大幅下降，请注意保暖',
        expiry: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  return alerts;
}

async function fetchRawWeatherData(lat, lon) {
  const cacheKey = `raw_weather:${lat}:${lon}`;
  const cached = rawWeatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 30000) {
    return cached.data;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,surface_pressure,cloud_cover&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,relative_humidity_2m_mean,sunrise,sunset&timezone=auto&forecast_days=7`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    const data = await response.json();
    
    rawWeatherCache.set(cacheKey, { data, timestamp: Date.now() });
    if (rawWeatherCache.size > 50) {
      rawWeatherCache.clear();
    }
    
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('[WeatherService] Fetch error:', err.message);
    throw err;
  }
}

async function generateCurrentWeather(city) {
  try {
    const data = await fetchRawWeatherData(city.lat, city.lon);
    const current = data.current;
    const weatherInfo = getWeatherInfo(current.weather_code);
    const month = new Date().getMonth() + 1;
    const uvIndex = calculateUVIndex(current.weather_code, month);

    const sunrise = data.daily?.sunrise?.[0]?.split('T')[1] || '06:00';
    const sunset = data.daily?.sunset?.[0]?.split('T')[1] || '18:00';

    return {
      city: { id: city.id, name: city.name, country: city.country },
      current: {
        temp: Math.round(current.temperature_2m),
        feels_like: Math.round(current.apparent_temperature),
        condition: weatherInfo.desc,
        icon: weatherInfo.icon,
        code: weatherInfo.code,
        humidity: current.relative_humidity_2m,
        wind: {
          speed: Math.round(current.wind_speed_10m),
          direction: getWindDirection(current.wind_direction_10m)
        },
        pressure: Math.round(current.pressure_msl || current.surface_pressure || 1013),
        visibility: 10,
        uv_index: uvIndex,
        sunrise,
        sunset,
        weather_code: current.weather_code,
        updated_at: new Date().toISOString()
      }
    };
  } catch (err) {
    console.error('[WeatherService] Failed to generate current weather:', err);
    throw err;
  }
}

async function generateForecast(city, days = 7) {
  try {
    const data = await fetchRawWeatherData(city.lat, city.lon);
    const forecast = [];

    if (data.daily) {
      for (let i = 0; i < Math.min(days, data.daily.time.length); i++) {
        const date = new Date(data.daily.time[i]);
        const weatherInfo = getWeatherInfo(data.daily.weather_code[i]);

        forecast.push({
          date: data.daily.time[i],
          day_of_week: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
          high: Math.round(data.daily.temperature_2m_max[i]),
          low: Math.round(data.daily.temperature_2m_min[i]),
          condition: weatherInfo.desc,
          icon: weatherInfo.icon,
          code: weatherInfo.code,
          weather_code: data.daily.weather_code[i],
          precipitation: data.daily.precipitation_probability_max[i] || Math.round((data.daily.precipitation_sum[i] || 0) * 10),
          wind_speed: Math.round(data.daily.wind_speed_10m_max[i] || 0),
          humidity: Math.round(data.daily.relative_humidity_2m_mean[i] || 50)
        });
      }
    }

    return {
      city: { id: city.id, name: city.name, country: city.country },
      forecast,
      updated_at: new Date().toISOString()
    };
  } catch (err) {
    console.error('[WeatherService] Failed to generate forecast:', err);
    throw err;
  }
}

async function generateIndices(city, currentTemp) {
  try {
    const data = await fetchRawWeatherData(city.lat, city.lon);
    const current = data.current;
    const temp = currentTemp !== undefined ? currentTemp : Math.round(current.temperature_2m);
    const weatherCode = current.weather_code;
    const windSpeed = Math.round(current.wind_speed_10m);
    const humidity = current.relative_humidity_2m;
    const month = new Date().getMonth() + 1;
    const uvIndex = calculateUVIndex(weatherCode, month);

    const clothing = getClothingAdvice(temp);
    const sport = getSportAdvice(weatherCode, windSpeed, temp);
    const uv = getUVAdvice(uvIndex);
    const air = getAirQualityAdvice();
    const comfort = getComfortAdvice(temp, humidity);

    return {
      city: { id: city.id, name: city.name, country: city.country },
      indices: [
        {
          type: 'clothing',
          name: '穿衣指数',
          level: clothing.level,
          advice: clothing.advice,
          icon: '👔'
        },
        {
          type: 'sport',
          name: '运动指数',
          level: sport.level,
          advice: sport.advice,
          icon: '🏃'
        },
        {
          type: 'uv',
          name: '紫外线指数',
          level: uv.level,
          advice: uv.advice,
          icon: '☀️'
        },
        {
          type: 'air',
          name: '空气指数',
          level: air.level,
          advice: air.advice,
          icon: '💨'
        },
        {
          type: 'comfort',
          name: '舒适度',
          level: comfort.level,
          advice: comfort.advice,
          icon: '😊'
        }
      ],
      updated_at: new Date().toISOString()
    };
  } catch (err) {
    console.error('[WeatherService] Failed to generate indices:', err);
    throw err;
  }
}

async function generateAlerts(city) {
  try {
    const data = await fetchRawWeatherData(city.lat, city.lon);
    const current = {
      temp: Math.round(data.current.temperature_2m),
      weatherCode: data.current.weather_code,
      wind: { speed: Math.round(data.current.wind_speed_10m) }
    };

    const forecast = data.daily ? data.daily.time.map((_, i) => ({
      low: Math.round(data.daily.temperature_2m_min[i]),
      high: Math.round(data.daily.temperature_2m_max[i]),
      weatherCode: data.daily.weather_code[i],
      precipitation: data.daily.precipitation_probability_max[i] || 0
    })) : [];

    const alerts = generateAlertsFromWeather(current, forecast);

    return {
      city: { id: city.id, name: city.name, country: city.country },
      alerts,
      updated_at: new Date().toISOString()
    };
  } catch (err) {
    console.error('[WeatherService] Failed to generate alerts:', err);
    return {
      city: { id: city.id, name: city.name, country: city.country },
      alerts: [],
      updated_at: new Date().toISOString()
    };
  }
}

async function getAllWeather(city) {
  try {
    const data = await fetchRawWeatherData(city.lat, city.lon);
    const currentData = data.current;
    const weatherInfo = getWeatherInfo(currentData.weather_code);
    const month = new Date().getMonth() + 1;
    const uvIndex = calculateUVIndex(currentData.weather_code, month);

    const sunrise = data.daily?.sunrise?.[0]?.split('T')[1] || '06:00';
    const sunset = data.daily?.sunset?.[0]?.split('T')[1] || '18:00';

    const temp = Math.round(currentData.temperature_2m);
    const weatherCode = currentData.weather_code;
    const windSpeed = Math.round(currentData.wind_speed_10m);
    const humidity = currentData.relative_humidity_2m;

    const current = {
      city: { id: city.id, name: city.name, country: city.country },
      current: {
        temp,
        feels_like: Math.round(currentData.apparent_temperature),
        condition: weatherInfo.desc,
        icon: weatherInfo.icon,
        code: weatherInfo.code,
        humidity,
        wind: {
          speed: windSpeed,
          direction: getWindDirection(currentData.wind_direction_10m)
        },
        pressure: Math.round(currentData.pressure_msl || currentData.surface_pressure || 1013),
        visibility: 10,
        uv_index: uvIndex,
        sunrise,
        sunset,
        weather_code: weatherCode,
        updated_at: new Date().toISOString()
      }
    };

    const forecastList = [];
    if (data.daily) {
      for (let i = 0; i < Math.min(7, data.daily.time.length); i++) {
        const date = new Date(data.daily.time[i]);
        const dayWeatherInfo = getWeatherInfo(data.daily.weather_code[i]);

        forecastList.push({
          date: data.daily.time[i],
          day_of_week: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
          high: Math.round(data.daily.temperature_2m_max[i]),
          low: Math.round(data.daily.temperature_2m_min[i]),
          condition: dayWeatherInfo.desc,
          icon: dayWeatherInfo.icon,
          code: dayWeatherInfo.code,
          weather_code: data.daily.weather_code[i],
          precipitation: data.daily.precipitation_probability_max[i] || Math.round((data.daily.precipitation_sum[i] || 0) * 10),
          wind_speed: Math.round(data.daily.wind_speed_10m_max[i] || 0),
          humidity: Math.round(data.daily.relative_humidity_2m_mean[i] || 50)
        });
      }
    }

    const forecast = {
      city: { id: city.id, name: city.name, country: city.country },
      forecast: forecastList,
      updated_at: new Date().toISOString()
    };

    const clothing = getClothingAdvice(temp);
    const sport = getSportAdvice(weatherCode, windSpeed, temp);
    const uv = getUVAdvice(uvIndex);
    const air = getAirQualityAdvice();
    const comfort = getComfortAdvice(temp, humidity);

    const indices = {
      city: { id: city.id, name: city.name, country: city.country },
      indices: [
        { type: 'clothing', name: '穿衣指数', level: clothing.level, advice: clothing.advice, icon: '👔' },
        { type: 'sport', name: '运动指数', level: sport.level, advice: sport.advice, icon: '🏃' },
        { type: 'uv', name: '紫外线指数', level: uv.level, advice: uv.advice, icon: '☀️' },
        { type: 'air', name: '空气指数', level: air.level, advice: air.advice, icon: '💨' },
        { type: 'comfort', name: '舒适度', level: comfort.level, advice: comfort.advice, icon: '😊' }
      ],
      updated_at: new Date().toISOString()
    };

    const currentForAlerts = { temp, weatherCode, wind: { speed: windSpeed } };
    const forecastForAlerts = forecastList;
    const alertList = generateAlertsFromWeather(currentForAlerts, forecastForAlerts);

    const alerts = {
      city: { id: city.id, name: city.name, country: city.country },
      alerts: alertList,
      updated_at: new Date().toISOString()
    };

    return { current, forecast, indices, alerts };
  } catch (err) {
    console.error('[WeatherService] Failed to get all weather:', err);
    throw err;
  }
}

async function getCachedWeather(cityId, type) {
  const key = `weather:${cityId}:${type}`;
  return await cacheGet(key);
}

async function setCachedWeather(cityId, type, data) {
  const key = `weather:${cityId}:${type}`;
  const ttl = parseInt(process.env.CACHE_TTL || '1800', 10);
  await cacheSet(key, data, ttl);
}

module.exports = {
  generateCurrentWeather,
  generateForecast,
  generateIndices,
  generateAlerts,
  getAllWeather,
  getCachedWeather,
  setCachedWeather
};
