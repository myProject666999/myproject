package com.community.gridgovernance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GridGovernanceApplication {
    public static void main(String[] args) {
        SpringApplication.run(GridGovernanceApplication.class, args);
    }
}
