package com.fmr;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.fmr.mapper")
public class FamilyMedicalRecordsApplication {
    public static void main(String[] args) {
        SpringApplication.run(FamilyMedicalRecordsApplication.class, args);
    }
}
