package com.onsiterepair;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.onsiterepair.mapper")
public class OnsiteRepairApplication {

    public static void main(String[] args) {
        SpringApplication.run(OnsiteRepairApplication.class, args);
    }
}
