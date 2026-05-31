package com.micro.frontend;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@MapperScan("com.micro.frontend.mapper")
@EnableScheduling
public class MicroFrontendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MicroFrontendApplication.class, args);
        System.out.println("================================================");
        System.out.println("  微前端模块注册与编排中心 启动成功!");
        System.out.println("  服务地址: http://localhost:8080");
        System.out.println("  接口文档: http://localhost:8080/swagger-ui.html");
        System.out.println("================================================");
    }
}
