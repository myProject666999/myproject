CREATE DATABASE IF NOT EXISTS color_scheme_sharing DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE color_scheme_sharing;

CREATE TABLE IF NOT EXISTS color_schemes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS colors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scheme_id INT NOT NULL,
    hex VARCHAR(7) NOT NULL,
    hue DECIMAL(6,2) DEFAULT 0,
    position INT NOT NULL,
    FOREIGN KEY (scheme_id) REFERENCES color_schemes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scheme_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (scheme_id) REFERENCES color_schemes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_colors_scheme_id ON colors(scheme_id);
CREATE INDEX idx_colors_hue ON colors(hue);
CREATE INDEX idx_favorites_scheme_id ON favorites(scheme_id);

INSERT INTO color_schemes (name, description) VALUES
('海洋蓝调', '清新的海洋风格配色'),
('日落黄昏', '温暖的黄昏色调'),
('森林绿意', '自然的森林色系');

INSERT INTO colors (scheme_id, hex, hue, position) VALUES
(1, '#0077B6', 201, 1),
(1, '#00B4D8', 190, 2),
(1, '#90E0EF', 190, 3),
(1, '#CAF0F8', 190, 4),
(1, '#023E8A', 217, 5),
(2, '#FF6B35', 15, 1),
(2, '#F7C59F', 25, 2),
(2, '#EFEFD0', 60, 3),
(2, '#004E89', 210, 4),
(2, '#1A659E', 205, 5),
(3, '#2D6A4F', 152, 1),
(3, '#40916C', 148, 2),
(3, '#52B788', 148, 3),
(3, '#74C69D', 148, 4),
(3, '#95D5B2', 148, 5);
