package com.mindmap;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.mindmap.mapper")
public class MindmapApplication {
    public static void main(String[] args) {
        SpringApplication.run(MindmapApplication.class, args);
    }
}
