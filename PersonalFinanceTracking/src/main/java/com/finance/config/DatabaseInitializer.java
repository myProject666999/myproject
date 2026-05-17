package com.finance.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import javax.sql.DataSource;

@Configuration
public class DatabaseInitializer {

    @Bean
    public DataSource dataSource() {
        DriverManagerDataSource dataSource = new DriverManagerDataSource();
        dataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        dataSource.setUrl("jdbc:mysql://127.0.0.1:3306/?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true");
        dataSource.setUsername("root");
        dataSource.setPassword("123456");

        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        try {
            Integer exists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = 'personal_finance'",
                Integer.class);
            if (exists == null || exists == 0) {
                jdbcTemplate.execute("CREATE DATABASE personal_finance DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                System.out.println("数据库 personal_finance 创建成功");
            } else {
                System.out.println("数据库 personal_finance 已存在，跳过创建");
            }
        } catch (Exception e) {
            System.err.println("数据库初始化警告: " + e.getMessage());
        }

        DriverManagerDataSource appDataSource = new DriverManagerDataSource();
        appDataSource.setDriverClassName("com.mysql.cj.jdbc.Driver");
        appDataSource.setUrl("jdbc:mysql://127.0.0.1:3306/personal_finance?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true");
        appDataSource.setUsername("root");
        appDataSource.setPassword("123456");

        return appDataSource;
    }
}
