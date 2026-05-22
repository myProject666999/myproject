package com.medication;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.medication.mapper")
public class MedicationReminderApplication {
    public static void main(String[] args) {
        SpringApplication.run(MedicationReminderApplication.class, args);
    }
}
