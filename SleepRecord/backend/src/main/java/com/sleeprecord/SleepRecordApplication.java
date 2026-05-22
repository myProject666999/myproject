package com.sleeprecord;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.sleeprecord.mapper")
public class SleepRecordApplication {
    public static void main(String[] args) {
        SpringApplication.run(SleepRecordApplication.class, args);
    }
}
