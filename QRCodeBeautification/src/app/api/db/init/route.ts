import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export async function POST() {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();

    await connection.query("CREATE DATABASE IF NOT EXISTS qrcode_beautification DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    await connection.query("USE qrcode_beautification");

    await connection.query(`
      CREATE TABLE IF NOT EXISTS qrcode_history (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
        content TEXT NOT NULL COMMENT '二维码内容',
        qr_color VARCHAR(20) NOT NULL DEFAULT '#000000' COMMENT '二维码颜色',
        bg_color VARCHAR(20) NOT NULL DEFAULT '#ffffff' COMMENT '背景颜色',
        error_level VARCHAR(5) NOT NULL DEFAULT 'M' COMMENT '容错级别: L(7%), M(15%), Q(25%), H(30%)',
        dot_style VARCHAR(20) NOT NULL DEFAULT 'rounded' COMMENT '圆点样式: square, rounded, dots',
        logo_data LONGTEXT NULL COMMENT 'Logo图片Base64数据',
        logo_size DECIMAL(3,2) NOT NULL DEFAULT 0.20 COMMENT 'Logo占比 (0.1-0.3)',
        margin INT NOT NULL DEFAULT 2 COMMENT '边距',
        width INT NOT NULL DEFAULT 300 COMMENT '二维码宽度',
        qr_image LONGTEXT NOT NULL COMMENT '生成的二维码图片Base64',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_created_at (created_at),
        INDEX idx_content (content(255))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='二维码生成历史记录表'
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
        setting_key VARCHAR(100) NOT NULL UNIQUE COMMENT '设置键',
        setting_value TEXT NULL COMMENT '设置值',
        description VARCHAR(255) NULL COMMENT '设置描述',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户设置表'
    `);

    const [settings] = await connection.query("SELECT COUNT(*) as count FROM user_settings");
    if ((settings as [{ count: number }])[0].count === 0) {
      await connection.query(`
        INSERT INTO user_settings (setting_key, setting_value, description) VALUES
        ('default_qr_color', '#000000', '默认二维码颜色'),
        ('default_bg_color', '#ffffff', '默认背景颜色'),
        ('default_error_level', 'M', '默认容错级别'),
        ('default_dot_style', 'rounded', '默认圆点样式'),
        ('default_logo_size', '0.20', '默认Logo占比'),
        ('default_margin', '2', '默认边距'),
        ('default_width', '300', '默认宽度')
      `);
    }

    connection.release();

    return NextResponse.json({
      success: true,
      message: "数据库初始化成功",
    });
  } catch (error) {
    console.error("Database initialization error:", error);
    return NextResponse.json(
      { success: false, error: "数据库初始化失败" },
      { status: 500 }
    );
  }
}
