package com.creator.platform;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableRetry
@MapperScan("com.creator.platform.mapper")
public class CreatorPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(CreatorPlatformApplication.class, args);
    }
}
