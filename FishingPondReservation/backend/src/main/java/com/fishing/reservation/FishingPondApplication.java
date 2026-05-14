package com.fishing.reservation;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.fishing.reservation.mapper")
public class FishingPondApplication {

    public static void main(String[] args) {
        SpringApplication.run(FishingPondApplication.class, args);
    }

}
