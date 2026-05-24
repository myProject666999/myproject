package com.logistics;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
@MapperScan("com.logistics.mapper")
public class LogisticsExpressApplication {
    public static void main(String[] args) {
        SpringApplication.run(LogisticsExpressApplication.class, args);
    }
}
