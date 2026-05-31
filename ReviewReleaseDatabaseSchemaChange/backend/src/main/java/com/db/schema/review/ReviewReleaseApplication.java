package com.db.schema.review;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@MapperScan("com.db.schema.review.mapper")
@EnableAsync
public class ReviewReleaseApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReviewReleaseApplication.class, args);
    }
}
