package com.health.physical;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.health.physical.mapper")
public class PhysicalExaminationApplication {
    public static void main(String[] args) {
        SpringApplication.run(PhysicalExaminationApplication.class, args);
    }
}
