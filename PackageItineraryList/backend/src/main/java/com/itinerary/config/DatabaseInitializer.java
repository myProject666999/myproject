package com.itinerary.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        logger.info("Checking database initialization...");
        
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'itinerary_list' AND table_name = 'user'",
                Integer.class
            );
            
            if (count == null || count == 0) {
                logger.info("Database not initialized, executing SQL script...");
                executeSqlScript();
                logger.info("Database initialization completed!");
            } else {
                logger.info("Database already exists, checking demo user...");
                ensureDemoUser();
                logger.info("Database check completed!");
            }
        } catch (Exception e) {
            logger.error("Database initialization failed, trying to create database...", e);
            try {
                jdbcTemplate.execute("CREATE DATABASE IF NOT EXISTS itinerary_list DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                executeSqlScript();
                logger.info("Database initialization completed!");
            } catch (Exception ex) {
                logger.error("Database initialization failed", ex);
            }
        }
    }

    private void executeSqlScript() throws Exception {
        ClassPathResource resource = new ClassPathResource("itinerary.sql");
        if (!resource.exists()) {
            logger.error("SQL script file not found in classpath");
            return;
        }
        
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder sql = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("--")) {
                    continue;
                }
                sql.append(line).append(" ");
                if (line.endsWith(";")) {
                    String statement = sql.toString().trim();
                    try {
                        if (!statement.toUpperCase().startsWith("USE ")) {
                            jdbcTemplate.execute(statement);
                        }
                    } catch (Exception e) {
                        logger.warn("SQL execution warning: {}", e.getMessage());
                    }
                    sql.setLength(0);
                }
            }
        }
        
        ensureDemoUser();
    }

    private void ensureDemoUser() {
        try {
            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            String encodedPassword = encoder.encode("demo123");
            
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM user WHERE username = ?",
                Integer.class,
                "demo"
            );
            
            if (count == null || count == 0) {
                jdbcTemplate.update(
                    "INSERT INTO user (username, password, nickname) VALUES (?, ?, ?)",
                    "demo", encodedPassword, "演示用户"
                );
                logger.info("Demo user created successfully");
            } else {
                jdbcTemplate.update(
                    "UPDATE user SET password = ? WHERE username = ?",
                    encodedPassword, "demo"
                );
                logger.info("Demo user password updated successfully");
            }
        } catch (Exception e) {
            logger.error("Failed to ensure demo user", e);
        }
    }
}
