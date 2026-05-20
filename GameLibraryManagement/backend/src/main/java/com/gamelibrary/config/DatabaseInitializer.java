package com.gamelibrary.config;

import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            log.info("数据库连接正常，表结构已存在");
        } catch (Exception e) {
            log.warn("数据库或表不存在，开始初始化...");
            initializeDatabase();
        }
    }

    private void initializeDatabase() {
        try {
            Connection conn = DriverManager.getConnection(
                    "jdbc:mysql://127.0.0.1:3306?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true",
                    "root",
                    "123456"
            );
            Statement stmt = conn.createStatement();
            stmt.execute("CREATE DATABASE IF NOT EXISTS game_library DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            stmt.close();
            conn.close();
            log.info("数据库创建成功");

            List<String> sqlStatements = loadSqlStatements();
            for (String sql : sqlStatements) {
                if (sql.trim().isEmpty() || sql.trim().startsWith("--")) {
                    continue;
                }
                try {
                    jdbcTemplate.execute(sql);
                } catch (Exception ex) {
                    log.warn("执行SQL警告: {}", ex.getMessage());
                }
            }
            log.info("数据库表结构和数据初始化完成");
        } catch (Exception e) {
            log.error("数据库初始化失败", e);
        }
    }

    private List<String> loadSqlStatements() {
        List<String> statements = new ArrayList<>();
        try {
            ClassPathResource resource = new ClassPathResource("init.sql");
            BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("--")) {
                    continue;
                }
                sb.append(line).append(" ");
                if (line.endsWith(";")) {
                    statements.add(sb.toString());
                    sb = new StringBuilder();
                }
            }
            reader.close();
        } catch (Exception e) {
            log.error("加载SQL脚本失败", e);
        }
        return statements;
    }
}
