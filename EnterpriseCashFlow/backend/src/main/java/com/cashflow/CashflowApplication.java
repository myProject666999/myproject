package com.cashflow;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.cashflow.mapper")
public class CashflowApplication {
    public static void main(String[] args) {
        SpringApplication.run(CashflowApplication.class, args);
    }
}
