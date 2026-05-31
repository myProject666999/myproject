package com.port.container;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ContainerYardApplication {

    public static void main(String[] args) {
        SpringApplication.run(ContainerYardApplication.class, args);
        System.out.println("===== 港口集装箱堆场调度可视化系统启动成功 =====");
        System.out.println("API文档: http://localhost:8080/api/doc.html");
    }
}
