package com.meeting;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.meeting.mapper")
public class MeetingRoomReservationApplication {

    public static void main(String[] args) {
        SpringApplication.run(MeetingRoomReservationApplication.class, args);
    }
}
