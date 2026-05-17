package com.family.ledger;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.family.ledger.mapper")
public class FamilyLedgerApplication {
    public static void main(String[] args) {
        SpringApplication.run(FamilyLedgerApplication.class, args);
    }
}
