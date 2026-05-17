package com.mortgage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Lazy;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class DatabaseConnectionChecker implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConnectionChecker.class);

    private final JdbcTemplate jdbcTemplate;
    private final DatabaseInitializer databaseInitializer;

    public DatabaseConnectionChecker(JdbcTemplate jdbcTemplate, @Lazy DatabaseInitializer databaseInitializer) {
        this.jdbcTemplate = jdbcTemplate;
        this.databaseInitializer = databaseInitializer;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            logger.info("========================================");
            logger.info("✅ 数据库连接成功!");
            logger.info("========================================");

            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'mortgage_calculator'",
                Integer.class
            );

            if (count == null || count == 0) {
                logger.info("数据库中没有表，开始自动初始化...");
                databaseInitializer.initializeDatabase();
                logger.info("✅ 数据库初始化完成!");
            } else {
                logger.info("✅ 数据库表数量: {}", count);
                try {
                    Integer schemeCount = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM loan_scheme",
                        Integer.class
                    );
                    logger.info("✅ 贷款方案数量: {}", schemeCount);
                } catch (Exception e) {
                    logger.warn("⚠️  loan_scheme 表不存在，开始初始化...");
                    databaseInitializer.initializeDatabase();
                }
            }
        } catch (Exception e) {
            logger.error("========================================");
            logger.error("❌ 数据库连接失败!");
            logger.error("错误信息: {}", e.getMessage());
            logger.error("========================================");
            logger.error("请检查:");
            logger.error("1. MySQL 服务是否启动 (端口 3306)");
            logger.error("2. 数据库连接配置是否正确 (application.yml)");
            logger.error("3. root 用户密码是否为 123456");
        }
    }
}
