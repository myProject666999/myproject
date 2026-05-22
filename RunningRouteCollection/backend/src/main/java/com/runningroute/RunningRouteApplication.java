package com.runningroute;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.runningroute.mapper")
public class RunningRouteApplication {
    public static void main(String[] args) {
        SpringApplication.run(RunningRouteApplication.class, args);
    }
}
