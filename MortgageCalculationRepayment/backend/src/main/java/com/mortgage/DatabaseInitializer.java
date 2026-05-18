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
            logger.info("开始导入数据库表结构和初始化数据...");

            executeSqlScript();

            Integer tableCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'mortgage_calculator'",
                Integer.class
            );
            logger.info("✅ 数据库表导入完成，共 {} 张表", tableCount);

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
