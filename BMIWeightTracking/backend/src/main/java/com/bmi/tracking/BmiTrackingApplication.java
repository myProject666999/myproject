package com.bmi.tracking;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.bmi.tracking.mapper")
public class BmiTrackingApplication {
    public static void main(String[] args) {
        SpringApplication.run(BmiTrackingApplication.class, args);
    }
}
