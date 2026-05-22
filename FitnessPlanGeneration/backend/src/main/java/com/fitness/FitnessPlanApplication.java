package com.fitness;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.fitness.mapper")
public class FitnessPlanApplication {
    public static void main(String[] args) {
        SpringApplication.run(FitnessPlanApplication.class, args);
    }
}
