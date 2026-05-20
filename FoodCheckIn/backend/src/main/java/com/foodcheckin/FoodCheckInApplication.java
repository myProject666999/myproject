package com.foodcheckin;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.foodcheckin.mapper")
public class FoodCheckInApplication {
    public static void main(String[] args) {
        SpringApplication.run(FoodCheckInApplication.class, args);
    }
}
