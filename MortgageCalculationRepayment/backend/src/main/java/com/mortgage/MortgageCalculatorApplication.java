package com.mortgage;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.mortgage.mapper")
public class MortgageCalculatorApplication {
    public static void main(String[] args) {
        SpringApplication.run(MortgageCalculatorApplication.class, args);
    }
}
