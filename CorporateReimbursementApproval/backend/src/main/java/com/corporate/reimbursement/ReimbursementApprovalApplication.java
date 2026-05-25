package com.corporate.reimbursement;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableScheduling
@MapperScan("com.corporate.reimbursement.mapper")
public class ReimbursementApprovalApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReimbursementApprovalApplication.class, args);
    }
}