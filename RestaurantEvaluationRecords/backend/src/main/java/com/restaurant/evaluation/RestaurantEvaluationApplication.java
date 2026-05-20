package com.restaurant.evaluation;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.restaurant.evaluation.mapper")
public class RestaurantEvaluationApplication {

    public static void main(String[] args) {
        SpringApplication.run(RestaurantEvaluationApplication.class, args);
    }

}
