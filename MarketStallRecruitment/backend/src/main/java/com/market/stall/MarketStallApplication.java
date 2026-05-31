package com.market.stall;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.market.stall.mapper")
public class MarketStallApplication {
    public static void main(String[] args) {
        SpringApplication.run(MarketStallApplication.class, args);
    }
}
