-- =====================================================
-- Campsite & RV Parking Reservation Platform Database
-- =====================================================

DROP DATABASE IF EXISTS campsite_reservation;
CREATE DATABASE campsite_reservation DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE campsite_reservation;

-- =====================================================
-- users
-- =====================================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    role ENUM('admin', 'owner', 'user') DEFAULT 'user',
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- campsites
-- =====================================================
CREATE TABLE campsites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    owner_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    province VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    cover_image VARCHAR(255),
    images JSON,
    facilities JSON,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    status TINYINT DEFAULT 0,
    open_time TIME,
    close_time TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner (owner_id),
    INDEX idx_city (city),
    INDEX idx_status (status),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- spot_types
-- =====================================================
CREATE TABLE spot_types (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- spots
-- =====================================================
CREATE TABLE spots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    campsite_id BIGINT NOT NULL,
    type_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    area DECIMAL(10, 2),
    max_occupancy INT,
    max_vehicle_length DECIMAL(5, 2),
    has_electricity TINYINT DEFAULT 0,
    has_water TINYINT DEFAULT 0,
    has_sewage TINYINT DEFAULT 0,
    price_per_day DECIMAL(10, 2) NOT NULL,
    weekend_price DECIMAL(10, 2),
    holiday_price DECIMAL(10, 2),
    images JSON,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campsite_id) REFERENCES campsites(id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES spot_types(id),
    INDEX idx_campsite (campsite_id),
    INDEX idx_type (type_id),
    INDEX idx_status (status),
    INDEX idx_price (price_per_day)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- reservations
-- =====================================================
CREATE TABLE reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_no VARCHAR(32) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    campsite_id BIGINT NOT NULL,
    spot_id BIGINT NOT NULL,
    checkin_date DATE NOT NULL,
    checkout_date DATE NOT NULL,
    days INT NOT NULL,
    guest_count INT DEFAULT 1,
    vehicle_info JSON,
    contact_name VARCHAR(50) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    base_amount DECIMAL(10, 2) NOT NULL,
    utility_deposit DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
    paid_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    cancel_reason VARCHAR(255),
    checkin_time TIMESTAMP NULL,
    checkout_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (campsite_id) REFERENCES campsites(id),
    FOREIGN KEY (spot_id) REFERENCES spots(id),
    INDEX idx_user (user_id),
    INDEX idx_campsite (campsite_id),
    INDEX idx_spot (spot_id),
    INDEX idx_checkin (checkin_date),
    INDEX idx_status (status),
    INDEX idx_reservation_no (reservation_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- rental_categories
-- =====================================================
CREATE TABLE rental_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    icon VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- rental_items
-- =====================================================
CREATE TABLE rental_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    campsite_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    total_quantity INT NOT NULL,
    available_quantity INT NOT NULL,
    price_per_day DECIMAL(10, 2) NOT NULL,
    deposit DECIMAL(10, 2) DEFAULT 0.00,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campsite_id) REFERENCES campsites(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES rental_categories(id),
    INDEX idx_campsite (campsite_id),
    INDEX idx_category (category_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- rental_orders
-- =====================================================
CREATE TABLE rental_orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(32) NOT NULL UNIQUE,
    reservation_id BIGINT,
    user_id BIGINT NOT NULL,
    campsite_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL,
    rental_fee DECIMAL(10, 2) NOT NULL,
    deposit DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'rented', 'returned', 'lost', 'damaged', 'cancelled') DEFAULT 'pending',
    picked_up_at TIMESTAMP NULL,
    returned_at TIMESTAMP NULL,
    damage_fee DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (campsite_id) REFERENCES campsites(id),
    FOREIGN KEY (item_id) REFERENCES rental_items(id),
    INDEX idx_reservation (reservation_id),
    INDEX idx_user (user_id),
    INDEX idx_item (item_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- utility_poles
-- =====================================================
CREATE TABLE utility_poles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    campsite_id BIGINT NOT NULL,
    spot_id BIGINT,
    pole_no VARCHAR(50) NOT NULL,
    type ENUM('electric', 'water', 'both') DEFAULT 'both',
    status TINYINT DEFAULT 1,
    initial_electric_reading DECIMAL(10, 2) DEFAULT 0.00,
    initial_water_reading DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (campsite_id) REFERENCES campsites(id) ON DELETE CASCADE,
    FOREIGN KEY (spot_id) REFERENCES spots(id) ON DELETE SET NULL,
    UNIQUE KEY uk_pole_no (campsite_id, pole_no),
    INDEX idx_campsite (campsite_id),
    INDEX idx_spot (spot_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- utility_usage
-- =====================================================
CREATE TABLE utility_usage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    pole_id BIGINT NOT NULL,
    start_electric_reading DECIMAL(10, 2) NOT NULL,
    end_electric_reading DECIMAL(10, 2),
    electric_usage DECIMAL(10, 2),
    start_water_reading DECIMAL(10, 2) NOT NULL,
    end_water_reading DECIMAL(10, 2),
    water_usage DECIMAL(10, 2),
    electric_price DECIMAL(8, 4),
    water_price DECIMAL(8, 4),
    electric_fee DECIMAL(10, 2),
    water_fee DECIMAL(10, 2),
    total_fee DECIMAL(10, 2),
    status ENUM('active', 'settled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    FOREIGN KEY (pole_id) REFERENCES utility_poles(id),
    INDEX idx_reservation (reservation_id),
    INDEX idx_pole (pole_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- checkin_records
-- =====================================================
CREATE TABLE checkin_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    checkin_code VARCHAR(32) NOT NULL UNIQUE,
    qr_code VARCHAR(255),
    checkin_method ENUM('code', 'qr', 'manual'),
    checked_by BIGINT,
    guests JSON,
    vehicle_plate VARCHAR(20),
    remark VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (checked_by) REFERENCES users(id),
    INDEX idx_reservation (reservation_id),
    INDEX idx_checkin_code (checkin_code),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- reviews
-- =====================================================
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    campsite_id BIGINT NOT NULL,
    reservation_id BIGINT NOT NULL,
    rating TINYINT NOT NULL,
    location_rating TINYINT,
    facility_rating TINYINT,
    service_rating TINYINT,
    content TEXT,
    images JSON,
    is_guide TINYINT DEFAULT 0,
    guide_title VARCHAR(200),
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    status TINYINT DEFAULT 1,
    is_verified TINYINT DEFAULT 0,
    ip_address VARCHAR(50),
    device_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (campsite_id) REFERENCES campsites(id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(id),
    UNIQUE KEY uk_user_reservation (user_id, reservation_id),
    INDEX idx_campsite (campsite_id),
    INDEX idx_user (user_id),
    INDEX idx_is_guide (is_guide),
    INDEX idx_created_at (created_at),
    INDEX idx_ip_address (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- review_comments
-- =====================================================
CREATE TABLE review_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    review_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_id BIGINT,
    content TEXT NOT NULL,
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES review_comments(id) ON DELETE CASCADE,
    INDEX idx_review (review_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- cancellation_rules
-- =====================================================
CREATE TABLE cancellation_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    campsite_id BIGINT,
    name VARCHAR(100) NOT NULL,
    days_before_checkin INT NOT NULL,
    refund_percentage INT NOT NULL,
    description VARCHAR(255),
    is_default TINYINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (campsite_id) REFERENCES campsites(id) ON DELETE CASCADE,
    INDEX idx_campsite (campsite_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- system_config
-- =====================================================
CREATE TABLE system_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Initial Data
-- =====================================================

INSERT INTO spot_types (name, description) VALUES
('RV Spot', 'RV parking spot with utilities'),
('Tent Spot', 'Area for pitching tents'),
('Self-drive Spot', 'Vehicle parking spot'),
('Glamping Spot', 'Luxury camping experience');

INSERT INTO rental_categories (name, description, sort_order) VALUES
('Tents', 'Camping tents', 1),
('Sleeping Gear', 'Sleeping bags, pads', 2),
('BBQ Equipment', 'Grills, pans', 3),
('Outdoor Furniture', 'Tables, chairs', 4),
('Lighting', 'Camp lights, headlamps', 5),
('Kitchenware', 'Pots, utensils', 6);

INSERT INTO cancellation_rules (name, days_before_checkin, refund_percentage, description, is_default) VALUES
('7+ days', 7, 100, 'Full refund if cancelled 7+ days before check-in', 1),
('3-7 days', 3, 70, '70% refund if cancelled 3-7 days before check-in', 0),
('1-3 days', 1, 30, '30% refund if cancelled 1-3 days before check-in', 0),
('Same day', 0, 0, 'No refund for same day cancellation', 0);

INSERT INTO system_config (config_key, config_value, description) VALUES
('electricity_price', '1.50', 'Electricity price per kWh'),
('water_price', '5.00', 'Water price per ton'),
('utility_deposit', '200.00', 'Utility deposit amount'),
('review_limit_per_user', '1', 'Review limit per reservation'),
('anti_flood_interval', '300', 'Anti-flood interval in seconds');
