package com.onsiterepair.config;

import cn.hutool.crypto.digest.BCrypt;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;

    @Value("${spring.profiles.active:}")
    private String activeProfile;

    @Override
    public void run(ApplicationArguments args) {
        if ("h2".equals(activeProfile)) {
            try {
                log.info("开始初始化H2数据库...");
                createTables();
                insertDefaultData();
                log.info("H2数据库初始化完成！");
                log.info("========================================");
                log.info("默认测试账号 (密码均为 123456):");
                log.info("用户账号: 13800138001 (测试用户小明)");
                log.info("用户账号: 13800138002 (测试用户小红)");
                log.info("师傅账号: 13900139001 (张师傅-家电维修)");
                log.info("师傅账号: 13900139002 (李师傅-水电维修)");
                log.info("师傅账号: 13900139003 (王师傅-综合维修)");
                log.info("H2控制台: http://localhost:8080/h2-console");
                log.info("========================================");
            } catch (Exception e) {
                log.error("初始化H2数据库失败", e);
            }
        }
    }

    private void createTables() {
        execute("CREATE TABLE IF NOT EXISTS t_user (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "phone VARCHAR(20) NOT NULL UNIQUE, " +
                "password VARCHAR(255) NOT NULL, " +
                "nickname VARCHAR(50), " +
                "avatar VARCHAR(255), " +
                "real_name VARCHAR(50), " +
                "gender INT DEFAULT 0, " +
                "status INT DEFAULT 1, " +
                "create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "deleted INT DEFAULT 0)");

        execute("CREATE TABLE IF NOT EXISTS worker (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "phone VARCHAR(20) NOT NULL UNIQUE, " +
                "password VARCHAR(255) NOT NULL, " +
                "nickname VARCHAR(50), " +
                "avatar VARCHAR(255), " +
                "real_name VARCHAR(50), " +
                "id_card VARCHAR(18), " +
                "id_card_front VARCHAR(255), " +
                "id_card_back VARCHAR(255), " +
                "skills VARCHAR(500), " +
                "certificate VARCHAR(255), " +
                "latitude DECIMAL(10, 7), " +
                "longitude DECIMAL(10, 7), " +
                "address VARCHAR(255), " +
                "rating DECIMAL(3, 2) DEFAULT 5.00, " +
                "order_count INT DEFAULT 0, " +
                "status INT DEFAULT 0, " +
                "create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "deleted INT DEFAULT 0)");

        execute("CREATE TABLE IF NOT EXISTS repair_order (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "order_no VARCHAR(32) NOT NULL UNIQUE, " +
                "user_id BIGINT NOT NULL, " +
                "worker_id BIGINT, " +
                "category VARCHAR(50) NOT NULL, " +
                "fault_type VARCHAR(100) NOT NULL, " +
                "fault_desc VARCHAR(1000) NOT NULL, " +
                "images VARCHAR(2000), " +
                "video VARCHAR(255), " +
                "contact_name VARCHAR(50) NOT NULL, " +
                "contact_phone VARCHAR(20) NOT NULL, " +
                "address VARCHAR(255) NOT NULL, " +
                "latitude DECIMAL(10, 7) NOT NULL, " +
                "longitude DECIMAL(10, 7) NOT NULL, " +
                "appointment_time TIMESTAMP, " +
                "parts_list VARCHAR(1000), " +
                "parts_amount DECIMAL(10, 2) DEFAULT 0, " +
                "labor_amount DECIMAL(10, 2) DEFAULT 0, " +
                "total_amount DECIMAL(10, 2) DEFAULT 0, " +
                "negotiated_amount DECIMAL(10, 2), " +
                "negotiated_note VARCHAR(500), " +
                "negotiation_status INT DEFAULT 0, " +
                "before_images VARCHAR(2000), " +
                "after_images VARCHAR(2000), " +
                "recording_url VARCHAR(255), " +
                "status INT DEFAULT 0, " +
                "grab_start_time TIMESTAMP, " +
                "grab_end_time TIMESTAMP, " +
                "accept_time TIMESTAMP, " +
                "start_time TIMESTAMP, " +
                "finish_time TIMESTAMP, " +
                "cancel_time TIMESTAMP, " +
                "cancel_reason VARCHAR(500), " +
                "pay_time TIMESTAMP, " +
                "pay_type VARCHAR(20), " +
                "pay_trade_no VARCHAR(64), " +
                "warranty_months INT DEFAULT 3, " +
                "warranty_start_time TIMESTAMP, " +
                "warranty_end_time TIMESTAMP, " +
                "create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "deleted INT DEFAULT 0)");

        execute("CREATE TABLE IF NOT EXISTS grab_record (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "order_id BIGINT NOT NULL, " +
                "worker_id BIGINT NOT NULL, " +
                "distance DECIMAL(10, 2), " +
                "grab_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "is_success INT DEFAULT 0)");

        execute("CREATE TABLE IF NOT EXISTS review (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "order_id BIGINT NOT NULL UNIQUE, " +
                "user_id BIGINT NOT NULL, " +
                "worker_id BIGINT NOT NULL, " +
                "rating INT NOT NULL, " +
                "content VARCHAR(1000), " +
                "images VARCHAR(2000), " +
                "status INT DEFAULT 1, " +
                "reply_content VARCHAR(1000), " +
                "reply_time TIMESTAMP, " +
                "create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

        execute("CREATE TABLE IF NOT EXISTS notification (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "user_type INT NOT NULL, " +
                "user_id BIGINT NOT NULL, " +
                "type VARCHAR(50) NOT NULL, " +
                "title VARCHAR(100) NOT NULL, " +
                "content VARCHAR(1000), " +
                "related_id BIGINT, " +
                "is_read INT DEFAULT 0, " +
                "create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

        execute("CREATE TABLE IF NOT EXISTS admin (" +
                "id BIGINT AUTO_INCREMENT PRIMARY KEY, " +
                "username VARCHAR(50) NOT NULL UNIQUE, " +
                "password VARCHAR(255) NOT NULL, " +
                "nickname VARCHAR(50), " +
                "status INT DEFAULT 1, " +
                "create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
    }

    private void insertDefaultData() {
        String encodedPassword = BCrypt.hashpw("123456");
        
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM t_user", Integer.class);
            if (count != null && count == 0) {
                jdbcTemplate.update("INSERT INTO t_user (phone, password, nickname, gender, status) VALUES (?, ?, ?, ?, ?)",
                        "13800138001", encodedPassword, "测试用户小明", 1, 1);
                jdbcTemplate.update("INSERT INTO t_user (phone, password, nickname, gender, status) VALUES (?, ?, ?, ?, ?)",
                        "13800138002", encodedPassword, "测试用户小红", 2, 1);
                log.info("已创建2个测试用户账号");
            }
        } catch (Exception e) {
            log.warn("插入用户数据失败: {}", e.getMessage());
        }

        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM worker", Integer.class);
            if (count != null && count == 0) {
                jdbcTemplate.update("INSERT INTO worker (phone, password, nickname, real_name, skills, latitude, longitude, address, rating, order_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        "13900139001", encodedPassword, "张师傅", "张三", "空调维修,洗衣机维修,冰箱维修",
                        39.904200, 116.407400, "北京市东城区", 4.85, 128, 1);
                jdbcTemplate.update("INSERT INTO worker (phone, password, nickname, real_name, skills, latitude, longitude, address, rating, order_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        "13900139002", encodedPassword, "李师傅", "李四", "水电维修,灯具安装,卫浴维修",
                        39.914200, 116.417400, "北京市朝阳区", 4.92, 256, 1);
                jdbcTemplate.update("INSERT INTO worker (phone, password, nickname, real_name, skills, latitude, longitude, address, rating, order_count, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        "13900139003", encodedPassword, "王师傅", "王五", "家电维修,水电维修",
                        39.894200, 116.397400, "北京市西城区", 4.78, 89, 1);
                log.info("已创建3个测试师傅账号");
            }
        } catch (Exception e) {
            log.warn("插入师傅数据失败: {}", e.getMessage());
        }

        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM admin", Integer.class);
            if (count != null && count == 0) {
                jdbcTemplate.update("INSERT INTO admin (username, password, nickname, status) VALUES (?, ?, ?, ?)",
                        "admin", encodedPassword, "超级管理员", 1);
                log.info("已创建管理员账号");
            }
        } catch (Exception e) {
            log.warn("插入管理员数据失败: {}", e.getMessage());
        }
    }

    private void execute(String sql) {
        try {
            jdbcTemplate.execute(sql);
        } catch (Exception e) {
            log.debug("执行SQL失败（可能表已存在）: {}", e.getMessage());
        }
    }
}
