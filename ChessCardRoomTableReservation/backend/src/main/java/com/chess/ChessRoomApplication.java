package com.chess;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.chess.mapper")
public class ChessRoomApplication {
    public static void main(String[] args) {
        SpringApplication.run(ChessRoomApplication.class, args);
    }
}
