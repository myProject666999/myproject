package com.recruitment;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableCaching
@EnableAsync
@MapperScan("com.recruitment.mapper")
public class OnlineRecruitmentApplication {

    public static void main(String[] args) {
        SpringApplication.run(OnlineRecruitmentApplication.class, args);
    }

}
