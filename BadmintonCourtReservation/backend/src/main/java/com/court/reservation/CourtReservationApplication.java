package com.court.reservation;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.court.reservation.mapper")
public class CourtReservationApplication {

    public static void main(String[] args) {
        SpringApplication.run(CourtReservationApplication.class, args);
    }
}