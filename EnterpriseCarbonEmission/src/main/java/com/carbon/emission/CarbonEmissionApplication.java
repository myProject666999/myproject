package com.carbon.emission;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.carbon.emission.mapper")
public class CarbonEmissionApplication {
    public static void main(String[] args) {
        SpringApplication.run(CarbonEmissionApplication.class, args);
    }
}
