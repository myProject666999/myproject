const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    const dbName = process.env.DB_NAME || 'private_teaching';
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);
    
    console.log('Database created/selected.');

    const createTables = `
      DROP TABLE IF EXISTS \`likes\`;
      DROP TABLE IF EXISTS \`comments\`;
      DROP TABLE IF EXISTS \`community_posts\`;
      DROP TABLE IF EXISTS \`body_tests\`;
      DROP TABLE IF EXISTS \`exercises\`;
      DROP TABLE IF EXISTS \`training_records\`;
      DROP TABLE IF EXISTS \`checkins\`;
      DROP TABLE IF EXISTS \`bookings\`;
      DROP TABLE IF EXISTS \`courses\`;
      DROP TABLE IF EXISTS \`success_stories\`;
      DROP TABLE IF EXISTS \`coaches\`;
      DROP TABLE IF EXISTS \`users\`;

      CREATE TABLE \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`phone\` VARCHAR(11) NOT NULL UNIQUE,
        \`password\` VARCHAR(255) NOT NULL,
        \`name\` VARCHAR(50) NOT NULL,
        \`avatar\` VARCHAR(255) DEFAULT '',
        \`gender\` ENUM('male', 'female') DEFAULT 'male',
        \`birthdate\` DATE NULL,
        \`role\` ENUM('student', 'coach', 'admin') DEFAULT 'student',
        \`status\` ENUM('active', 'inactive') DEFAULT 'active',
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE \`coaches\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`userId\` INT NOT NULL,
        \`title\` VARCHAR(100) DEFAULT '',
        \`specialty\` VARCHAR(500) DEFAULT '',
        \`experience\` INT DEFAULT 0,
        \`introduction\` TEXT,
        \`achievements\` VARCHAR(500) DEFAULT '',
        \`videoUrl\` VARCHAR(500) DEFAULT '',
        \`rating\` DECIMAL(3,2) DEFAULT 5.0,
        \`studentCount\` INT DEFAULT 0,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE \`success_stories\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`coachId\` INT NOT NULL,
        \`title\` VARCHAR(200) NOT NULL,
        \`content\` TEXT,
        \`duration\` VARCHAR(50) DEFAULT '',
        \`results\` VARCHAR(500) DEFAULT '',
        \`beforeImage\` VARCHAR(500) DEFAULT '',
        \`afterImage\` VARCHAR(500) DEFAULT '',
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`coachId\`) REFERENCES \`coaches\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE \`courses\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`coachId\` INT NOT NULL,
        \`name\` VARCHAR(200) NOT NULL,
        \`description\` TEXT,
        \`category\` VARCHAR(100) DEFAULT '',
        \`date\` DATE NOT NULL,
        \`startTime\` TIME NOT NULL,
        \`endTime\` TIME NOT NULL,
        \`capacity\` INT DEFAULT 10,
        \`bookedCount\` INT DEFAULT 0,
        \`price\` DECIMAL(10,2) DEFAULT 0,
        \`location\` VARCHAR(200) DEFAULT '',
        \`status\` ENUM('available', 'full', 'cancelled', 'completed') DEFAULT 'available',
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`coachId\`) REFERENCES \`coaches\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE \`bookings\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`userId\` INT NOT NULL,
        \`courseId\` INT NOT NULL,
        \`status\` ENUM('confirmed', 'waitlist', 'cancelled', 'attended') DEFAULT 'confirmed',
        \`waitlistOrder\` INT DEFAULT 0,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`courseId\`) REFERENCES \`courses\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE \`checkins\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`bookingId\` INT NOT NULL,
        \`userId\` INT NOT NULL,
        \`courseId\` INT NOT NULL,
        \`qrCode\` VARCHAR(255) DEFAULT '',
        \`qrExpireAt\` DATETIME NULL,
        \`checkinTime\` DATETIME NULL,
        \`status\` ENUM('generated', 'scanned', 'used', 'expired') DEFAULT 'generated',
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`bookingId\`) REFERENCES \`bookings\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`courseId\`) REFERENCES \`courses\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE \`training_records\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`userId\` INT NOT NULL,
        \`courseId\` INT NULL,
        \`date\` DATE NOT NULL,
        \`notes\` TEXT,
        \`duration\` INT DEFAULT 0,
        \`calories\` INT DEFAULT 0,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`courseId\`) REFERENCES \`courses\`(\`id\`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE \`exercises\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`trainingRecordId\` INT NOT NULL,
        \`name\` VARCHAR(200) NOT NULL,
        \`sets\` INT DEFAULT 3,
        \`reps\` INT DEFAULT 12,
        \`weight\` DECIMAL(10,2) DEFAULT 0,
        \`notes\` VARCHAR(500) DEFAULT '',
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`trainingRecordId\`) REFERENCES \`training_records\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE \`body_tests\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`userId\` INT NOT NULL,
        \`date\` DATE NOT NULL,
        \`weight\` DECIMAL(10,2) DEFAULT 0,
        \`height\` DECIMAL(10,2) DEFAULT 0,
        \`bmi\` DECIMAL(10,2) DEFAULT 0,
        \`bodyFat\` DECIMAL(10,2) DEFAULT 0,
        \`muscleMass\` DECIMAL(10,2) DEFAULT 0,
        \`water\` DECIMAL(10,2) DEFAULT 0,
        \`boneMass\` DECIMAL(10,2) DEFAULT 0,
        \`metabolism\` DECIMAL(10,2) DEFAULT 0,
        \`waist\` DECIMAL(10,2) DEFAULT 0,
        \`hip\` DECIMAL(10,2) DEFAULT 0,
        \`chest\` DECIMAL(10,2) DEFAULT 0,
        \`notes\` TEXT,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE \`community_posts\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`userId\` INT NOT NULL,
        \`content\` TEXT NOT NULL,
        \`images\` TEXT,
        \`likesCount\` INT DEFAULT 0,
        \`commentsCount\` INT DEFAULT 0,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE \`comments\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`postId\` INT NOT NULL,
        \`userId\` INT NOT NULL,
        \`content\` TEXT NOT NULL,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`postId\`) REFERENCES \`community_posts\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

      CREATE TABLE \`likes\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`postId\` INT NOT NULL,
        \`userId\` INT NOT NULL,
        \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`unique_like\` (\`postId\`, \`userId\`),
        FOREIGN KEY (\`postId\`) REFERENCES \`community_posts\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.query(createTables);
    console.log('Tables created successfully.');

    const hashedPassword = await bcrypt.hash('123456', 10);
    const now = new Date();

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    const formatDate = (date) => date.toISOString().split('T')[0];

    await connection.query(`
      INSERT INTO \`users\` (\`phone\`, \`password\`, \`name\`, \`gender\`, \`role\`) VALUES
      ('13800000000', ?, '管理员', 'male', 'admin'),
      ('13800000001', ?, '张教练', 'male', 'coach'),
      ('13800000002', ?, '李教练', 'female', 'coach'),
      ('13800000003', ?, '王学员', 'male', 'student');
    `, [hashedPassword, hashedPassword, hashedPassword, hashedPassword]);

    const [users] = await connection.query('SELECT * FROM users');
    console.log('Users created.');

    const coachUser1 = users.find(u => u.phone === '13800000001');
    const coachUser2 = users.find(u => u.phone === '13800000002');

    await connection.query(`
      INSERT INTO \`coaches\` (\`userId\`, \`title\`, \`specialty\`, \`experience\`, \`introduction\`, \`achievements\`, \`rating\`, \`studentCount\`) VALUES
      (?, '高级私教', '力量训练、增肌塑形、体能提升', 8, '8年健身教练经验，国家一级健身教练认证。擅长力量训练、增肌塑形，帮助上百名学员达成健身目标。', '国家一级健身教练、ACE认证、TRX认证教练', 4.9, 156),
      (?, '减脂塑形专家', '减脂塑形、产后恢复、瑜伽普拉提', 6, '6年专业健身教练经验，专注女性健身领域。擅长科学减脂、产后恢复训练，帮助学员健康瘦身。', 'ACE私人教练认证、瑜伽导师认证', 4.8, 128);
    `, [coachUser1.id, coachUser2.id]);

    const [coaches] = await connection.query('SELECT * FROM coaches');
    console.log('Coaches created.');

    const coach1 = coaches[0];
    const coach2 = coaches[1];

    await connection.query(`
      INSERT INTO \`courses\` (\`coachId\`, \`name\`, \`description\`, \`category\`, \`date\`, \`startTime\`, \`endTime\`, \`capacity\`, \`bookedCount\`, \`price\`, \`location\`) VALUES
      (?, '基础力量训练', '适合初学者的力量训练课程，学习正确的动作姿势和训练方法。', '力量训练', ?, '09:00:00', '10:00:00', 8, 3, 199, 'A区力量训练区'),
      (?, '高强度间歇训练', '高强度间歇训练，快速燃脂，提升心肺功能。', 'HIIT', ?, '14:00:00', '15:00:00', 10, 6, 229, 'B区有氧训练区'),
      (?, '瑜伽塑形课', '通过瑜伽体式和呼吸练习，塑造优美体态，提升柔韧性。', '瑜伽', ?, '10:00:00', '11:00:00', 12, 8, 179, 'C区瑜伽室'),
      (?, '核心力量训练', '专注核心肌群训练，增强腰腹力量，改善体态。', '核心训练', ?, '16:00:00', '17:00:00', 8, 4, 189, 'A区核心训练区');
    `, [coach1.id, formatDate(tomorrow), coach1.id, formatDate(tomorrow), coach2.id, formatDate(dayAfter), coach2.id, formatDate(dayAfter)]);

    console.log('Courses created.');

    await connection.query(`
      INSERT INTO \`success_stories\` (\`coachId\`, \`title\`, \`content\`, \`duration\`, \`results\`) VALUES
      (?, '3个月增肌12kg', '学员小王，25岁，通过科学的力量训练计划和饮食指导，3个月内成功增肌12kg，体脂率从22%降到15%。从瘦弱体质到健美身材，建立了自信心。', '3个月', '增肌12kg，体脂率下降7%'),
      (?, '从健身小白到力量达人', '学员小李，30岁，零基础开始健身。通过6个月的系统训练，深蹲从空杆到120kg，卧推从20kg到80kg，硬拉从40kg到140kg。不仅身体素质大幅提升，更养成了健康的生活习惯。', '6个月', '深蹲120kg，卧推80kg，硬拉140kg'),
      (?, '产后恢复成功减重18斤', '学员小张，产后6个月开始恢复训练。通过科学的产后恢复计划，3个月内成功减重18斤，盆底肌功能恢复正常，重新找回自信。', '3个月', '减重18斤，盆底肌功能恢复');
    `, [coach1.id, coach1.id, coach2.id]);

    console.log('Success stories created.');
    console.log('');
    console.log('Database initialized successfully!');
    console.log('');
    console.log('Demo accounts:');
    console.log('  Admin:    13800000000 / 123456');
    console.log('  Coach:    13800000001 / 123456 (张教练)');
    console.log('  Coach:    13800000002 / 123456 (李教练)');
    console.log('  Student:  13800000003 / 123456 (王学员)');

  } finally {
    await connection.end();
  }
}

module.exports = { initDatabase };
