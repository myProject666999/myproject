package com.nutrition.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

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
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'nutrition_calculator' AND table_name = 'food'",
                Integer.class
            );

            if (count == null || count == 0) {
                logger.info("Database tables not found, starting initialization...");
                initializeDatabase();
            } else {
                logger.info("Database tables already exist.");
                Integer foodCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM food", Integer.class);
                if (foodCount == null || foodCount == 0) {
                    logger.info("Food data not found, importing food data...");
                    importFoodData();
                }
            }
        } catch (Exception e) {
            logger.warn("Database check failed, attempting to create database: {}", e.getMessage());
            createDatabaseAndTables();
        }
    }

    private void createDatabaseAndTables() {
        try {
            Connection conn = DriverManager.getConnection(
                "jdbc:mysql://127.0.0.1:3306/?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true",
                "root",
                "123456"
            );
            Statement stmt = conn.createStatement();

            stmt.execute("CREATE DATABASE IF NOT EXISTS nutrition_calculator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            stmt.execute("USE nutrition_calculator");

            executeSqlScript(stmt, "sql/init_tables.sql");

            stmt.close();
            conn.close();
            logger.info("Database and tables created successfully!");
        } catch (Exception e) {
            logger.error("Failed to create database: {}", e.getMessage());
        }
    }

    private void initializeDatabase() {
        try {
            executeSqlScript("sql/init_tables.sql");
            importFoodData();
            logger.info("Database initialized successfully!");
        } catch (Exception e) {
            logger.error("Failed to initialize database: {}", e.getMessage());
        }
    }

    private void importFoodData() {
        try {
            executeSqlScript("sql/food_data.sql");
            logger.info("Food data imported successfully!");
        } catch (Exception e) {
            logger.error("Failed to import food data: {}", e.getMessage());
        }
    }

    private void executeSqlScript(String resourcePath) throws Exception {
        ClassPathResource resource = new ClassPathResource(resourcePath);
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            List<String> statements = parseSqlStatements(reader);
            for (String sql : statements) {
                if (!sql.trim().isEmpty()) {
                    jdbcTemplate.execute(sql);
                }
            }
        }
    }

    private void executeSqlScript(Statement stmt, String resourcePath) throws Exception {
        ClassPathResource resource = new ClassPathResource(resourcePath);
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
            List<String> statements = parseSqlStatements(reader);
            for (String sql : statements) {
                if (!sql.trim().isEmpty()) {
                    stmt.execute(sql);
                }
            }
        }
    }

    private List<String> parseSqlStatements(BufferedReader reader) throws Exception {
        List<String> statements = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        String line;
        boolean inMultiLineComment = false;

        while ((line = reader.readLine()) != null) {
            String trimmedLine = line.trim();

            if (trimmedLine.startsWith("--") || trimmedLine.isEmpty()) {
                continue;
            }

            if (trimmedLine.startsWith("/*")) {
                inMultiLineComment = true;
            }
            if (inMultiLineComment) {
                if (trimmedLine.endsWith("*/")) {
                    inMultiLineComment = false;
                }
                continue;
            }

            current.append(line).append(" ");

            if (trimmedLine.endsWith(";")) {
                statements.add(current.toString().trim());
                current = new StringBuilder();
            }
        }

        if (current.length() > 0 && current.toString().trim().length() > 0) {
            statements.add(current.toString().trim());
        }

        return statements;
    }
}
