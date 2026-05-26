package com.training.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class DbMigrationConfig implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE training MODIFY COLUMN qr_code TEXT");
            log.info("Updated training.qr_code column to TEXT");
        } catch (Exception e) {
            log.info("training.qr_code column is already TEXT or update failed: {}", e.getMessage());
        }
        try {
            jdbcTemplate.execute("ALTER TABLE checkin_session MODIFY COLUMN qr_code_content TEXT");
            log.info("Updated checkin_session.qr_code_content column to TEXT");
        } catch (Exception e) {
            log.info("checkin_session.qr_code_content column is already TEXT or update failed: {}", e.getMessage());
        }
    }
}
