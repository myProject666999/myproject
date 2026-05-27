package com.clothing.ecommerce;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
@MapperScan("com.clothing.ecommerce.mapper")
public class ClothingEcommerceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ClothingEcommerceApplication.class, args);
    }
}
