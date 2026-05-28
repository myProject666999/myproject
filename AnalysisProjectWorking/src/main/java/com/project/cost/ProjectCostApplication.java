package com.project.cost;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@MapperScan("com.project.cost.mapper")
@EnableCaching
public class ProjectCostApplication {
    public static void main(String[] args) {
        SpringApplication.run(ProjectCostApplication.class, args);
    }
}
