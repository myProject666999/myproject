package com.skiresort.ticketing;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.skiresort.ticketing.mapper")
public class SkiResortTicketingApplication {

    public static void main(String[] args) {
        SpringApplication.run(SkiResortTicketingApplication.class, args);
    }
}
