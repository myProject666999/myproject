import { getPool } from './db';

const INIT_SQL = `
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
`;

const SAMPLE_DATA_SQL = `
INSERT IGNORE INTO color_schemes (id, name, description) VALUES
(1, '海洋蓝调', '清新的海洋风格配色'),
(2, '日落黄昏', '温暖的黄昏色调'),
(3, '森林绿意', '自然的森林色系');

INSERT IGNORE INTO colors (id, scheme_id, hex, hue, position) VALUES
(1, 1, '#0077B6', 201, 1),
(2, 1, '#00B4D8', 190, 2),
(3, 1, '#90E0EF', 190, 3),
(4, 1, '#CAF0F8', 190, 4),
(5, 1, '#023E8A', 217, 5),
(6, 2, '#FF6B35', 15, 1),
(7, 2, '#F7C59F', 25, 2),
(8, 2, '#EFEFD0', 60, 3),
(9, 2, '#004E89', 210, 4),
(10, 2, '#1A659E', 205, 5),
(11, 3, '#2D6A4F', 152, 1),
(12, 3, '#40916C', 148, 2),
(13, 3, '#52B788', 148, 3),
(14, 3, '#74C69D', 148, 4),
(15, 3, '#95D5B2', 148, 5);
`;

export async function initDatabase() {
  try {
    const pool = getPool();
    
    const connection = await pool.getConnection();
    
    await connection.query('CREATE DATABASE IF NOT EXISTS color_scheme_sharing DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    await connection.query('USE color_scheme_sharing');
    
    const statements = INIT_SQL.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      await connection.query(stmt);
    }
    
    try {
      const sampleStatements = SAMPLE_DATA_SQL.split(';').filter(s => s.trim());
      for (const stmt of sampleStatements) {
        await connection.query(stmt);
      }
    } catch (sampleError) {
      console.log('Sample data may already exist, skipping sample data insertion');
    }
    
    connection.release();
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}
