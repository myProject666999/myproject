package com.recycling;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.recycling.mapper")
public class RecyclingApplication {
    public static void main(String[] args) {
        SpringApplication.run(RecyclingApplication.class, args);
    }
}
