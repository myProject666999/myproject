
package com.beautyhair;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.beautyhair.mapper")
public class BeautyHairApplication {
    public static void main(String[] args) {
        SpringApplication.run(BeautyHairApplication.class, args);
        System.out.println("========================================");
        System.out.println("  美容美发管理系统启动成功!");
        System.out.println("  访问地址: http://localhost:8080/api");
        System.out.println("  接口文档: http://localhost:8080/api/doc.html");
        System.out.println("========================================");
    }
}
