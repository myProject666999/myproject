package com.smartdoor;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
@MapperScan("com.smartdoor.mapper")
public class SmartDoorLockApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartDoorLockApplication.class, args);
        System.out.println("================================================");
        System.out.println("  长租公寓智能门锁与租约管理系统启动成功!");
        System.out.println("  接口文档: http://127.0.0.1:8080/api/doc.html");
        System.out.println("  Druid监控: http://127.0.0.1:8080/api/druid");
        System.out.println("================================================");
    }
}
