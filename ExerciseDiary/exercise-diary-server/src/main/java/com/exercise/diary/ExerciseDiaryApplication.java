package com.exercise.diary;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.exercise.diary.mapper")
public class ExerciseDiaryApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExerciseDiaryApplication.class, args);
    }

}
