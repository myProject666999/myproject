package com.digitalcard;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.digitalcard.mapper")
public class DigitalCardHolderApplication {
    public static void main(String[] args) {
        SpringApplication.run(DigitalCardHolderApplication.class, args);
    }
}
