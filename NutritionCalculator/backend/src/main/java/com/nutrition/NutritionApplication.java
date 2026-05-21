package com.nutrition;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.nutrition.mapper")
public class NutritionApplication {

    public static void main(String[] args) {
        SpringApplication.run(NutritionApplication.class, args);
    }
}
