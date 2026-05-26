CREATE DATABASE IF NOT EXISTS air_quality_dashboard
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE air_quality_dashboard;

CREATE TABLE IF NOT EXISTS cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  province VARCHAR(100),
  country VARCHAR(100) DEFAULT '中国',
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  is_monitored TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS aqi_records (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  aqi INT NOT NULL,
  aqi_level VARCHAR(50) NOT NULL,
  primary_pollutant VARCHAR(100),
  pm25 DECIMAL(10, 2),
  pm10 DECIMAL(10, 2),
  so2 DECIMAL(10, 2),
  no2 DECIMAL(10, 2),
  co DECIMAL(10, 3),
  o3 DECIMAL(10, 2),
  temperature DECIMAL(5, 2),
  humidity DECIMAL(5, 2),
  wind_direction VARCHAR(50),
  wind_speed DECIMAL(5, 2),
  record_time DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
  INDEX idx_city_time (city_id, record_time),
  INDEX idx_record_time (record_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS aqi_trends (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  trend_date DATE NOT NULL,
  avg_aqi DECIMAL(10, 2),
  max_aqi INT,
  min_aqi INT,
  avg_pm25 DECIMAL(10, 2),
  avg_pm10 DECIMAL(10, 2),
  avg_so2 DECIMAL(10, 2),
  avg_no2 DECIMAL(10, 2),
  avg_co DECIMAL(10, 3),
  avg_o3 DECIMAL(10, 2),
  dominant_pollutant VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
  UNIQUE KEY uk_city_date (city_id, trend_date),
  INDEX idx_trend_date (trend_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS alerts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  alert_type VARCHAR(50) NOT NULL,
  alert_level VARCHAR(20) NOT NULL,
  threshold_value INT,
  current_value INT,
  message TEXT NOT NULL,
  is_resolved TINYINT(1) DEFAULT 0,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
  INDEX idx_city_alert (city_id, created_at),
  INDEX idx_is_resolved (is_resolved)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL,
  setting_value TEXT NOT NULL,
  description VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO cities (name, province, country, latitude, longitude, is_monitored) VALUES
('北京', '北京市', '中国', 39.9042000, 116.4074000, 1),
('上海', '上海市', '中国', 31.2304000, 121.4737000, 1),
('广州', '广东省', '中国', 23.1291000, 113.2644000, 1),
('深圳', '广东省', '中国', 22.5431000, 114.0579000, 1),
('成都', '四川省', '中国', 30.5728000, 104.0668000, 1),
('杭州', '浙江省', '中国', 30.2741000, 120.1551000, 1),
('武汉', '湖北省', '中国', 30.5928000, 114.3055000, 1),
('西安', '陕西省', '中国', 34.3416000, 108.9398000, 1),
('重庆', '重庆市', '中国', 29.4316000, 106.9123000, 1),
('南京', '江苏省', '中国', 32.0603000, 118.7969000, 1),
('天津', '天津市', '中国', 39.3434000, 117.3616000, 1),
('苏州', '江苏省', '中国', 31.2989000, 120.5853000, 1),
('郑州', '河南省', '中国', 34.7466000, 113.6254000, 1),
('长沙', '湖南省', '中国', 28.2282000, 112.9388000, 1),
('沈阳', '辽宁省', '中国', 41.8057000, 123.4315000, 1),
('青岛', '山东省', '中国', 36.0671000, 120.3826000, 1),
('合肥', '安徽省', '中国', 31.8206000, 117.2272000, 1),
('大连', '辽宁省', '中国', 38.9140000, 121.6147000, 1),
('厦门', '福建省', '中国', 24.4798000, 118.0819000, 1),
('昆明', '云南省', '中国', 24.8801000, 102.8329000, 1);

INSERT INTO user_settings (setting_key, setting_value, description) VALUES
('aqi_warning_threshold', '150', 'AQI 预警阈值，超过此值触发黄色预警'),
('aqi_danger_threshold', '200', 'AQI 危险阈值，超过此值触发红色预警'),
('pm25_warning_threshold', '115', 'PM2.5 预警阈值 (μg/m³)'),
('collection_interval_minutes', '30', '数据采集间隔（分钟）'),
('cache_ttl_seconds', '300', 'Redis 缓存过期时间（秒）'),
('alert_check_interval_minutes', '10', '预警检查间隔（分钟）');

INSERT INTO aqi_records (city_id, aqi, aqi_level, primary_pollutant, pm25, pm10, so2, no2, co, o3, temperature, humidity, wind_direction, wind_speed, record_time) VALUES
(1, 85, '良', 'PM2.5', 35.50, 68.20, 8.50, 32.00, 0.800, 65.00, 18.50, 55.00, '北风', 2.50, DATE_SUB(NOW(), INTERVAL 0 HOUR)),
(1, 92, '良', 'PM2.5', 42.30, 75.80, 9.20, 35.00, 0.900, 72.00, 19.20, 58.00, '东北风', 2.00, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(1, 78, '良', 'PM10', 30.20, 62.50, 7.80, 28.00, 0.700, 58.00, 17.80, 52.00, '西北风', 3.20, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 95, '良', 'PM2.5', 48.60, 82.30, 10.50, 38.00, 1.000, 78.00, 20.10, 60.00, '东风', 1.80, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(2, 62, '良', 'O3', 22.80, 48.50, 6.20, 25.00, 0.600, 85.00, 22.30, 65.00, '东南风', 3.50, DATE_SUB(NOW(), INTERVAL 0 HOUR)),
(2, 58, '良', 'O3', 18.50, 42.30, 5.80, 22.00, 0.500, 78.00, 21.80, 62.00, '南风', 3.80, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(2, 65, '良', 'PM2.5', 28.60, 52.80, 6.50, 28.00, 0.650, 82.00, 23.10, 68.00, '西南风', 2.80, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(2, 55, '良', 'O3', 15.20, 38.50, 5.50, 20.00, 0.480, 72.00, 21.50, 60.00, '南风', 4.00, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 125, '轻度污染', 'PM2.5', 85.60, 125.30, 15.80, 55.00, 1.500, 42.00, 28.50, 78.00, '北风', 1.20, DATE_SUB(NOW(), INTERVAL 0 HOUR)),
(3, 118, '轻度污染', 'PM2.5', 78.20, 115.80, 14.50, 50.00, 1.300, 45.00, 27.80, 75.00, '东北风', 1.50, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 132, '轻度污染', 'PM2.5', 92.80, 135.20, 16.80, 58.00, 1.600, 38.00, 29.20, 80.00, '西北风', 1.00, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(4, 45, '优', NULL, 12.50, 28.60, 4.20, 18.00, 0.350, 95.00, 26.80, 72.00, '东风', 4.50, DATE_SUB(NOW(), INTERVAL 0 HOUR)),
(4, 42, '优', NULL, 10.20, 25.30, 3.80, 15.00, 0.300, 88.00, 26.20, 70.00, '东南风', 4.80, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(4, 38, '优', NULL, 8.50, 22.80, 3.50, 12.00, 0.280, 82.00, 25.50, 68.00, '东南风', 5.20, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(5, 165, '中度污染', 'PM2.5', 125.80, 185.60, 22.50, 78.00, 2.200, 35.00, 16.80, 68.00, '西风', 0.80, DATE_SUB(NOW(), INTERVAL 0 HOUR)),
(5, 158, '中度污染', 'PM2.5', 118.20, 175.30, 20.80, 72.00, 2.000, 38.00, 16.20, 65.00, '西南风', 1.00, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(5, 175, '中度污染', 'PM2.5', 138.50, 195.80, 25.20, 85.00, 2.500, 32.00, 17.50, 72.00, '西风', 0.50, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(6, 72, '良', 'PM2.5', 28.50, 58.30, 7.20, 32.00, 0.650, 68.00, 20.50, 62.00, '东风', 3.00, DATE_SUB(NOW(), INTERVAL 0 HOUR)),
(6, 68, '良', 'O3', 25.20, 52.80, 6.80, 28.00, 0.580, 75.00, 19.80, 58.00, '东南风', 3.50, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(7, 105, '轻度污染', 'PM10', 65.80, 115.20, 12.50, 48.00, 1.200, 55.00, 24.50, 70.00, '南风', 2.00, DATE_SUB(NOW(), INTERVAL 0 HOUR)),
(8, 88, '良', 'PM2.5', 40.20, 72.50, 9.50, 35.00, 0.850, 62.00, 15.20, 48.00, '东北风', 2.80, DATE_SUB(NOW(), INTERVAL 0 HOUR)),
(9, 98, '良', 'PM2.5', 48.50, 85.20, 10.80, 42.00, 1.000, 58.00, 21.50, 75.00, '西南风', 1.50, DATE_SUB(NOW(), INTERVAL 0 HOUR)),
(10, 75, '良', 'PM2.5', 32.80, 62.50, 8.20, 28.00, 0.720, 72.00, 19.20, 55.00, '东风', 3.20, DATE_SUB(NOW(), INTERVAL 0 HOUR));

INSERT INTO aqi_trends (city_id, trend_date, avg_aqi, max_aqi, min_aqi, avg_pm25, avg_pm10, avg_so2, avg_no2, avg_co, avg_o3, dominant_pollutant) VALUES
(1, CURDATE(), 88, 95, 78, 39.15, 72.20, 9.00, 33.25, 0.850, 68.25, 'PM2.5'),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 105, 145, 65, 58.20, 95.80, 12.50, 45.20, 1.200, 55.30, 'PM2.5'),
(1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 92, 125, 58, 45.60, 82.50, 10.20, 38.50, 0.950, 62.80, 'PM2.5'),
(1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 78, 95, 45, 32.80, 68.20, 8.50, 28.30, 0.680, 78.50, 'O3'),
(1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 65, 88, 32, 25.20, 52.30, 6.80, 22.50, 0.520, 92.80, 'O3'),
(1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 72, 105, 42, 28.50, 62.80, 7.50, 26.80, 0.620, 85.20, 'PM2.5'),
(1, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 85, 115, 55, 38.20, 78.50, 9.80, 35.20, 0.820, 72.50, 'PM2.5'),
(2, CURDATE(), 60, 65, 55, 18.78, 44.03, 6.00, 23.75, 0.558, 79.25, 'O3'),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 58, 85, 35, 18.20, 42.50, 5.80, 22.80, 0.520, 85.60, 'O3'),
(2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 52, 78, 28, 15.80, 38.20, 5.20, 20.50, 0.480, 92.30, 'O3'),
(2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 48, 72, 25, 12.50, 35.80, 4.80, 18.20, 0.420, 98.50, 'O3'),
(2, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 45, 68, 22, 10.80, 32.50, 4.20, 15.80, 0.380, 105.20, 'O3'),
(2, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 55, 82, 32, 16.50, 40.20, 5.50, 21.20, 0.500, 88.30, 'O3'),
(2, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 50, 75, 28, 14.20, 36.80, 5.00, 18.50, 0.450, 95.80, 'O3'),
(3, CURDATE(), 125, 132, 118, 85.53, 125.43, 15.70, 54.33, 1.467, 41.67, 'PM2.5'),
(3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 145, 185, 105, 108.50, 155.80, 18.20, 65.80, 1.850, 32.50, 'PM2.5'),
(3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 138, 175, 108, 98.20, 145.20, 17.50, 62.50, 1.680, 35.80, 'PM2.5'),
(3, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 155, 210, 112, 118.50, 168.80, 20.80, 72.30, 2.100, 28.50, 'PM2.5'),
(4, CURDATE(), 42, 45, 38, 10.40, 25.57, 3.83, 15.00, 0.310, 88.33, 'O3'),
(4, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 38, 52, 25, 9.50, 22.80, 3.50, 12.50, 0.280, 98.50, 'O3'),
(4, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 35, 48, 22, 8.20, 20.50, 3.20, 10.80, 0.250, 105.80, 'O3'),
(5, CURDATE(), 166, 175, 158, 127.50, 185.57, 22.83, 78.33, 2.233, 35.00, 'PM2.5'),
(5, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 185, 245, 135, 148.80, 205.30, 28.50, 92.80, 2.850, 28.30, 'PM2.5'),
(6, CURDATE(), 70, 72, 68, 26.85, 55.55, 7.00, 30.00, 0.615, 71.50, 'PM2.5'),
(7, CURDATE(), 105, 125, 88, 65.80, 115.20, 12.50, 48.00, 1.200, 55.00, 'PM10'),
(8, CURDATE(), 88, 105, 72, 40.20, 72.50, 9.50, 35.00, 0.850, 62.00, 'PM2.5'),
(9, CURDATE(), 98, 118, 82, 48.50, 85.20, 10.80, 42.00, 1.000, 58.00, 'PM2.5'),
(10, CURDATE(), 75, 92, 58, 32.80, 62.50, 8.20, 28.00, 0.720, 72.00, 'PM2.5');

INSERT INTO alerts (city_id, alert_type, alert_level, threshold_value, current_value, message, is_resolved, start_time) VALUES
(5, 'AQI', '红色', 200, 245, '成都AQI达到245，严重污染，请减少户外活动，敏感人群请留在室内', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(3, 'AQI', '橙色', 150, 185, '广州AQI达到185，中度污染，建议敏感人群减少户外活动', 0, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 'PM2.5', '红色', 150, 210, '成都PM2.5浓度严重超标，建议采取防护措施', 1, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(1, 'AQI', '黄色', 100, 145, '北京AQI偏高，注意空气质量变化', 1, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(5, 'AQI', '橙色', 150, 175, '成都空气质量持续恶化，请注意防护', 0, NOW());
