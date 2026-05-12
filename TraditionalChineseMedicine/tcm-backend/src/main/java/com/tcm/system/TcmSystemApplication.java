package com.tcm.system;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.tcm.system.repository")
public class TcmSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(TcmSystemApplication.class, args);
    }
}
