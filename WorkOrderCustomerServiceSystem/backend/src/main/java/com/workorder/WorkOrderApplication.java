package com.workorder;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.workorder.mapper")
public class WorkOrderApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkOrderApplication.class, args);
        System.out.println("=============================================");
        System.out.println("  工单/客服系统 启动成功！");
        System.out.println("  访问地址: http://localhost:8080");
        System.out.println("=============================================");
    }
}