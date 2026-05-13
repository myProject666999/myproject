package com.gym.membership;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.gym.membership.mapper")
@EnableScheduling
public class GymMembershipApplication {
    public static void main(String[] args) {
        SpringApplication.run(GymMembershipApplication.class, args);
    }
}
