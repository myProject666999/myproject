package com.construction.company;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.construction.company.mapper")
public class ConstructionCompanyApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConstructionCompanyApplication.class, args);
    }
}
