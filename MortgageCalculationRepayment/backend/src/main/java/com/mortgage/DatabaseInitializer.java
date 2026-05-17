package com.mortgage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class DatabaseInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public DatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void initializeDatabase() {
        try {
            logger.info("开始检查并初始化数据库...");

            Integer dbExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = 'mortgage_calculator'",
                Integer.class
            );

            if (dbExists == null || dbExists == 0) {
                logger.info("数据库不存在，创建数据库...");
                jdbcTemplate.execute("CREATE DATABASE mortgage_calculator DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                logger.info("数据库创建成功！");
            } else {
                logger.info("数据库已存在");
            }

            jdbcTemplate.execute("USE mortgage_calculator");

            Integer tableCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'mortgage_calculator'",
                Integer.class
            );

            if (tableCount == null || tableCount == 0) {
                logger.info("数据库表不存在，开始导入表结构...");
                executeSqlScript();
                logger.info("数据库表导入成功！");
            } else {
                logger.info("数据库表已存在，数量: {}", tableCount);
            }

        } catch (Exception e) {
            logger.error("数据库初始化失败: {}", e.getMessage(), e);
        }
    }

    private void executeSqlScript() throws Exception {
        ClassPathResource resource = new ClassPathResource("sql/mortgage_calculator.sql");
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {

            StringBuilder sqlBuilder = new StringBuilder();
            String line;
            List<String> statements = new ArrayList<>();

            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("--") || line.startsWith("/*")) {
                    continue;
                }
                sqlBuilder.append(line).append(" ");
                if (line.endsWith(";")) {
                    String sql = sqlBuilder.toString().trim();
                    if (!sql.isEmpty()) {
                        statements.add(sql);
                    }
                    sqlBuilder = new StringBuilder();
                }
            }

            for (String sql : statements) {
                try {
                    jdbcTemplate.execute(sql);
                } catch (Exception e) {
                    logger.warn("执行SQL失败: {}", sql.substring(0, Math.min(50, sql.length())));
                }
            }
        }
    }
}
