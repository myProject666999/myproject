package com.birthdayreminder;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.birthdayreminder.mapper")
public class BirthdayReminderApplication {
    public static void main(String[] args) {
        SpringApplication.run(BirthdayReminderApplication.class, args);
    }
}
