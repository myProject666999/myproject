package com.example.water;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WaterReminderApplication {
    public static void main(String[] args) {
        SpringApplication.run(WaterReminderApplication.class, args);
    }
}
