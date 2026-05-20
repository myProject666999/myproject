package com.itinerary;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
@MapperScan("com.itinerary.mapper")
public class ItineraryApplication {
    public static void main(String[] args) {
        SpringApplication.run(ItineraryApplication.class, args);
    }
}
